const Event = require('./event');

exports.setup = extensionId => {
    return {
        onBeforeRequest: new Event(),
        onBeforeSendHeaders: new Event(),
        onSendHeaders: new Event(),
        onHeadersReceived: new Event(),
        onAuthRequired: new Event(),
        onResponseStarted: new Event(),
        onBeforeRedirect: new Event(),
        onCompleted: new Event(),
        onErrorOccurred: new Event(),
        handlerBehaviorChanged () {},
        MAX_HANDLER_BEHAVIOR_CHANGED_CALLS_PER_10_MINUTES: 10
  }
}
