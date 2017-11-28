const { rpc, RpcIpcManager } = require('electron-simple-rpc');
const capitalize = require('capitalize');
const Event = require('../../renderer/extensions/event');

const WEBREQUEST_EVENTS = ['onBeforeRequest', 'onBeforeSendHeaders', 'onSendHeaders',
  'onHeadersReceived', 'onAuthRequired', 'onResponseStarted', 'onBeforeRedirect', 'onCompleted',
  'onErrorOccurred'];

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

const callbacks = new Map();

class WebRequestEvent extends Event {
  constructor (event, rpcScopeMain) {
    super();
    this.webRequestEvent = event;
    this.rpcScopeMain = rpcScopeMain;
  }

  addListener (callback, filter, extraInfos) {
    const digest = callbackToDigest(callback);
    callbacks.set(digest, callback);

    rpc(this.rpcScopeMain,  `registerCb${capitalize(this.webRequestEvent)}`)(filter, digest);
    this.listeners.push(digest)
  }

  removeListener (callback) {
    const digest = callbackToDigest(callback);
    const index = this.listeners.indexOf(digest);
    if (index !== -1) {
      callbacks.delete(digest);
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
    WEBREQUEST_EVENTS.forEach(event => {
      this[event] = new WebRequestEvent(event, this.rpcScopeMain);
      lib[`executeCallback${capitalize(event)}`] = (callbackId, details) =>
        callbacks.get(callbackId)(details);
    });

    this.rpcManager = new RpcIpcManager(lib, this.rpcScopeRenderer);
  }

  handlerBehaviorChanged () {
    console.warn('Call not implemented method **handlerBehaviorChanged**')
    return Promise.resolve()
  }
}

exports.setup = extensionId => new ChromeWebRequestAPIClient(extensionId);
