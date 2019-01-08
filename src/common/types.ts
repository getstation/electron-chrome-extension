import { IFetcherConfig } from '../browser/fetcher/types';

// ECx

export type Configuration = {
  fetcher?: Partial<IFetcherConfig>,
  onUpdate?: Callback<IExtension>,
};

// Extension

export interface IExtension {
  id: string;
  version: IVersion;
  location: ILocation;
  updateUrl: string;
}

export type ExtensionMap = Map<IExtension['id'], IExtension>;

export interface IVersion {
  number: string;
  parsed: number[];
}

export interface ILocation {
  path: string;
}

export enum ExtensionStatus {
  Installed = 'chrome-extension-installed',
  Updated = 'chrome-extension-updated',
  Removed = 'chrome-extension-removed',
  Discovered = 'chrome-extension-discoverd',
}

// API

export type ChromeApi = any;

// Utils

export type Callback<T> = (payload: T) => void;
