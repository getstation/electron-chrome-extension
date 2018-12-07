export const backgroundPageProcessFlag = '--background-page';

export enum ECxChannels {
  OnCreateRenderer = 'create-renderer',
  OnExtensionLoaded = 'extension-loaded',
  OnExtensionUnloaded = 'extension-unloaded',
  GetExtension = 'get-extension',
}

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
