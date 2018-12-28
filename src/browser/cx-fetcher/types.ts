export enum MutexStatus {
  Installing = 'chrome-extension-installing',
  Updating = 'chrome-extension-updating',
}

export enum ExtensionStatus {
  Installed = 'chrome-extension-installed',
  Updated = 'chrome-extension-updated',
  Removed = 'chrome-extension-removed',
  Discovered = 'chrome-extension-discoverd',
}

export interface IExtension {
  id: string;
  version: IVersion;
  location: ILocation;
  updateUrl: string;
}

export interface IVersion {
  number: string;
  parsed: number[];
}

export interface ILocation {
  path: string;
}

export interface IDownload {
  id: IExtension['id'];
  location: ILocation;
}

export interface IInstall {
  id: IExtension['id']
  location: ILocation;
  manifest: IManifest;
}

export interface IUpdate {
  xml: string;
}

export interface IManifest {
  version: string;
  update_url: string;
}

export type InstalledExtensions = Map<IExtension['id'], InstalledVersions>;
export type InstalledVersions = Map<IVersion['number'], IInstall>;

export interface IStorageProviderConfig {
  extensionsFolder: ILocation,
  cacheFolder: ILocation,
}

export interface IStorageProvider {
  extensionsFolder: ILocation;
  cacheFolder: ILocation;

  installExtension(crxDownload: IDownload): Promise<IInstall>;
  getInstalledExtension(): Promise<InstalledExtensions>;
  readManifest(folderPath: ILocation): Promise<IManifest>;
  unzipCrx(crxPath: ILocation, destination: ILocation): Promise<boolean>
}

export interface IDownloadProvider {
  downloadById(extensionId: IExtension['id']): Promise<IDownload>;
  cleanupById(extensionId: IExtension['id']): void;
  getUpdateInfo(extension: IExtension): Promise<IUpdate>;
}

export interface IInterpreterProvider {
  interpret(installed: IInstall): IExtension;
  shouldUpdate(extension: IExtension, updateInfos: IUpdate): boolean;
  sortLastVersion(versions: IVersion[]): IVersion;
}

export interface IFetcherConfig {
  downloader: IDownloadProvider;
  storager: IStorageProvider;
  interpreter: IInterpreterProvider;
  autoUpdateInterval: number;
  autoUpdate: boolean;
}

export interface IFetcher {
  downloader: IDownloadProvider;
  storager: IStorageProvider;
  interpreter: IInterpreterProvider;

  list(): Map<IExtension['id'], IExtension>;
  save(extension: IExtension): void;
  scanInstalledExtensions(): void;

  fetch(extensionId: IExtension['id']): Promise<IExtension>;
  update(extensionId: IExtension['id']): Promise<IExtension | boolean>;

  checkForUpdate(extensionId: IExtension['id']): Promise<boolean>;
  autoUpdate(): Promise<(false | IExtension)[]>;
  stopAutoUpdate(): void;
}
