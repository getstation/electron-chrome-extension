const { ipcRenderer, webFrame } = require('electron');
const constants = require('../../common/constants');

process.setMaxListeners(100);

// Check whether pattern matches.
// https://developer.chrome.com/extensions/match_patterns
const matchesPattern = function (pattern) {
  if (pattern === '<all_urls>') return true
  const regexp = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
  const url = `${location.protocol}//${location.host}${location.pathname}`
  return url.match(regexp)
}

const setupContentScript = function (extensionId, worldId, callback) {
  const chromeAPIs = require('../chrome-api').injectTo(extensionId, false, {})

  webFrame.executeJavaScriptInIsolatedWorld(worldId, [{ code: 'window', url: `${extensionId}://ChromeAPI` }], function (isolatedWorldWindow) {
    isolatedWorldWindow.chrome = chromeAPIs;
    callback(isolatedWorldWindow)
  });
}

// Run the code with chrome API integrated.
const injectContentScript = function (worldId, scripts) {
  webFrame.executeJavaScriptInIsolatedWorld(worldId, scripts);
}

// Run injected scripts.
// https://developer.chrome.com/extensions/content_scripts
const addContentScript = function (extensionId, script) {
  if (!script.matches.some(matchesPattern)) return
  if (script.exclude_matches && script.exclude_matches.some(matchesPattern)) return
  const worldId = require('../isolated-worlds').getIsolatedWorldId(extensionId)

  const fire = () => injectContentScript(worldId, script.js.map((js) => ({
    code: js.code,
    url: js.url
  })));

  if (script.js) {
    if (script.runAt === 'document_start') {
      process.once('document-start', fire)
    } else if (script.runAt === 'document_end') {
      process.once('document-end', fire)
    } else if (script.runAt === 'document_idle') {
      document.addEventListener('DOMContentLoaded', fire)
    }
  }

  if (script.css) {
    for (const { code } of script.css) {
      process.once('document-end', () => {
        var node = document.createElement('style')
        node.innerHTML = code
        window.document.body.appendChild(node)
      })
    }
  }
}

// Handle the request of chrome.tabs.executeJavaScript.
ipcRenderer.on(constants.TABS_EXECUTESCRIPT, function (event, senderWebContentsId, requestId, extensionId, url, code) {
  const worldId = require('../isolated-worlds').getIsolatedWorldId(extensionId)
  const result = injectContentScript(worldId, [{ url, code }])
  ipcRenderer.sendToAll(senderWebContentsId, `${constants.TABS_EXECUTESCRIPT_RESULT_}${requestId}`, result)
})

// Read the renderer process preferences.
const getContentScripts = () => ipcRenderer.sendSync('GET_CONTENTSCRIPTS_SYNC');
const getContentSecurityPolicy = () => ipcRenderer.sendSync('GET_CONTENTSECURITYPOLICY_SYNC');
const contentScripts = getContentScripts();

const setIsolatedWorldInfo = (worldId, humanReadableName, securityOrigin, csp) => {
  webFrame.setIsolatedWorldInfo(
    worldId,
    {
      securityOrigin,
      name: humanReadableName,
      csp,
    });
};

Object.keys(contentScripts).forEach(key => {
  const cs = contentScripts[key];
  const worldId = require('../isolated-worlds').getIsolatedWorldId(cs.extensionId)

  const contentSecurityPolicy = getContentSecurityPolicy();
  // Defaults to Chromium kDefaultIsolatedWorldCSP_Secure
  // https://cs.chromium.org/chromium/src/extensions/common/manifest_handlers/csp_info.cc?l=36
  const csp = contentSecurityPolicy.policy || "script-src 'self'; object-src 'self'";

  setIsolatedWorldInfo(worldId, cs.extensionName, `${constants.EXTENSION_PROTOCOL}://${cs.extensionId}`, csp);

  if (cs.contentScripts) {
    setupContentScript(cs.extensionId, worldId, function (isolatedWorldWindow) {
      // native window open workaround
      const { ipcRendererInternal } = require('../api/ipc-renderer-internal');

      const { guestInstanceId, openerId } = process;

      // hardcoded gmelius extension id
      const shouldUseNonNativeWinOpen = cs.extensionId === 'dheionainndbbpoacpnopgmnihkcmnkl';

      require('../window-setup')(isolatedWorldWindow, ipcRendererInternal, guestInstanceId, openerId, shouldUseNonNativeWinOpen);
      // end workaround

      require('../xhr').default(isolatedWorldWindow);

      for (const script of cs.contentScripts) {
        addContentScript(cs.extensionId, script)
      }
    })
  }
})
