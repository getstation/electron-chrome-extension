const Event = require('./event');

exports.setup = extensionId => {
  return {
    setTitle: (_, cb) => cb(),
    getTitle: (_, cb) => cb(),
    setIcon: (_, cb) => cb(),
    setPopup: (_, cb) => cb(),
    getPopup: (_, cb) => cb(),
    setBadgeText: (_, cb) => cb(),
    getBadgeText: (_, cb) => cb(),
    setBadgeBackgroundColor: (_, cb) => cb(),
    getBadgeBackgroundColor: (_, cb) => cb(),
    enable: (_, cb) => cb(),
    disable: (_, cb) => cb(),
    onClicked: new Event(),
  }
}
