const { rpc, RpcIpcManager } = require('electron-simple-rpc');
const { ipcMain } = require('electron');
const EventEmitter = require('events');

ipcMain.setMaxListeners(100);

class RCEventController extends EventEmitter {
  constructor(eventId) {
    super();

    this.controlerRPCScope = `${eventId}-controller`;
    this.eventRPCScope = `${eventId}-event`;

    this.rpcManager = new RpcIpcManager({
      addListener: this._addListener.bind(this)
    }, this.controlerRPCScope);
    
  }

  _addListener(listenerId, listenerArgs) {
    const remoteCallListener = (args) =>
      rpc(this.eventRPCScope, 'triggerListener')(listenerId, args).timeout(2500);
    this.emit('add-listener', listenerArgs, remoteCallListener);
  }

  release() {
    this.rpcManager.release();
  }
 }

module.exports = RCEventController;
