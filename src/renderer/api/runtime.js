const { ipcRenderer } = require('electron');
const url = require('url');

const Event = require('./event');
const constants = require('../../common/constants');
const Port = require('./runtime/port')

class Runtime {

  constructor(context, extensionId, isBackgroundPage) {
    this.context = context;
    this.id = extensionId;
    this.isBackgroundPage = isBackgroundPage;
    this.originResultID = 1;

    this.onConnect = new Event()
    this.onMessage = new Event()
    this.onInstalled = new Event()
    this.onStartup = new Event()
    this.onUpdateAvailable = new Event()
    this.onSuspend = new Event()

    this.getURL = this.getURL.bind(this)
    this.getPlatformInfo = this.getPlatformInfo.bind(this)
    this.connect = this.connect.bind(this)
    this.sendMessage = this.sendMessage.bind(this)
    this.getManifest = this.getManifest.bind(this)
    this.setUninstallURL = this.setUninstallURL.bind(this)
    this.incrementOriginResultID = this.incrementOriginResultID.bind(this)
  }

  getURL(path) {
    const finalPath = path && path.startsWith('/') ? path : `/${path}`

    return url.format({
      protocol: constants.EXTENSION_PROTOCOL,
      slashes: true,
      hostname: this.id,
      pathname: path
    })
  }

  getPlatformInfo() {
    const archMapNodeChrome = {
      'arm': 'arm',
      'ia32': 'x86-32',
      'x64': 'x86-64'
    }
    const osMapNodeChrome = {
      'darwin': 'mac',
      'freebsd': 'openbsd',
      'linux': 'linux',
      'sunos': 'linux',
      'win32': 'win'
    }

    const arch = archMapNodeChrome[process.arch];
    const platform = osMapNodeChrome[process.platform];
    return {
      PlatformOs: platform,
      PlatformArch: arch,
      PlatformNaclArch: arch
    }
  }

  connect(...args) {
    if (this.isBackgroundPage) {
      console.error('chrome.runtime.connect is not supported in background page')
      return
    }

    // Parse the optional args.
    let targetExtensionId = this.id
    let connectInfo = { name: '' }
    if (args.length === 1) {
      connectInfo = args[0]
    } else if (args.length === 2) {
      [targetExtensionId, connectInfo] = args
    }

    const url = window && window.location ? window.location.href : undefined;
    const { tabId, portId } = ipcRenderer.sendSync(constants.RUNTIME_CONNECT, targetExtensionId, connectInfo, url)
    return Port.get(this.context, tabId, portId, this.id, connectInfo.name)
  }

  sendMessage(...args) {
    if (this.isBackgroundPage) {
      console.error('chrome.runtime.sendMessage is not supported in background page')
      return
    }

    // Parse the optional args.
    let targetExtensionId = this.id
    let message
    if (args.length === 1) {
      message = args[0]
    } else if (args.length === 2) {
      // A case of not provide extension-id: (message, responseCallback)
      if (typeof args[1] === 'function') {
        ipcRenderer.once(`${constants.RUNTIME_SENDMESSAGE_RESULT_}${this.originResultID}`, (event, result) => args[1](result))
        message = args[0]
      } else {
        [targetExtensionId, message] = args
      }
    } else {
      console.error('options is not supported')
      ipcRenderer.once(`${constants.RUNTIME_SENDMESSAGE_RESULT_}${this.originResultID}`, (event, result) => args[2](result))
    }

    ipcRenderer.send(constants.RUNTIME_SENDMESSAGE, targetExtensionId, message, this.originResultID)
    this.incrementOriginResultID()
  }

  getManifest() {
    return ipcRenderer.sendSync(constants.RUNTIME_GET_MANIFEST, this.id)
  }

  setUninstallURL(url, callback) {
    if (callback)
      return callback
  }

  incrementOriginResultID() {
    this.originResultID = this.originResultID++
  }
}

const store = new Map();

const getRuntime = (extensionId, isBackgroundPage) => {
  const key = `${extensionId}-${isBackgroundPage}`;

  if (store.has(key)) {
    return store.get(key)
  } else {
    const newRuntime = new Runtime(extensionId, isBackgroundPage)
    store.set(key, newRuntime)
    return newRuntime
  }
}

exports.setup = (extensionId, isBackgroundPage) => getRuntime(extensionId, isBackgroundPage)
