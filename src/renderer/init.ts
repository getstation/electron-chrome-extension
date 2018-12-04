import { webFrame, ipcRenderer } from 'electron';
import { backgroundPageProcessFlag, Protocol, ECxChannels, UserScripts, ScriptRuntimeManifest, Script, ScriptRuntimeProcess, Extension } from '../shared/types';
import injectChromeApi from './chrome-api';
import { parse } from 'url';

// todo: rewrite
const matchesPattern = (pattern: string): boolean => {
  if (pattern === '<all_urls>') return true
  const regexp = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
  const url = `${location.protocol}//${location.host}${location.pathname}`
  return Boolean(url.match(regexp));
}

const injectedExtensions = new Set<Extension>();

export const injectExtension = (extension: Extension): void => {
  if (injectedExtensions.has(extension)) return;

  const {
    id,
    userScripts,
  } = extension;

  const injectScript = (
    isolatedWorlId: UserScripts['isolatedWorlId'],
    script: Script
  ) => {
    const { matches, exclude_matches, run_at, js, css } = script;

    if (!matches.some(matchesPattern)) return
    if (exclude_matches && exclude_matches.some(matchesPattern)) return;

    const delayedExecution = () =>
      webFrame.executeJavaScriptInIsolatedWorld(isolatedWorlId, js!);

    if (js) {
      if (run_at === ScriptRuntimeManifest.DocumentStart) {
        // @ts-ignore : event type inference suck
        process.once(ScriptRuntimeProcess.DocumentStart, delayedExecution);
      } else if (run_at === ScriptRuntimeManifest.DocumentEnd) {
        // @ts-ignore : event type inference suck
        process.once(ScriptRuntimeProcess.DocumentEnd, delayedExecution);
      } else if (run_at === ScriptRuntimeManifest.DocumentIdle) {
        document.addEventListener(
          ScriptRuntimeProcess.DocumentIdle,
          delayedExecution
        );
      }
    }

    if (css) {
      for (const { code } of css) {
        process.once(
          // @ts-ignore : event type inference suck
          ScriptRuntimeProcess.DocumentEnd,
          () => {
            var node = document.createElement('style');
            node.innerHTML = code;
            window.document.body.appendChild(node);
          }
        );
      }
    }
  }

  if (userScripts) {
    const {
      isolatedWorlId,
      humanName,
      contentSecurityOrigin,
      contentSecurityPolicy,
      scripts,
    } = userScripts;

    webFrame.setIsolatedWorldHumanReadableName(isolatedWorlId, humanName);
    webFrame.setIsolatedWorldSecurityOrigin(
      isolatedWorlId,
      contentSecurityOrigin
    );
    webFrame.setIsolatedWorldContentSecurityPolicy(
      isolatedWorlId,
      contentSecurityPolicy
    );

    webFrame.executeJavaScriptInIsolatedWorld(
      isolatedWorlId,
      [{ code: 'window', url: `${id}://api` }],
      false,
      (isolatedWorldWindow: Window) => {
        injectChromeApi(isolatedWorldWindow, id, false);
        for (const script of scripts) {
          injectScript(isolatedWorlId, script);
        }
      }
    );
  }
}

// todo
export const unloadExtension = (_: Extension): void => {

}

const isBackgroundPage = process.argv.indexOf(backgroundPageProcessFlag) !== -1;
const { protocol, hostname } = parse(window.location.href);

if (protocol === Protocol.Extension) {
  injectChromeApi(window, hostname!, isBackgroundPage);

  process.once(
    'loaded',
    () => {
      // @ts-ignore : require does not exists on global
      delete global.require
      // @ts-ignore : module does not exists on global
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

  const extensions: Extension[] = ipcRenderer
    .sendSync(ECxChannels.OnCreateRenderer);

  for (const extension of extensions) {
    injectExtension(extension);
  }

  ipcRenderer.on(ECxChannels.OnExtensionLoaded, injectExtension);
  ipcRenderer.on(ECxChannels.OnExtensionUnloaded, unloadExtension);
}
