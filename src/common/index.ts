export const backgroundPageProcessFlag = '--background-page';

export enum EngineChannels {
  OnCreateRenderer = 'cx-engine-create-renderer',
  OnExtensionLoaded = 'cx-engine-extension-loaded',
  OnExtensionUnloaded = 'cx-engine-extension-unloaded',
  GetExtension = 'cx-engine-get-extension',
}

export enum Protocol {
  Extension = 'chrome-extension:',
  ExtensionDefault = 'chrome-extension:',
  Chrome = 'chrome:',
}
