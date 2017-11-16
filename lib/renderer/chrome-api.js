const {ipcRenderer} = require('electron');

const constants = require('../common/constants');
const Event = require('./extensions/event');
const MessageSender = require('./extensions/runtime/message-sender');
const Tab = require('./extensions/runtime/tab');
const Port = require('./extensions/runtime/port');

let nextId = 0;

// Inject chrome API to the |context|
exports.injectTo = function (extensionId, isBackgroundPage, context) {
  const chrome = context.chrome = context.chrome || {};
  let originResultID = 1;

  ipcRenderer.on(`${constants.RUNTIME_ONCONNECT_}${extensionId}`, (event, tabId, portId, connectInfo) => {
    chrome.runtime.onConnect.emit(new Port(tabId, portId, extensionId, connectInfo.name))
  });

  ipcRenderer.on(`${constants.RUNTIME_ONMESSAGE_}${extensionId}`, (event, tabId, message, resultID) => {
    chrome.runtime.onMessage.emit(message, new MessageSender(tabId, extensionId), (messageResult) => {
      ipcRenderer.send(`${constants.RUNTIME_ONMESSAGE_RESULT_}${resultID}`, messageResult)
    })
  });

  ipcRenderer.on(constants.TABS_ONCREATED, (event, tabId) => {
    chrome.tabs.onCreated.emit(new Tab(tabId))
  });

  ipcRenderer.on(constants.TABS_ONREMOVED, (event, tabId) => {
    chrome.tabs.onRemoved.emit(tabId)
  });


  chrome.runtime = require('./extensions/runtime').setup(extensionId);
  chrome.storage = require('./extensions/storage').setup(extensionId);
  chrome.browserAction = require('./extensions/browser-action').setup(extensionId);
  chrome.notifications = require('./extensions/notifications').setup(extensionId);
  chrome.webRequest = require('./extensions/web-request').setup(extensionId);
  chrome.i18n = require('./extensions/i18n').setup(extensionId);
  chrome.webNavigation = require('./extensions/web-navigation').setup();


  chrome.extension = {
    getURL: chrome.runtime.getURL,
    getPlatformInfo: chrome.runtime.getPlatformInfo,
    connect: chrome.runtime.connect,
    onConnect: chrome.runtime.onConnect,
    sendMessage: chrome.runtime.sendMessage,
    onMessage: chrome.runtime.onMessage
  };

  chrome.tabs = {
    executeScript (tabId, details, callback) {
      const requestId = ++nextId;
      ipcRenderer.once(`${constants.TABS_EXECUTESCRIPT_RESULT_}${requestId}`, (event, result) => {
        callback([event.result]);
      });
      ipcRenderer.send(constants.TABS_EXECUTESCRIPT, requestId, tabId, extensionId, details)
    },

    sendMessage (tabId, message, options, responseCallback) {
      if (responseCallback) {
        ipcRenderer.on(`${constants.TABS_SEND_MESSAGE_RESULT_}${originResultID}`, (event, result) => responseCallback(result));
      }
      ipcRenderer.send(constants.TABS_SEND_MESSAGE, tabId, extensionId, isBackgroundPage, message, originResultID);
      originResultID++
    },

    query () {},
    onUpdated: new Event(),
    onCreated: new Event(),
    onRemoved: new Event()
  };

  chrome.pageAction = {
    show () {},
    hide () {},
    setTitle () {},
    getTitle () {},
    setIcon () {},
    setPopup () {},
    getPopup () {}
  };

  return chrome;
};
