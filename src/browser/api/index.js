const ChromeStorageAPIHandler = require('./storage');
const ChromeWebRequestAPIHandler = require('./web-request');

class ChromeAPIHandler {
    constructor(extensionId) {
        this.storage = new ChromeStorageAPIHandler(extensionId);
        this.webRequest = new ChromeWebRequestAPIHandler(extensionId);
    }

    release() {
        [this.storage, this.webRequest].forEach((api) => api.release())
    }
}

module.exports = ChromeAPIHandler;
