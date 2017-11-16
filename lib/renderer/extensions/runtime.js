const {ipcRenderer} = require('electron');
const url = require('url');

const Event = require('./event');
const constants = require('../common/constants');

class Runtime {

  constructor(extensionId) {
    this.id = extensionId
  }

  getURL(path) {
    return url.format({
      protocol: constants.EXTENSION_PROTOCOL,
      slashes: true,
      hostname: extensionId,
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
    if (isBackgroundPage) {
      console.error('chrome.runtime.connect is not supported in background page')
      return
    }

    // Parse the optional args.
    let targetExtensionId = extensionId
    let connectInfo = {name: ''}
    if (args.length === 1) {
      connectInfo = args[0]
    } else if (args.length === 2) {
      [targetExtensionId, connectInfo] = args
    }

    const {tabId, portId} = ipcRenderer.sendSync(constants.RUNTIME_CONNECT, targetExtensionId, connectInfo)
    return new Port(tabId, portId, extensionId, connectInfo.name)
  },

  sendMessage (...args) {
    if (isBackgroundPage) {
      console.error('chrome.runtime.sendMessage is not supported in background page')
      return
    }

    // Parse the optional args.
    let targetExtensionId = extensionId
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
  },

  onConnect: new Event(),
  onMessage: new Event(),
  onInstalled: new Event(),

  getManifest() {
    return ipcRenderer.sendSync(constants.RUNTIME_GET_MANIFEST, extensionId)
  }
}

exports.setup = extensionId => {
  return new Runtime(extensionId)
}