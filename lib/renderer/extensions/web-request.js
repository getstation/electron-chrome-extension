const { rpc, RpcIpcManager } = require('electron-simple-rpc');
const capitalize = require('capitalize');

class CallbackRegistry {
  constructor () {
    this.cbs = new Map();
    this.cbIdIncrement = 0;
  }

  addCallback(callback) {
    this.cbIdIncrement = this.cbIdIncrement + 1;
    this.cbs.set(this.cbIdIncrement, callback);
    return this.cbIdIncrement;
  }
}

const callbackRegistry = new CallbackRegistry();

class Event {
  constructor (webRequestMethodName, rpcScopeMain) {
    this.webRequestMethodName = webRequestMethodName;
    this.rpcScopeMain = rpcScopeMain;
    this.listeners = [];
  }

  addListener (callback, filter, extraInfos) {
    const cbID = callbackRegistry.addCallback(callback)

    const webRequestHandler = {
      filter: filter,
      callbackId: cbID
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
          const callback = callbackRegistry.cbs.get(callbackId);
          return callback(details)
        }
      });

    this.rpcManager = new RpcIpcManager(lib, this.rpcScopeRenderer);
  }
}

exports.setup = extensionId => new ChromeWebRequestAPIClient(extensionId);
