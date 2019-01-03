import { IExtension, IFetcherConfig } from 'src/browser/cx-fetcher/types';
import { Callback } from './apis';

export type ChromeApi = any;

export type ExtensionMap = Map<IExtension['id'], IExtension>;

export type ManagerConfiguration = {
  fetcher?: Partial<IFetcherConfig>,
  onUpdate?: Callback<IExtension>,
};
