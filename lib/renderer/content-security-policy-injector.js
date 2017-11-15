// Transfer CSP to renderer

const {ipcRenderer, webFrame} = require('electron');

const getContentSecurityPolicy = () => ipcRenderer.sendSync('GET_CONTENTSECURITYPOLICY_SYNC');
const contentSecurityPolicy = getContentSecurityPolicy();

if (contentSecurityPolicy.policy) {
  const worldId = require('./isolated-worlds').getIsolatedWorldId(contentSecurityPolicy.extensionId)
  webFrame.setIsolatedWorldContentSecurityPolicy(worldId, contentSecurityPolicy.policy);
}
