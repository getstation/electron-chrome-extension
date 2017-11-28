const { rpc, RpcIpcManager } = require('electron-simple-rpc');
const uuid = require('uuid/v1');

class RCEvent {
  constructor(eventId) {
    this.listeners = new Map();

    this.controllerRPCScope = `${eventId}-controller`;
    this.eventRPCScope = `${eventId}-event`;

    this.rcpManager = new RpcIpcManager({
      triggerListener: this._triggerListener.bind(this)
    }, this.eventRPCScope)
  }

  addListener(callback, ...args) {
    const listenerId = uuid();
    this.listeners.set(listenerId, callback);
    rpc(this.controllerRPCScope, 'addListener')(listenerId, args);
  }

  hasListener(callback) {
    return !!this._listenerIdFromCallback(callback)
  }

  removeListener(callback) {
    const [listenerId, cb] = this._listenerIdFromCallback(callback);
    this.listeners.delete(listenerId)
  }

  _triggerListener(listenerId, args) {
    const listener = this.listeners.get(listenerId);
    if (!listener) return;

    try {
      return listener.call(this, args);
    } catch (e) {
      return e
    }
  }

  _listenerIdFromCallback(callback) {
    return this.listeners.entries()
      .find(e => e[1] === callback)
  }
}

module.exports = RCEvent;
