const {ipcRenderer} = require('electron');
const url = require('url');

const Event = require('./event');
const constants = require('../../common/constants');

class Runtime {

  constructor(extensionId, isBackgroundPage) {
    this.id = extensionId
    this.isBackgroundPage = isBackgroundPage
    this.originResultID = 1

    this.onConnect = new Event()
    this.onMessage = new Event()
    this.onInstalled = new Event()
    this.onStartup = new Event()
    this.onUpdateAvailable = new Event()
    this.onSuspend = new Event()
  }

  getURL(path) {
    return url.format({
      protocol: constants.EXTENSION_PROTOCOL,
      slashes: true,
      hostname: this.id,
      pathname: path
    })
  }

  getPlatformInfo() {
    return {
      PlatformOs: 'mac',
      PlatformArch: 'x86-64',
      PlatformNaclArch: 'x86-64'
    }
  }

  connect (...args) {
    if (this.isBackgroundPage) {
      console.error('chrome.runtime.connect is not supported in background page')
      return
    }

    // Parse the optional args.
    let targetExtensionId = this.id
    let connectInfo = {name: ''}
    if (args.length === 1) {
      connectInfo = args[0]
    } else if (args.length === 2) {
      [targetExtensionId, connectInfo] = args
    }

    const {tabId, portId} = ipcRenderer.sendSync(constants.RUNTIME_CONNECT, targetExtensionId, connectInfo)
    return new Port(tabId, portId, this.id, connectInfo.name)
  }

  sendMessage (...args) {
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
        ipcRenderer.on(`${constants.RUNTIME_SENDMESSAGE_RESULT_}${originResultID}`, (event, result) => args[1](result))
        message = args[0]
      } else {
        [targetExtensionId, message] = args
      }
    } else {
      console.error('options is not supported')
      ipcRenderer.on(`${constants.RUNTIME_SENDMESSAGE_RESULT_}${originResultID}`, (event, result) => args[2](result))
    }

    ipcRenderer.send(constants.RUNTIME_SENDMESSAGE, targetExtensionId, message, originResultID)
    originResultID++
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

exports.setup = (extensionId, isBackgroundPage) => {
  return new Runtime(extensionId, isBackgroundPage)
}