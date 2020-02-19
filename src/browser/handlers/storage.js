const { RpcIpcManager } = require('electron-simple-rpc');
const { ipcSend, ipcReceive } = require('electron-simple-ipc');
const capitalize = require('capitalize');
const path = require('path');
const fs = require('fs-extra');
const PQueue = require('p-queue');
const { app } = require('electron');
const { EventEmitter } = require('events');

class FileChromeStorageBackend {
    constructor(areaName, extensionId) {
        this.areaName = areaName;
        this.extensionId = extensionId;
    }

    get storageFilePath() {
        return path.join(
            app.getPath('userData'),
            `/Chrome Storage/${this.extensionId}-${this.areaName}.json`
        )
    }

    readStorageFile() {
        return fs
            .readJson(this.storageFilePath)
            .catch(err => {
                if (err.code === 'ENOENT' || err instanceof SyntaxError) return {};
                throw err
            })
    }

    writeStorageFile(data) {
        return fs.outputJson(this.storageFilePath, data);
    }

    get() {
        return this.readStorageFile()
    }

    set(data) {
        return this.writeStorageFile(data)
    }


}

class ChromeStorageAreaAPIHandler extends EventEmitter {
    constructor(areaName, extensionId) {
        super();
        this.storage = new FileChromeStorageBackend(areaName, extensionId);

        // via operatonsQueue, we make get, set, remove, clear methods atomique
        this.operationsQueue = new PQueue({ concurrency: 1 });

        const lib = {};
        ['get', 'set', 'remove', 'clear'].forEach(methodName => {
            const handler = this[`handle${capitalize(methodName)}`];
            lib[methodName] = (...args) => {
                return this.operationsQueue.add(() => handler.apply(this, args))
            }
        })
        const rpcScope = `chrome-storage-${areaName}-${extensionId}`;
        this.rpcManager = new RpcIpcManager(lib, rpcScope);
    }

    handleGet(keys) {
        return this.storage.get().then(storage => {
            if (keys == null) return storage

            let defaults = {}
            switch (typeof keys) {
                case 'string':
                    keys = [keys]
                    break
                case 'object':
                    if (!Array.isArray(keys)) {
                        defaults = keys
                        keys = Object.keys(keys)
                    }
                    break
            }
            if (keys.length === 0) return {}

            let items = {}
            keys.forEach(function (key) {
                var value = storage[key]
                if (value == null) value = defaults[key]
                items[key] = value
            })
            return items
        })
    }

    handleSet(items) {
        return this.storage.get().then(storage => {
            Object.keys(items).forEach(function (name) {
                storage[name] = items[name]
            })

            return this.storage.set(storage)
        })
            // TODO: properly populate changes
            .then(() => this.emit('changed', {}))
    }

    handleRemove(keys) {
        return this.storage.get().then(storage => {
            if (!Array.isArray(keys)) {
                keys = [keys]
            }
            keys.forEach(function (key) {
                delete storage[key]
            })

            return this.storage.set(storage);
        })
            // TODO: properly populate changes
            .then(() => this.emit('changed', {}))
    }

    handleClear() {
        return this.storage.set({})
            // TODO: properly populate changes
            .then(() => this.emit('changed', {}))
    }

    release() {
        this.rpcManager.release();
    }
}

class ChromeStorageAPIHandler {
    constructor(extensionId) {
        this.syncStorageAPIHandler = new ChromeStorageAreaAPIHandler('sync', extensionId);
        this.localStorageAPIHandler = new ChromeStorageAreaAPIHandler('local', extensionId);
        this.managedStorageAPIHandler = new ChromeStorageAreaAPIHandler('managed', extensionId);

        const eventName = `chrome-storage-changed-${extensionId}`;
        this.syncStorageAPIHandler.on('changed', changes =>
            ipcSend(eventName, [changes, 'sync']));
        this.localStorageAPIHandler.on('changed', changes =>
            ipcSend(eventName, [changes, 'local']));
        this.managedStorageAPIHandler.on('changed', changes =>
            ipcSend(eventName, [changes, 'managed']));
    }
    release() {
        this.syncStorageAPIHandler.release();
        this.localStorageAPIHandler.release();
        this.managedStorageAPIHandler.release();
    }
}

module.exports = ChromeStorageAPIHandler;
