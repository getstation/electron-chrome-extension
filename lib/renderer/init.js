const url = require('url');

const constants = require('../common/constants');
const isBackgroundPage = process.argv.indexOf('--electron-chrome-extension-background-page') !== -1;

// use url module because window.location does not parse the hostname as we expect
const { protocol, hostname } = url.parse(window.location.href);

if (protocol === `${constants.EXTENSION_PROTOCOL}:`) {
  // Add implementations of chrome API.
  require('./chrome-api').injectTo(hostname, isBackgroundPage, window)
} else if (protocol === 'chrome:') {
} else {
  // Inject content scripts.
  require('./content-scripts-injector')
}