const ChromeStorageAPIHandler = require('./storage');

class ChromeAPIHandler {
    constructor(extensionId) {
        this.storage = new ChromeStorageAPIHandler(extensionId);
    }

    release() {
        this.storage.release();
    }
}

module.exports = ChromeAPIHandler;
