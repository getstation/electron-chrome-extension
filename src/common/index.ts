import { IExtension } from './types';

export const backgroundPageProcessFlag = '--background-page';

export enum Engine {
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

export enum Channel {
  Handler = 'cx-handler',
  Event = 'cx-event',
  Property = 'cx-property',
}

export enum Api {
  Windows = 'windows',
  Tabs = 'tabs',
  Cookies = 'cookies',
}

export const scope = (channel: Channel, api: Api) =>
  [channel, api].join('-');

export const extensionScope = (
  channel: Channel,
  api: Api,
  extensionId: IExtension['id']
) => [channel, api, extensionId].join('-');
