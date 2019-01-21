const { session, ipcMain } = require('electron');
const enhanceWebRequest = require('electron-better-web-request').default;
const RCEventController = require('../rc-event-controller');
const helpers = require('../helpers');
const constants = require('../../common/constants');

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
      ({ name: k, value: details.responseHeaders[k][0] }));

  return details;
};

class ChromeWebRequestAPIHandler {
  constructor(extensionId) {
    this.electronWebRequestApi = enhanceWebRequest(session.defaultSession).webRequest;
    this.rcEventControllers = [];

    WEBREQUEST_EVENTS.forEach(methodName => {
      const controller = new RCEventController(`${extensionId}-webRequest-${methodName}`);
      this.rcEventControllers.push(controller);
      controller.on('add-listener', (listenerArgs, remoteCallListener) => {

        const [filter, extraInfos] = listenerArgs;
        // https://cs.chromium.org/chromium/src/extensions/browser/api/web_request/web_request_api.cc?type=cs&l=2267
        helpers.clearCacheOnNavigation();

        this.electronWebRequestApi[methodName](
          filter,
          (details, callback) => {
            if (callback)
              remoteCallListener(fromChromeHeadersToElectronHeaders(details))
                .then(returnedDetails => {
                  if (!returnedDetails) return callback(details);
                  return callback(fromElectronHeadersToChromeHeaders(returnedDetails))
                })
                .catch(e => console.error(e))
          },
          {
            origin: 'ecx-api-handler',
          }
        );
      })
    });

    this._handleAskToClearCache = this._handleAskToClearCache.bind(this);
    ipcMain.on(constants.WEBREQUEST_ASK_CLEAR_CACHE, this._handleAskToClearCache);
  };

  _handleAskToClearCache() {
    helpers.clearCacheOnNavigation();
  }

  release() {
    this.rcEventControllers.forEach(c => c.release())
    ipcMain.removeListener(constants.WEBREQUEST_ASK_CLEAR_CACHE, this._handleAskToClearCache);
  }
}

module.exports = ChromeWebRequestAPIHandler;
