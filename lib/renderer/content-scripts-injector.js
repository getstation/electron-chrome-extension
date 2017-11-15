const {ipcRenderer, webFrame} = require('electron')
const {runInThisContext} = require('vm')
const constants = require('../common/constants')

webFrame.registerURLSchemeAsPrivileged(constants.EXTENSION_PROTOCOL);

process.setMaxListeners(100);

// Check whether pattern matches.
// https://developer.chrome.com/extensions/match_patterns
const matchesPattern = function (pattern) {
  if (pattern === '<all_urls>') return true
  const regexp = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
  const url = `${location.protocol}//${location.host}${location.pathname}`
  return url.match(regexp)
}

const setupContentScript = function (extensionId) {
  const context = {}
  const worldId = require('./isolated-worlds').getIsolatedWorldId(extensionId)
  const chromeAPIs = require('./chrome-api').injectTo(extensionId, false, context)

  webFrame.executeJavaScriptInIsolatedWorld(worldId, 'window', `${extensionId}://ChromeAPI`, function(isolatedWorldWindow) {
    isolatedWorldWindow.chrome = chromeAPIs;
  });
}

// Run the code with chrome API integrated.
const injectContentScript = function (extensionId, url, code) {
  const worldId = require('./isolated-worlds').getIsolatedWorldId(extensionId)
  webFrame.executeJavaScriptInIsolatedWorld(worldId, code, url, 'kAsynchronousBlockingOnload');
}

// Run injected scripts.
// https://developer.chrome.com/extensions/content_scripts
const addContentScript = function (extensionId, script) {
  if (!script.matches.some(matchesPattern)) return
  if (script.exclude_matches && script.exclude_matches.some(matchesPattern)) return

  if (script.js) {
    if (script.runAt === 'document_start') {
      process.once('document-start', function() {
        script.js.map(function(js) {
          return injectContentScript(extensionId, js.url, js.code)
        });
      });
    } else if (script.runAt === 'document_end') {
      process.once('document-end', function() {
        script.js.map(function(js) {
          return injectContentScript(extensionId, js.url, js.code)
        });
      })
    } else if (script.runAt === 'document_idle') {
      document.addEventListener('DOMContentLoaded', function() {
        script.js.map(function(js) {
          return injectContentScript(extensionId, js.url, js.code)
        });
      })
    }
  }

  if (script.css) {
    for (const {code} of script.css) {
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
  const result = runContentScript.call(window, extensionId, url, code)
  ipcRenderer.sendToAll(senderWebContentsId, `${constants.TABS_EXECUTESCRIPT_RESULT_}${requestId}`, result)
})

// Read the renderer process preferences.
const getContentScripts = () => ipcRenderer.sendSync('GET_CONTENTSCRIPTS_SYNC');
const contentScripts = getContentScripts();

Object.keys(contentScripts).forEach(key => {
  const cs = contentScripts[key];
  if (cs.contentScripts) {
    const worldId = require('./isolated-worlds').getIsolatedWorldId(cs.extensionId)
    webFrame.setIsolatedWorldHumanReadableName(worldId, cs.extensionName)
    webFrame.setIsolatedWorldSecurityOrigin(worldId, 'https://github.com')
    setupContentScript(cs.extensionId)
    for (const script of cs.contentScripts) {
      addContentScript(cs.extensionId, script)
    }
  }
})