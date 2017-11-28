const { rpc, RpcIpcManager } = require('electron-simple-rpc');

class RCEventControler extends EventEmitter {
  constructor(eventId) {
    super();
    this.listeners = new Map();

    this.controlerRPCScope = `${eventId}-controler`;
    this.eventRPCScope = `${eventId}-event`;

    this.rcpManager = new RpcIpcManager({
      addListener: this._addListener.bind(this)
    }, this.controlerRPCScope)
    
  }

  _addListener(listernerId, listenerArgs) {
    const remoteCallListner = (args) => {
      // todo: add tiemout
      return rpc(this.eventRPCScope, 'triggerListener')(listernerId, args);
    }
    this.emit('new-listener', listenerArgs, remoteCallListner);
  }

  _removeListener(listernerId) {
    // todo
  }

  release() {
    // todo
  }
 }

module.exports = RCEventControler;
