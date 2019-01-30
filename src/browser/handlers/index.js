const ChromeStorageAPIHandler = require('./storage');
const ChromeWebRequestAPIHandler = require('./web-request');
const ChromeWindowsAPIHandler = require('./windows').default;
const Cookies = require('./cookies').default;

class ChromeAPIHandler {
    constructor(extensionId) {
        this.storage = new ChromeStorageAPIHandler(extensionId);
        this.webRequest = new ChromeWebRequestAPIHandler(extensionId);
        this.windows = new ChromeWindowsAPIHandler(extensionId);
        this.cookies = new Cookies(extensionId);
    }

    release() {
        [this.storage, this.webRequest, this.windows]
            .forEach((api) => api.release())
    }
}

module.exports = ChromeAPIHandler;
