const { ipcRenderer } = require('electron');

const constants = require('../../../common/constants');
const { log } = require('../../../common/utils');
const Event = require('../event');
const MessageSender = require('./message-sender');

class Port {
  constructor(tabId, portId, extensionId, name, url) {
    this.tabId = tabId;
    this.portId = portId;
    this.disconnected = false;
    this.url = url;

    this.name = name;
    this.onDisconnect = new Event();
    this.onMessage = new Event();
    this.sender = new MessageSender({ tabId, extensionId, url });

    ipcRenderer.once(`${constants.PORT_DISCONNECT_}${portId}`, () => {
      this._onDisconnect();
    });
    ipcRenderer.on(`${constants.PORT_POSTMESSAGE_}${portId}`, (event, message) => {
      const sendResponse = function () { console.error('sendResponse is not implemented') };
      // log(`emit received message for port #${portId} ${name}: `, message);
      this.onMessage.emit(JSON.parse(message), this.sender, sendResponse)
    });
  }

  disconnect() {
    if (this.disconnected) return;

    ipcRenderer.sendToAll(this.tabId, `${constants.PORT_DISCONNECT_}${this.portId}`);
    this._onDisconnect();
  }

  postMessage(message) {
    // log(`postMessage for port #${this.portId} ${this.name}: `, message);
    ipcRenderer.sendToAll(this.tabId, `${constants.PORT_POSTMESSAGE_}${this.portId}`, JSON.stringify(message));
  }

  _onDisconnect() {
    this.disconnected = true;
    ipcRenderer.removeAllListeners(`${constants.PORT_POSTMESSAGE_}${this.portId}`);
    this.onDisconnect.emit();
  }
}


const getPort = (context, tabId, portId, extensionId, name, url) => {
  const key = `${tabId}-${portId}-${extensionId}-${name}`;

  if (context.__ports.has(key)) {
    return context.__ports.get(key)
  } else {
    const newPort = new Port(tabId, portId, extensionId, name, url)
    context.__ports.set(key, newPort)
    return newPort
  }
}

exports.get = (context, tabId, portId, extensionId, name, url) => getPort(context, tabId, portId, extensionId, name, url)
