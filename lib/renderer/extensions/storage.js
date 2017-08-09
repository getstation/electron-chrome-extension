const { rpc, RpcIpcManager } = require('electron-simple-rpc');

class StorageManagerProxy {
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
  setup: extensionId => ({
    sync: new StorageManagerProxy('sync', extensionId),
    local: new StorageManagerProxy('local', extensionId),
    onChanged: {
      addListener: cb => { }
    }
  })
}
