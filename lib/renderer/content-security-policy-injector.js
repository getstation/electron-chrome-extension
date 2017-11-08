// Transfer CSP to renderer

const {ipcRenderer, webFrame} = require('electron');

const addResourceToCsp = function(link) {
  const destinationHost = (new URL(link)).hostname.replace(/([a-zA-Z0-9]+.)/,'');
  webFrame.addOriginAccessWhitelistEntry(window.location.origin, 'https', destinationHost, true);
}

const injectCspPolicy = function(contentSecurityPolicy) {
  contentSecurityPolicy.forEach(addResourceToCsp)
}


// Read the renderer process preferences.
const getContentSecurityPolicy = () => ipcRenderer.sendSync('GET_CONTENTSECURITYPOLICY_SYNC');
const contentSecurityPolicy = getContentSecurityPolicy();
injectCspPolicy(contentSecurityPolicy);

