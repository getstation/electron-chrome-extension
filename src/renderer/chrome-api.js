const { ipcRenderer } = require('electron');

const constants = require('../common/constants');
const { isIterable, log } = require('../common/utils');
const Event = require('./api/event');
const MessageSender = require('./api/runtime/message-sender');
const Tab = require('./api/runtime/tab');
const Port = require('./api/runtime/port');

let nextId = 0;

// Inject chrome API to the |context|
exports.injectTo = function (extensionId, isBackgroundPage, context) {
  let chrome;

  if (context) {
    context.chrome ? context.chrome : context.chrome = {}
    chrome = context.chrome
  } else {
    chrome = {}
  }

  // Maintain ports references for debug purpose
  context.__ports = new Map();

  chrome.runtime = require('./api/runtime').setup(context, extensionId, isBackgroundPage);
  chrome.storage = require('./api/storage').setup(extensionId);
  chrome.browserAction = require('./api/browser-action').setup(extensionId);
  chrome.notifications = require('./api/notifications').setup(extensionId);
  chrome.webRequest = require('./api/web-request').setup(extensionId);
  chrome.i18n = require('./api/i18n').setup(extensionId);
  chrome.webNavigation = require('./api/web-navigation').setup();
  chrome.omnibox = require('./api/omnibox').setup(extensionId);
  chrome.windows = require('./api/windows').default(extensionId);

  chrome.extension = {
    getURL: (...args) => chrome.runtime.getURL(...args),
    getPlatformInfo: (...args) => chrome.runtime.getPlatformInfo(...args),
    connect: (...args) => chrome.runtime.connect(...args),
    sendMessage: (...args) => chrome.runtime.sendMessage(...args),
    isAllowedIncognitoAccess: () => false,
    onConnect: chrome.runtime.onConnect,
    onMessage: chrome.runtime.onMessage,
  };

  chrome.contextMenus = {
    create: function () { return {} },
    update: function () { return {} },
    remove: function () { return {} },
    removeAll: function () { return {} },
    onClicked: new Event()
  };

  chrome.tabs = {
    executeScript(tabId, details, callback) {
      const requestId = ++nextId;
      ipcRenderer.once(`${constants.TABS_EXECUTESCRIPT_RESULT_}${requestId}`, (event, result) => {
        callback([event.result]);
      });
      ipcRenderer.send(constants.TABS_EXECUTESCRIPT, requestId, tabId, extensionId, details)
    },

    sendMessage(tabId, message, options, responseCallback) {
      if (responseCallback) {
        ipcRenderer.on(`${constants.TABS_SEND_MESSAGE_RESULT_}${chrome.runtime.originResultID}`, (event, result) => responseCallback(result));
      }
      ipcRenderer.send(constants.TABS_SEND_MESSAGE, tabId, extensionId, isBackgroundPage, message, chrome.runtime.originResultID);
      chrome.runtime.incrementOriginResultID()
    },

    insertCSS(tabId, details, cb) {
      if (cb) cb();
    },

    get(tabId, cb) {
      const requestId = ++nextId;
      ipcRenderer.once(`${constants.TABS_GET_RESULT_}${requestId}`, (event, result) => {
        cb(result);
      });

      ipcRenderer.send(constants.TABS_GET, requestId, extensionId, tabId);
    },

    getCurrent() {
    },

    create(details, cb) {
      cb();
    },

    query(args, cb) {
      const requestId = ++nextId;
      ipcRenderer.once(`${constants.TABS_QUERY_RESULT_}${requestId}`, (event, result) => {
        cb(result);
      });

      ipcRenderer.send(constants.TABS_QUERY, requestId, extensionId);
    },

    onUpdated: new Event(),
    onCreated: new Event(),
    onRemoved: new Event(),
    onActivated: new Event(),
  };

  chrome.pageAction = {
    show() { },
    hide() { },
    setTitle() { },
    getTitle() { },
    setIcon() { },
    setPopup() { },
    getPopup() { }
  };

  chrome.cookies = require('./api/cookies').default(extensionId);

  ipcRenderer.on(`${constants.RUNTIME_ONCONNECT_}${extensionId}`, (event, tabId, portId, connectInfo, url) => {
    chrome.runtime.onConnect.emit(Port.get(context, tabId, portId, extensionId, connectInfo.name, url))
  });

  ipcRenderer.on(`${constants.RUNTIME_ONMESSAGE_}${extensionId}`, (event, tabId, message, resultID) => {
    chrome.runtime.onMessage.emit(message, new MessageSender({ tabId, extensionId }), (messageResult) => {
      ipcRenderer.send(`${constants.RUNTIME_ONMESSAGE_RESULT_}${resultID}`, messageResult)
    })
  });

  ipcRenderer.on(constants.TABS_ONCREATED, (event, tabId) => {
    chrome.tabs.onCreated.emit(new Tab(tabId))
  });

  ipcRenderer.on(constants.TABS_ONREMOVED, (event, tabId) => {
    chrome.tabs.onRemoved.emit(tabId)
  });

  ipcRenderer.on('cx-event', (_, e) => {
    const { channel, payload } = e;
    const cxEventEmitter = channel.split('.')
      .reduce(
        (emitter, path) => emitter = emitter[path],
        chrome
      )
    const emittablePayload = isIterable(payload) ? payload : [payload];

    cxEventEmitter.emit(...emittablePayload)
  });

  chrome.runtime.onInstalled.emit({ reason: 'install' });

  // API Calls Logger for debug purpose

  const handler = {
    get: (apis, prop) => {
      if (!Boolean(apis.__path)) {
        apis.__path = 'chrome';
      }

      if (apis[prop] && typeof apis[prop] === 'object') {
        apis[prop].__path = `${apis.__path}.${prop}`;
        return new Proxy(apis[prop], handler);
      }

      if (typeof apis[prop] === 'function') {
        return (...args) => {
          if (args.filter(String).length > 0) {
            const result = apis[prop](...args);
            if (typeof result === 'object') {
              result.__path = result.constructor.name.toLowerCase();
              return new Proxy(result, handler);
            }

            log(`${apis.__path}.${prop} `, ...args, result);

            return result;
          }

          const result = apis[prop]();

          if (result.constructor.name.toLowerCase() === 'object') {
            result.__path = result.constructor.name.toLowerCase();
            return new Proxy(result, handler);
          }

          log(`${apis.__path}.${prop} `, result);

          return result;
        }
      }

      if (['string', 'number'].includes(typeof apis[prop])) {
        const result = apis[prop];
        log(`${apis.__path}.${prop} `, result);

        return result;
      }

      return apis[prop];
    }
  };

  chrome = new Proxy(chrome, handler);

  return chrome;
};
