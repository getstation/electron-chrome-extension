const url = require('url');
const constants = require('../common/constants');
const isBackgroundPage = process.argv.indexOf('--electron-chrome-extension-background-page') !== -1;

// Mixmax detect the navigator user agent for his own desktop app
// and add a behvior that is not compliant with our mechanism.
// Electron itself isn't responsible for navigator behavior
// as the Electron team don't overwrite any of those APIs for now.
// ref: https://github.com/electron/electron/issues/11290#issuecomment-362301961
Object.defineProperty(window.navigator, 'userAgent', {
  value: window.navigator.userAgent.replace(/Electron\/\S*\s/, ''),
  configurable: false,
  writable: false,
});

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
  // native window open workaround
  const ipcRenderer = require('@electron/internal/renderer/ipc-renderer-internal');
  const { guestInstanceId, openerId } = process;

  require('./window-setup')(window, ipcRenderer, guestInstanceId, openerId);
  // end workaround

  require('./xhr').default(window);

  require('./injectors/content-scripts-injector')
}
