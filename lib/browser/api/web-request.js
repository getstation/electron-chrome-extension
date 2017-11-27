const { rpc, RpcIpcManager } = require('electron-simple-rpc');
const capitalize = require('capitalize');
const { session } = require('electron');

class ChromeWebRequestAPIHandler {
  constructor(extensionId) {

    this.electronWebRequestApi = session.defaultSession.webRequest;

    const rpcScopeMain = `chrome-webRequest-${extensionId}-main`;
    const rpcScopeRenderer = `chrome-webRequest-${extensionId}-renderer`;

    const lib = {};
    ['onBeforeRequest', 'onBeforeSendHeaders', 'onSendHeaders', 'onHeadersReceived',
      'onAuthRequired', 'onResponseStarted', 'onBeforeRedirect', 'onCompleted', 'onErrorOccurred']
      .forEach(methodName => {
        this[capitalize(`triggerCallBack${methodName}`)] = (details, callback, callbackId) => {
          rpc(rpcScopeRenderer, capitalize(`callBack${methodName}`))(callbackId, details)
            .then(cbReturn => {
              if (cbReturn && cbReturn.responseHeaders) {
                const responseHeaders = {};
                cbReturn.responseHeaders.forEach((header) => {
                  return responseHeaders[header.name] = [header.value]
                });
                cbReturn.responseHeaders = responseHeaders;
              }

              if (callback)
                return callback(cbReturn)
            })
        };
        lib[capitalize(`registerCbFor${methodName}`)] = (args) => {
          const callbackId = args.callbackId;
          this.electronWebRequestApi[methodName](args.filter, (details, callback) => {
            if (details.responseHeaders) {
              const responseHeaders = [];
              Object.keys(details.responseHeaders).forEach((k) => {
                responseHeaders.push({ name: k, value: details.responseHeaders[k][0]});
              });
              details.responseHeaders = responseHeaders;
            }

            if (!(!!details || !!callback))
              return;

            this[capitalize(`triggerCallBack${methodName}`)](details, callback, callbackId);
          });
        }
    });
    this.rpcManager = new RpcIpcManager(lib, rpcScopeMain);
  }

  release() {
    this.rpcManager.release();
  }
}

module.exports = ChromeWebRequestAPIHandler;