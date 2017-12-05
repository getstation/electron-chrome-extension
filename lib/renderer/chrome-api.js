const {ipcRenderer} = require('electron')
const Event = require('./extensions/event')
const url = require('url')

const constants = require('../common/constants');

let nextId = 0

class Tab {
  constructor (tabId) {
    this.id = tabId
  }
}

class MessageSender {
  constructor (tabId, extensionId) {
    this.tab = tabId ? new Tab(tabId) : null
    this.id = extensionId
    this.url = `${constants.EXTENSION_PROTOCOL}://${extensionId}`
  }
}

class Port {
  constructor (tabId, portId, extensionId, name) {
    this.tabId = tabId
    this.portId = portId
    this.disconnected = false

    this.name = name
    this.onDisconnect = new Event()
    this.onMessage = new Event()
    this.sender = new MessageSender(tabId, extensionId)

    ipcRenderer.once(`${constants.PORT_DISCONNECT_}${portId}`, () => {
      this._onDisconnect()
    })
    ipcRenderer.on(`${constants.PORT_POSTMESSAGE_}${portId}`, (event, message) => {
      const sendResponse = function () { console.error('sendResponse is not implemented') }
      this.onMessage.emit(message, this.sender, sendResponse)
    })
  }

  disconnect () {
    if (this.disconnected) return

    ipcRenderer.sendToAll(this.tabId, `${constants.PORT_DISCONNECT_}${this.portId}`)
    this._onDisconnect()
  }

  postMessage (message) {
    ipcRenderer.sendToAll(this.tabId, `${constants.PORT_POSTMESSAGE_}${this.portId}`, message)
  }

  _onDisconnect () {
    this.disconnected = true
    ipcRenderer.removeAllListeners(`${constants.PORT_POSTMESSAGE_}${this.portId}`)
    this.onDisconnect.emit()
  }
}

// Inject chrome API to the |context|
exports.injectTo = function (extensionId, isBackgroundPage, context) {
  const chrome = context.chrome = context.chrome || {}
  let originResultID = 1

  ipcRenderer.on(`${constants.RUNTIME_ONCONNECT_}${extensionId}`, (event, tabId, portId, connectInfo) => {
    chrome.runtime.onConnect.emit(new Port(tabId, portId, extensionId, connectInfo.name))
  })

  ipcRenderer.on(`${constants.RUNTIME_ONMESSAGE_}${extensionId}`, (event, tabId, message, resultID) => {
    chrome.runtime.onMessage.emit(message, new MessageSender(tabId, extensionId), (messageResult) => {
      ipcRenderer.send(`${constants.RUNTIME_ONMESSAGE_RESULT_}${resultID}`, messageResult)
    })
  })

  ipcRenderer.on(constants.TABS_ONCREATED, (event, tabId) => {
    chrome.tabs.onCreated.emit(new Tab(tabId))
  })

  ipcRenderer.on(constants.TABS_ONREMOVED, (event, tabId) => {
    chrome.tabs.onRemoved.emit(tabId)
  })

  ipcRenderer.on(`${constants.WEBREQUEST_CLEAR_CACHE}`, (event) => {
    chrome.webRequest.handlerBehaviorChanged();
  })

  chrome.runtime = {
    id: extensionId,

    getURL: function (path) {
      return url.format({
        protocol: constants.EXTENSION_PROTOCOL,
        slashes: true,
        hostname: extensionId,
        pathname: path
      })
    },

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

  chrome.tabs = {
    executeScript (tabId, details, callback) {
      const requestId = ++nextId
      ipcRenderer.once(`${constants.TABS_EXECUTESCRIPT_RESULT_}${requestId}`, (event, result) => {
        callback([event.result])
      })
      ipcRenderer.send(onstants.TABS_EXECUTESCRIPT, requestId, tabId, extensionId, details)
    },

    sendMessage (tabId, message, options, responseCallback) {
      if (responseCallback) {
        ipcRenderer.on(`${constants.TABS_SEND_MESSAGE_RESULT_}${originResultID}`, (event, result) => responseCallback(result))
      }
      ipcRenderer.send(constants.TABS_SEND_MESSAGE, tabId, extensionId, isBackgroundPage, message, originResultID)
      originResultID++
    },

    query () {},
    onUpdated: new Event(),
    onCreated: new Event(),
    onRemoved: new Event(),
    
  }

  chrome.extension = {
    getURL: chrome.runtime.getURL,
    connect: chrome.runtime.connect,
    onConnect: chrome.runtime.onConnect,
    sendMessage: chrome.runtime.sendMessage,
    onMessage: chrome.runtime.onMessage
  }

  chrome.storage = require('./extensions/storage').setup(extensionId)

  chrome.pageAction = {
    show () {},
    hide () {},
    setTitle () {},
    getTitle () {},
    setIcon () {},
    setPopup () {},
    getPopup () {}
  }

  chrome.browserAction = require('./extensions/browser-action').setup(extensionId)
  chrome.notifications = require('./extensions/notifications').setup(extensionId)
  chrome.webRequest = require('./extensions/web-request').setup(extensionId)

  chrome.i18n = require('./extensions/i18n').setup(extensionId)
  chrome.webNavigation = require('./extensions/web-navigation').setup()
}
