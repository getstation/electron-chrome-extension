const url = require('url');
const constants = require('../common/constants');
const isBackgroundPage = process.argv.indexOf('--electron-chrome-extension-background-page') !== -1;

const { protocol, hostname } = url.parse(window.location.href);

if (protocol === `${constants.EXTENSION_PROTOCOL}:`) {
  // Add implementations of chrome API.
  require('./chrome-api').injectTo(hostname, isBackgroundPage, window);

  process.once('loaded', function () {
    delete global.require
    delete global.module
    // delete global.process
    delete global.Buffer
    delete global.setImmediate
    delete global.clearImmediate
    delete global.global
  })
} else {
  require('./injectors/content-scripts-injector')
}
