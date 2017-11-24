const { rpc, RpcIpcManager } = require('electron-simple-rpc');
const capitalize = require('capitalize');

const callbackRegistry = new Map();

class Event {
  constructor (webRequestMethodName, rpcScopeMain) {
    this.webRequestMethodName = webRequestMethodName;
    this.rpcScopeMain = rpcScopeMain;
    this.listeners = [];
  }

  addListener (callback, filter, extraInfos) {
    callbackRegistry.set((callbackRegistry.size + 1), callback)

    const webRequestHandler = {
      filter: filter.urls,
      callbackId: callbackRegistry.size
    };

    rpc(this.rpcScopeMain,  capitalize(`registerCbFor${this.webRequestMethodName}`))(webRequestHandler);
    this.listeners.push(webRequestHandler)
  }
}

class ChromeWebRequestAPIClient {
  constructor(extensionId) {
    this.rpcScopeMain = `chrome-webRequest-${extensionId}-main`;
    this.rpcScopeRenderer = `chrome-webRequest-${extensionId}-renderer`;
    this.MAX_HANDLER_BEHAVIOR_CHANGED_CALLS_PER_10_MINUTES = 10;

    const lib = {};
    ['onBeforeRequest', 'onBeforeSendHeaders', 'onSendHeaders', 'onHeadersReceived',
      'onAuthRequired', 'onResponseStarted', 'onBeforeRedirect', 'onCompleted', 'onErrorOccurred']
      .forEach(methodName => {
        this[methodName] = new Event(methodName, this.rpcScopeMain);
        lib[capitalize(`callBack${methodName}`)] = (callbackId, details) => {
          const callback = callbackRegistry.get(callbackId);
          return callback(details)
        }
      });

    this.rpcManager = new RpcIpcManager(lib, this.rpcScopeRenderer);
  }

  handlerBehaviorChanged () {}
}

exports.setup = extensionId => new ChromeWebRequestAPIClient(extensionId);
