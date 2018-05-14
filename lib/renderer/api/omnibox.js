const Event = require('./event');

exports.setup = extensionId => {
  return {
    onInputStarted: new Event(),
    onInputChanged: new Event(),
    onInputEntered: new Event(),
    onInputCancelled: new Event(),
    onDeleteSuggestion: new Event()
  }
}
