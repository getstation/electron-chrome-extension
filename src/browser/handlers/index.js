const ChromeStorageAPIHandler = require('./storage');
const ChromeWebRequestAPIHandler = require('./web-request');
const Windows = require('./windows').default;
const Cookies = require('./cookies').default;

class ChromeAPIHandler {
    constructor(extensionId, emitter) {
        this.storage = new ChromeStorageAPIHandler(extensionId);
        this.webRequest = new ChromeWebRequestAPIHandler(extensionId);
        this.windows = new Windows(extensionId, emitter);
        this.cookies = new Cookies(extensionId, emitter);
    }

    release() {
        [this.storage, this.webRequest, this.windows]
            .forEach((api) => api.release())
    }
}

module.exports = ChromeAPIHandler;
