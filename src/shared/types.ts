export type ExtensionFS = {
  id: string,
  manifest: Manifest,
  src: string,
}

export type Extension = ExtensionFS & {
  userScripts?: UserScripts,
  backgroundPage?: BackgroundPage,
}

// https://cs.chromium.org/chromium/src/extensions/common/api/_manifest_features.json
export type Manifest = {
  name: string,
  background: {
    page: string,
    scripts: Script<string>[],
  },
  content_security_policy: string,
} & any // todo

export type BackgroundPage = {
  name: string,
  html: string | Buffer,
  webContentsId: Electron.WebContents['id'],
}

export type ChromeApi = any;

export enum Protocol {
  Extension = 'chrome-extension:',
  ExtensionDefault = 'chrome-extension:',
  Chrome = 'chrome:',
}

export enum ScriptRuntimeManifest {
  DocumentStart = 'document_start',
  DocumentEnd = 'document_end',
  DocumentIdle = 'document_idle',
}

export enum ScriptRuntimeProcess {
  DocumentStart = 'document-start',
  DocumentEnd = 'document-end',
  DocumentIdle = 'DOMContentLoaded',
}

export type UrlMatchPattern = string;

export type ScriptResource = {
  url: string,
  code: string,
}

// https://developer.chrome.com/extensions/content_scripts
export type Script<T = ScriptResource> = {
  matches: UrlMatchPattern[],
  exclude_matches?: UrlMatchPattern[],
  include_globs?: UrlMatchPattern[],
  exclude_globs?: UrlMatchPattern[],
  all_frames?: boolean, // default to false
  run_at?: ScriptRuntimeManifest, // default to document_idle
  js?: T[],
  css?: T[],
}

export type UserScripts<T = ScriptResource> = {
  isolatedWorlId: number,
  humanName: string,
  contentSecurityPolicy: string,
  contentSecurityOrigin: string,
  scripts: Script<T>[],
}

export enum ECxChannels {
  OnCreateRenderer = 'create-renderer',
  OnExtensionLoaded = 'extension-loaded',
  OnExtensionUnloaded = 'extension-unloaded',
}

export const backgroundPageProcessFlag = '--background-page';
