const { rpc, RpcIpcManager } = require('electron-simple-rpc');
const capitalize = require('capitalize');
const Event = require('../../renderer/extensions/event');

const callbackToDigest = (fn) => {
  let functionFingerprint = fn.toString();
  let hash = 0;
  let i;
  let chr;

  if (functionFingerprint.length === 0) {
    return hash;
  }

  for (i = 0; i < functionFingerprint.length; i++) {
    chr = functionFingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // convert to 32bit integer
  }

  return hash;
};

const callbackRegistry = new Map();

class WebRequestEvent extends Event {
  constructor (webRequestMethodName, rpcScopeMain) {
    super();
    this.webRequestMethodName = webRequestMethodName;
    this.rpcScopeMain = rpcScopeMain;
  }

  addListener (callback, filter, extraInfos) {
    const digest = callbackToDigest(callback);
    callbackRegistry.set(digest, callback);

    rpc(this.rpcScopeMain,  capitalize(`registerCbFor${this.webRequestMethodName}`))(filter, digest);
    this.listeners.push(digest)
  }

  removeListener (callback) {
    const digest = callbackToDigest(callback);
    const index = this.listeners.indexOf(digest);
    if (index !== -1) {
      this.listeners.splice(index, 1)
    }
  }

  hasListener (callback) {
    const digest = callbackToDigest(callback);
    return this.listeners.indexOf(digest) !== -1
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
        this[methodName] = new WebRequestEvent(methodName, this.rpcScopeMain);
        lib[capitalize(`callBack${methodName}`)] = (callbackId, details) => {
          const callback = callbackRegistry.get(callbackId);
          return callback(details)
        }
      });

    this.rpcManager = new RpcIpcManager(lib, this.rpcScopeRenderer);
  }

  handlerBehaviorChanged () {
    return Promise.resolve()
  }
}

exports.setup = extensionId => new ChromeWebRequestAPIClient(extensionId);
