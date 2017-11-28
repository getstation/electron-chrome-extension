const { rpc, RpcIpcManager } = require('electron-simple-rpc');
const capitalize = require('capitalize');
const { session } = require('electron');

const WEBREQUEST_EVENTS = ['onBeforeRequest', 'onBeforeSendHeaders', 'onSendHeaders',
  'onHeadersReceived', 'onAuthRequired', 'onResponseStarted', 'onBeforeRedirect', 'onCompleted',
  'onErrorOccurred'];

const fromElectronHeadersToChromeHeaders = (cbReturn) => {
  if (cbReturn && cbReturn.responseHeaders) {
    const responseHeaders = {};
    cbReturn.responseHeaders.forEach((header) => responseHeaders[header.name] = [header.value]);
    cbReturn.responseHeaders = responseHeaders;
  }

  return cbReturn
};

const fromChromeHeadersToElectronHeaders = (details) => {
  if (details.responseHeaders)
    details.responseHeaders = Object.keys(details.responseHeaders).map((k) =>
      ({ name: k, value: details.responseHeaders[k][0]}));

  return details;
};

class ChromeWebRequestAPIHandler {
  constructor(extensionId) {
    this.electronWebRequestApi = session.defaultSession.webRequest;

    const rpcScopeMain = `chrome-webRequest-${extensionId}-main`;
    const rpcScopeRenderer = `chrome-webRequest-${extensionId}-renderer`;

    const lib = {};
    WEBREQUEST_EVENTS.forEach(methodName => {
      this[`triggerCallBack${capitalize(methodName)}`] = (details, callback, callbackId) =>
        rpc(rpcScopeRenderer, `executeCallback${capitalize(methodName)}`)(callbackId, details)
          .then(cbReturn => callback ? callback(fromElectronHeadersToChromeHeaders(cbReturn)) : {});
      lib[`registerCb${capitalize(methodName)}`] = (filter, callbackId) =>
        this.electronWebRequestApi[methodName](filter, (details, callback) =>
          this[`triggerCallBack${capitalize(methodName)}`]
          (fromChromeHeadersToElectronHeaders(details), callback, callbackId))
    });

    this.rpcManager = new RpcIpcManager(lib, rpcScopeMain);
  };

  release () {
    this.rpcManager.release();
  }
}

module.exports = ChromeWebRequestAPIHandler;