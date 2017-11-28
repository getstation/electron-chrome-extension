const { rpc, RpcIpcManager } = require('electron-simple-rpc');
const EventEmitter = require('events');

class RCEventController extends EventEmitter {
  constructor(eventId) {
    super();

    this.controlerRPCScope = `${eventId}-controller`;
    this.eventRPCScope = `${eventId}-event`;

    this.rcpManager = new RpcIpcManager({
      addListener: this._addListener.bind(this)
    }, this.controlerRPCScope);
    
  }

  _addListener(listenerId, listenerArgs) {
    const remoteCallListener = (args) =>
      rpc(this.eventRPCScope, 'triggerListener')(listenerId, args).timeout(100);
    this.emit('add-listener', listenerArgs, remoteCallListener);
  }

  release() {
    this.rcpManager.release();
  }
 }

module.exports = RCEventController;
