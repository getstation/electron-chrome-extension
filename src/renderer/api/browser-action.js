const Event = require('./event');

exports.setup = extensionId => {
  return {
    setTitle: (_, cb) => cb && cb(),
    getTitle: (_, cb) => cb && cb(),
    setIcon: (_, cb) => cb && cb(),
    setPopup: (_, cb) => cb && cb(),
    getPopup: (_, cb) => cb && cb(),
    setBadgeText: (_, cb) => cb && cb(),
    getBadgeText: (_, cb) => cb && cb(),
    setBadgeBackgroundColor: (_, cb) => cb && cb(),
    getBadgeBackgroundColor: (_, cb) => cb && cb(),
    enable: (_, cb) => cb && cb(),
    disable: (_, cb) => cb && cb(),
    onClicked: new Event(),
  }
}
