const { session, webContents } = require('electron');
const RCEventController = require('../rc-event-controller');
const constants = require('../../common/constants');

const WEBREQUEST_EVENTS = ['onBeforeRequest', 'onBeforeSendHeaders', 'onSendHeaders',
  'onHeadersReceived', 'onAuthRequired', 'onResponseStarted', 'onBeforeRedirect', 'onCompleted',
  'onErrorOccurred'];

const WEBREQUEST_RESPONSE_EVENTS = ['onBeforeRequest', 'onBeforeSendHeaders',
  'onHeadersReceived'];

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

const askToClearCache = () => {
  webContents.getAllWebContents().forEach(wc => {
    wc.send(`${constants.WEBREQUEST_CLEAR_CACHE}`)
  });
};

class ChromeWebRequestAPIHandler {
  constructor(extensionId) {
    this.electronWebRequestApi = session.defaultSession.webRequest;
    this.rcEventControllers = [];

    WEBREQUEST_EVENTS.forEach(methodName => {
      const controller = new RCEventController(`${extensionId}-webRequest-${methodName}`);
      this.rcEventControllers.push(controller);
      controller.on('add-listener', (listenerArgs, remoteCallListener) => {
        const [filter, extraInfos] = listenerArgs;
        if (WEBREQUEST_RESPONSE_EVENTS.includes(methodName)) {
          return askToClearCache();
        }
        this.electronWebRequestApi[methodName](filter, (details, callback) => {
          if (callback)
            remoteCallListener(fromChromeHeadersToElectronHeaders(details))
              .then(returnedDetails => {
                if (!returnedDetails) return callback(details);
                return callback(fromElectronHeadersToChromeHeaders(returnedDetails))
              })
              .catch(e => {})
        })
      })
    });
  };

  release () {
    this.rcEventControllers.forEach(c => c.release())
  }
}

module.exports = ChromeWebRequestAPIHandler;
