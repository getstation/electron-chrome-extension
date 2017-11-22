const url = require('url');
const {webFrame} = require('electron')

const constants = require('../common/constants');
const isBackgroundPage = process.argv.indexOf('--electron-chrome-extension-background-page') !== -1;

// use url module because window.location does not parse the hostname as we expect
const { protocol, hostname } = url.parse(window.location.href);

if (protocol === `${constants.EXTENSION_PROTOCOL}:`) {
  // console.log(protocol, hostname)
  const worldId = require('./injectors/isolated-worlds').getIsolatedWorldId(hostname)
  // console.log(`electron-chrome-extension://${hostname}`)
  // webFrame.setIsolatedWorldSecurityOrigin(0, `electron-chrome-extension://${hostname}`)
  // webFrame.setIsolatedWorldSecurityOrigin(999, `electron-chrome-extension://${hostname}`)
  // webFrame.setIsolatedWorldSecurityOrigin(worldId, `electron-chrome-extension://${hostname}`)
  // window.origin = `electron-chrome-extension://${hostname}`
  // console.log(window.origin)
  // webFrame.registerURLSchemeAsBypassingCSP('electron-chrome-extension')

  // const getContentSecurityPolicy = () => ipcRenderer.sendSync('GET_CONTENTSECURITYPOLICY_SYNC');
  // const contentSecurityPolicy = getContentSecurityPolicy();
  //
  // if (contentSecurityPolicy.policy) {
  //   webFrame .setIsolatedWorldContentSecurityPolicy(worldId, contentSecurityPolicy.policy);
  // }

  // webFrame.executeJavaScriptInIsolatedWorld(worldId, [{ code: 'window', url: `${hostname}://ChromeAPI` }], function(isolatedWorldWindow) {
  //   isolatedWorldWindow.origin = `electron-chrome-extension://${hostname}`
  // });

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
} else if (protocol === 'chrome:') {
} else {
  require('./injectors/content-security-policy-injector')
  require('./injectors/content-scripts-injector')
}