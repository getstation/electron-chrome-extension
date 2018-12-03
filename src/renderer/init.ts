import { webFrame } from 'electron';
import { backgroundPageProcessFlag, Protocol } from 'src/shared/types';
import injectChromeApi from './chrome-api';

const isBackgroundPage = process.argv.indexOf(backgroundPageProcessFlag) !== -1;
const { protocol, hostname } = new URL(window.location.href);

if (protocol === Protocol.Extension) {
  injectChromeApi(window, hostname, isBackgroundPage);

  process.once(
    'loaded',
    () => {
      // @ts-ignore require does not exists on global
      delete global.require
      // @ts-ignore module does not exists on global
      delete global.module
      // delete global.process
      delete global.Buffer
      delete global.setImmediate
      delete global.clearImmediate
      delete global.global
    },
  )
} else if (protocol === Protocol.Chrome) {
} else {
  webFrame.registerURLSchemeAsPrivileged(
    Protocol.Extension,
    { corsEnabled: false },
  );

  // prevent from colliding with chrome/electron ids
  // https://github.com/electron/electron/blob/c18afc924b7218555e529c0583773f58e1015cbe/atom/renderer/atom_render_frame_observer.h#L13

  // 0 main world
  // 999 its own isolated world

  // const setupContentScript = function (extensionId, worldId, callback) {
  //   const chromeAPIs = require('../chrome-api').injectTo(extensionId, false)

  //   webFrame.executeJavaScriptInIsolatedWorld(worldId, [{ code: 'window', url: `${extensionId}://ChromeAPI` }], function (isolatedWorldWindow) {
  //     isolatedWorldWindow.chrome = chromeAPIs;
  //     callback()
  //   });
  // }

  // // Run the code with chrome API integrated.
  // const injectContentScript = function (worldId, scripts) {
  //   webFrame.executeJavaScriptInIsolatedWorld(worldId, scripts);
  // }

  // // Run injected scripts.
  // // https://developer.chrome.com/extensions/content_scripts
  // const addContentScript = function (extensionId, script) {
  //   if (!script.matches.some(matchesPattern)) return
  //   if (script.exclude_matches && script.exclude_matches.some(matchesPattern)) return
  //   const worldId = require('../isolated-worlds').getIsolatedWorldId(extensionId)

  //   const fire = () => injectContentScript(worldId, script.js.map((js) => ({
  //     code: js.code,
  //     url: js.url
  //   })));

  //   if (script.js) {
  //     if (script.runAt === 'document_start') {
  //       process.once('document-start', fire)
  //     } else if (script.runAt === 'document_end') {
  //       process.once('document-end', fire)
  //     } else if (script.runAt === 'document_idle') {
  //       document.addEventListener('DOMContentLoaded', fire)
  //     }
  //   }

  //   if (script.css) {
  //     for (const { code } of script.css) {
  //       process.once('document-end', () => {
  //         var node = document.createElement('style')
  //         node.innerHTML = code
  //         window.document.body.appendChild(node)
  //       })
  //     }
  //   }
  // }

  // // Read the renderer process preferences.
  // const getContentScripts = () => ipcRenderer.sendSync('GET_CONTENTSCRIPTS_SYNC');
  // const contentScripts = getContentScripts();

  // Object.keys(contentScripts).forEach(key => {
  //   const cs = contentScripts[key];
  //   const worldId = require('../isolated-worlds').getIsolatedWorldId(cs.extensionId)

  //   webFrame.setIsolatedWorldHumanReadableName(worldId, cs.extensionName)
  //   webFrame.setIsolatedWorldSecurityOrigin(worldId, `chrome-extension://${cs.chromeStoreExtensionId}`)
  //   webFrame.setIsolatedWorldContentSecurityPolicy(worldId, contentSecurityPolicy.policy);


  //   if (cs.contentScripts) {
  //     setupContentScript(cs.extensionId, worldId, function () {
  //       for (const script of cs.contentScripts) {
  //         addContentScript(cs.extensionId, script)
  //       }
  //     })
  //   }
  // })

}
