import { ScriptRuntimeManifest } from './constants';

// Cx

export type ExtensionFS = {
  id: string,
  manifest: Manifest,
  src: string,
}

export type Extension = ExtensionFS & {
  userScripts?: UserScripts,
  backgroundPage?: BackgroundPage,
}

export type BackgroundPage = {
  name: string,
  html: string | Buffer,
  webContentsId: Electron.WebContents['id'],
}

export type ScriptResource = {
  url: string,
  code: string,
}

// API

export type ChromeApi = any;

export type UrlMatchPattern = string;

// Manifest

export type Manifest = {
  name: string,
  background: {
    page: string,
    scripts: string[],
  },
  content_security_policy: string,
  content_scripts: any, // todo
  permissions: Permission[],
}

export type Permission = string; // todo: or url match pattern

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
