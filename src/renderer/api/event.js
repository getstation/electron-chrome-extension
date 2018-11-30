class Event {
  constructor() {
    this.listeners = [];
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  hasListener(callback) {
    return this.listeners.indexOf(callback) !== -1;
  }

  removeListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index !== -1) {
      this.listeners.splice(index, 1)
    }
  }

  hasListener(callback) {
    const index = this.listeners.indexOf(callback)
    return index !== -1
  }

  emit(...args) {
    for (const listener of this.listeners) {
      listener(...args);
    }
  }
}

module.exports = Event;
