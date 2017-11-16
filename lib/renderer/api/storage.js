const { rpc, RpcIpcManager } = require('electron-simple-rpc');
const { ipcSend, ipcReceive } = require('electron-simple-ipc');
const Event = require('./event');

class ChromeStorageAreaAPIClient {
  constructor(areaName, extensionId) {
    this.rpcScope = `chrome-storage-${areaName}-${extensionId}`;
    this.rpcManager = new RpcIpcManager({}, this.rpcScope);
  }
  get(keys, callback) {
    rpc(this.rpcScope, 'get')(keys)
      .then(callback);
  }
  set(items, callback) {
    rpc(this.rpcScope, 'set')(items).then(callback);
  }
  remove(keys, callback) {
    rpc(this.rpcScope, 'remove')(keys).then(callback);
  }

  clear(callback) {
    rpc(this.rpcScope, 'clear')().then(callback);
  }
}

module.exports = {
  setup: extensionId => {

    const changedEvent = new Event();
    ipcReceive(`chrome-storage-changed-${extensionId}`,
      payload => changedEvent.emit.apply(changedEvent, payload)
    )

    return  {
        sync: new ChromeStorageAreaAPIClient('sync', extensionId),
        local: new ChromeStorageAreaAPIClient('local', extensionId),
        onChanged: changedEvent,
      };
  }
}
