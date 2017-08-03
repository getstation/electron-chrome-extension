const Event = require('./event');

exports.setup = extensionId => {
    return {
      setTitle: () => {},
      getTitle: () => {},
      setIcon: () => {},
      setPopup: () => {},
      getPopup: () => {},
      setBadgeText: () => {},
      getBadgeText: () => {},
      setBadgeBackgroundColor: () => {},
      getBadgeBackgroundColor: () => {},
      enable: () => {},
      disable: () => {},
      onClicked: new Event(),
  }
}
