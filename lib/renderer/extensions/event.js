class Event {
  constructor () {
    this.listeners = []
  }

  addListener (callback) {
    this.listeners.push(callback)
  }

  removeListener (callback) {
    const index = this.listeners.indexOf(callback)
    if (index !== -1) {
      this.listeners.splice(index, 1)
    }
  }

  hasListener (callback) {
    const index = this.listeners.indexOf(callback)
    if (index !== -1) {
      return true
    } else {
      return false
    }
  }

  emit (...args) {
    for (const listener of this.listeners) {
      listener(...args)
    }
  }
}

module.exports = Event;