const Event = require('./event');

exports.setup = extensionId => {
    return {
        create () {},
        update () {},
        clear () {},
        getAll () {},
        getPermissionLevel () {},
        onClosed: new Event(),
        onClicked: new Event(),
        onButtonClicked: new Event(),
        onPermissionLevelChanged: new Event(),
        onShowSettings: new Event(),
    }
}
