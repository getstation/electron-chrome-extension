const constants = require('../common/constants');

if (window.location.protocol === constants.EXTENSION_PROTOCOL) {
  // Add implementations of chrome API.
  require('./chrome-api').injectTo(window.location.hostname, isBackgroundPage, window)
  nodeIntegration = 'false'
} else if (window.location.protocol === 'chrome:') {
} else {
  // Inject content scripts.
  require('./content-scripts-injector')
}