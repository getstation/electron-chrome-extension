export type ExtensionFS = {
  id: string,
  manifest: Manifest,
  src: string,
}

export type Extension = ExtensionFS & {
  userScripts?: UserScripts,
  backgroundPage?: BackgroundPage,
}

export type Manifest = {
  name: string,
  background: {
    page: string,
    scripts: string[],
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

export enum ScriptType {
  Js = 'js',
  Css = 'css',
}

export type Script = {
  type: ScriptType,
  runAt: ScriptRuntimeProcess,
  // matches: UrlMatchPattern,
  // js: Script,
  // css: Script,
}

export type UserScripts = {
  isolatedWorlId: number,
  humanName: string,
  contentSecurityPolicy: string,
  contentSecurityOrigin: string,
  scripts: Script[],
}

export const backgroundPageProcessFlag = '--electron-chrome-extension-background-page';
