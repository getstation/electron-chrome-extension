const { rpc, RpcIpcManager } = require('electron-simple-rpc');
const EventEmitter = require('events');

class RCEventController extends EventEmitter {
  constructor(eventId) {
    super();
    this.listeners = new Map();

    this.controlerRPCScope = `${eventId}-controller`;
    this.eventRPCScope = `${eventId}-event`;

    this.rcpManager = new RpcIpcManager({
      addListener: this._addListener.bind(this),
      removeListener: this._removeListener.bind(this)
    }, this.controlerRPCScope);
    
  }

  _addListener(listenerId, listenerArgs) {
    const remoteCallListener = (args) => {
      // todo: add timeout
      return rpc(this.eventRPCScope, 'triggerListener')(listenerId, args);
    };
    this.emit('new-listener', listenerArgs, remoteCallListener);
  }

  _removeListener(listenerId) {
    this.listeners.delete(listenerId)
  }

  release() {
    this.rcpManager.release();
  }
 }

module.exports = RCEventController;
