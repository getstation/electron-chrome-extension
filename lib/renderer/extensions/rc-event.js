const { rpc, RpcIpcManager } = require('electron-simple-rpc');
const uuid = require('uuid/v1');

class RCEvent {
  constructor(eventId) {
    this.listeners = new Map();

    this.controlerRPCScope = `${eventId}-controler`;
    this.eventRPCScope = `${eventId}-event`;

    this.rcpManager = new RpcIpcManager({
      triggerListener: this._triggerListener.bind(this)
    }, this.controlerRPCScope)
  }

  addListener(callback, ...args) {
    const listernerId = uuid()
    this.listeners.set(listernerId, callback);
    rpc(this.controlerRPCScope, 'addListner')(listernerId, args);
  }

  hasListener(callback) {
    // todo
    return this.listeners.indexOf(callback) !== -1;
  }

  removeListener(callback) {
    // todo: get listernerId and rpc removeListener
  }

  _triggerListener(listernerId, args) {
    const listener = this.listeners.get(listernerId);
    return listener.call(args);
  }
}

module.exports = Event;
