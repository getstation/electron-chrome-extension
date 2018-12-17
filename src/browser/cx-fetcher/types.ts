export interface CxStorageProviderInterface {
  extractExtension(extensionId: string, crxPath: string): Promise<CxInfos>;
  getInstalledExtension(): Promise<object>;
  getExtensionFolder(): string;
  readManifest(cxFolderPath: string): Promise<CxManifest>;
  unzipCrx(crxPath: string, destination: string): Promise<boolean | any>
}

export interface CxDownloadProviderInterface {
  downloadById(extensionId: string): Promise<string>;
  cleanupById(extensionId: string): void;
  fetchUpdateManifest(updateUrl: string): Promise<any>;   // TODO : update this
}

export interface CxManifest {
  version: string;
  update_url: string;
}

export interface CxInfos {
  path?: string;
  version: string;
  update_url: string;
}

export interface CxFetcherInterface {
  // Injected dependencies
  cxDownloader: CxDownloadProviderInterface;
  cxStorager: CxStorageProviderInterface;

  // Operations on Chrome extension (Cx)
  fetch(extensionId: string): Promise<CxInfos>;
  update(extensionId: string): Promise<boolean>;
  remove(extensionId: string): Promise<boolean>;

  // Handling updates
  checkForUpdate(extensionId: string): Promise<boolean>;
  autoUpdate(): boolean;

  // Utils
}
