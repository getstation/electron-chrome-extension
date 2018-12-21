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
  manifest: ICxManifest;
}

export interface IUpdate {
  xml: string;
}

export interface ICxManifest {
  version: string;
  updateUrl: string;
}

export interface IInstalledExtensions {

}

export interface CxStorageProviderInterface {
  // Parameters
  extensionsFolder: ILocation;

  // Methods
  installExtension(crxDownload: IDownload): Promise<IInstall>;
  getInstalledExtension(): Promise<Map<IExtension['id'], Map<string, IInstall>>>;
  readManifest(cxFolderPath: ILocation): Promise<ICxManifest>;
  unzipCrx(crxPath: ILocation, destination: ILocation): Promise<boolean>
}

export interface CxDownloadProviderInterface {
  downloadById(extensionId: IExtension['id']): Promise<IDownload>;
  cleanupById(extensionId: IExtension['id']): void;
  getUpdateInfo(extension: IExtension): Promise<IUpdate>;
}

export interface CxInterpreterProviderInterface {
  interpret(installedCx: IInstall): IExtension;
  shouldUpdate(extension: IExtension, updateInfos: IUpdate): boolean;
  sortLastVersion(versions: IVersion[]): IVersion;
}

export interface CxFetcherConfig {
  cxDownloader: CxDownloadProviderInterface;
  cxStorager: CxStorageProviderInterface;
  cxInterpreter: CxInterpreterProviderInterface;
  autoUpdateInterval: number;
  autoUpdate: boolean;
}

export interface CxFetcherInterface {
  // Injected dependencies
  cxDownloader: CxDownloadProviderInterface;
  cxStorager: CxStorageProviderInterface;
  cxInterpreter: CxInterpreterProviderInterface;

  // Registered Cx
  availableCx(): Map<IExtension['id'], IExtension>;
  saveCx(extension: IExtension): void;
  scanInstalledExtensions(): void;

  // Operations on Chrome extension (Cx)
  fetch(extensionId: IExtension['id']): Promise<IExtension>;
  update(extensionId: IExtension['id']): Promise<IExtension | boolean>;

  // Handling updates
  checkForUpdate(extensionId: IExtension['id']): Promise<boolean>;
  autoUpdate(): Promise<(false | IExtension)[]>;
  stopAutoUpdate(): void;
}
