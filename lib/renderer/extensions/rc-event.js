const { rpc, RpcIpcManager } = require('electron-simple-rpc');
const uuid = require('uuid/v1');

class RCEvent {
  constructor(eventId) {
    this.listeners = new Map();

    this.controlerRPCScope = `${eventId}-controler`;
    this.eventRPCScope = `${eventId}-event`;

    this.rcpManager = new RpcIpcManager({
      triggerListener: this._triggerListener.bind(this)
    }, this.eventRPCScope)
  }

  addListener(callback, ...args) {
    const listenerId = uuid()
    this.listeners.set(listenerId, callback);
    rpc(this.controlerRPCScope, 'addListener')(listenerId, args);
  }

  hasListener(callback) {
    // todo
    return this.listeners.indexOf(callback) !== -1;
  }

  removeListener(callback) {
    // todo: get listenerId and rpc removeListener
  }

  _triggerListener(listenerId, args) {
    const listener = this.listeners.get(listenerId);
    if (!listener) return;

    // todo: do try catch
    const ret = listener.call(this, args);
    return ret;
  }
}

module.exports = RCEvent;
