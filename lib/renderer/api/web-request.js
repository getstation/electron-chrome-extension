const { webContents, webFrame } = require('electron');
const { ipcRenderer } = require('electron');
const RCEvent = require('./rc-event');
const constants = require('../../common/constants');

const WEBREQUEST_EVENTS = ['onBeforeRequest', 'onBeforeSendHeaders', 'onSendHeaders',
  'onHeadersReceived', 'onAuthRequired', 'onResponseStarted', 'onBeforeRedirect', 'onCompleted',
  'onErrorOccurred'];

class ChromeWebRequestAPIClient {
  constructor(extensionId) {
    this.MAX_HANDLER_BEHAVIOR_CHANGED_CALLS_PER_10_MINUTES = 10;
    WEBREQUEST_EVENTS.forEach(event => this[event] = new RCEvent(`${extensionId}-webRequest-${event}`));


    ipcRenderer.on(`${constants.WEBREQUEST_CLEAR_CACHE}`, (event, onNavigation) => {
      // todo: handle the `onNavigation` argument
      // now we simply clear cache
      webFrame.clearCache()
    })
  }

  handlerBehaviorChanged () {
    ipcRenderer.send(`${constants.WEBREQUEST_ASK_CLEAR_CACHE}`)
    return Promise.resolve()
  }
}

exports.setup = extensionId => new ChromeWebRequestAPIClient(extensionId);
