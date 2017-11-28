const { rpc, RpcIpcManager } = require('electron-simple-rpc');
const capitalize = require('capitalize');
const { session } = require('electron');
const RCEventControler = require('../rc-event-controler');

const WEBREQUEST_EVENTS = ['onBeforeRequest', 'onBeforeSendHeaders', 'onSendHeaders',
  'onHeadersReceived', 'onAuthRequired', 'onResponseStarted', 'onBeforeRedirect', 'onCompleted',
  'onErrorOccurred'];

const fromElectronObjectToChromeObject = (cbReturn) => {
  if (cbReturn && cbReturn.responseHeaders) {
    const responseHeaders = {};
    cbReturn.responseHeaders.forEach((header) => {
      return responseHeaders[header.name] = [header.value]
    });
    cbReturn.responseHeaders = responseHeaders;
  }

  return cbReturn
};

const fromChromeObjectToElectronObject = (details) => {
  if (details.responseHeaders) {
    const responseHeaders = [];
    Object.keys(details.responseHeaders).forEach((k) => {
      responseHeaders.push({ name: k, value: details.responseHeaders[k][0]});
    });
    details.responseHeaders = responseHeaders;
  }

  return details;
};

class ChromeWebRequestAPIHandler {
  constructor(extensionId) {
    this.electronWebRequestApi = session.defaultSession.webRequest;

    const rpcScopeMain = `chrome-webRequest-${extensionId}-main`;
    const rpcScopeRenderer = `chrome-webRequest-${extensionId}-renderer`;

    const lib = {};
    WEBREQUEST_EVENTS.forEach(methodName => {
      const controler = new RCEventControler(`${extensionId}-webRequest-${methodName}`);
      controler.on('new-listener', (listenerArgs, remoteCallListener) => {
        const filter = listenerArgs[0];
        this.electronWebRequestApi[methodName](filter, (details, callback) => {
          console.log(details);
          const p = remoteCallListener(fromChromeObjectToElectronObject(details));
          
          if (callback) {
            p.then(returnedDetails => {
              if (!returnedDetails) return callback(details);
              callback(fromElectronObjectToChromeObject(returnedDetails))
            });
          }
        })
      })
    });

    // this.rpcManager = new RpcIpcManager(lib, rpcScopeMain);
  };

  release () {
    //this.rpcManager.release();
  }
}

module.exports = ChromeWebRequestAPIHandler;