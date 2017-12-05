const { webFrame } = require('electron');
const RCEvent = require('./rc-event');

const WEBREQUEST_EVENTS = ['onBeforeRequest', 'onBeforeSendHeaders', 'onSendHeaders',
  'onHeadersReceived', 'onAuthRequired', 'onResponseStarted', 'onBeforeRedirect', 'onCompleted',
  'onErrorOccurred'];

class ChromeWebRequestAPIClient {
  constructor(extensionId) {
    this.MAX_HANDLER_BEHAVIOR_CHANGED_CALLS_PER_10_MINUTES = 10;
    WEBREQUEST_EVENTS.forEach(event => this[event] = new RCEvent(`${extensionId}-webRequest-${event}`));
  }

  handlerBehaviorChanged () {
    webFrame.clearCache();
    return Promise.resolve()
  }
}

exports.setup = extensionId => new ChromeWebRequestAPIClient(extensionId);
