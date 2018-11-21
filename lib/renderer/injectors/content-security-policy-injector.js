const {ipcRenderer, webFrame} = require('electron');

const getContentSecurityPolicy = () => ipcRenderer.sendSync('GET_CONTENTSECURITYPOLICY_SYNC');
const contentSecurityPolicy = getContentSecurityPolicy();
const worldId = require('../isolated-worlds').getIsolatedWorldId(contentSecurityPolicy.extensionId);

if (contentSecurityPolicy.policy) {
  webFrame.setIsolatedWorldContentSecurityPolicy(worldId, contentSecurityPolicy.policy);
} else {
  webFrame.setIsolatedWorldContentSecurityPolicy(worldId, "script-src 'self'; object-src 'self'");
}
