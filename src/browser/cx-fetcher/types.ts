export interface CxStorageProviderInterface {
  extractExtension(extensionId: string, crxPath: string): Promise<{path: string, version: string}>;
  getExtensionFolder(): string;
  readManifest(cxFolderPath: string): Promise<CxManifest>;
  unzipCrx(crxPath: string, destination: string): Promise<boolean | any>
}

export interface CxDownloadProviderInterface {
  downloadById(extensionId: string): Promise<string>;
  cleanupById(extensionId: string): void;
}

export interface CxManifest {
  version: string;
}

export interface CxFetcherInterface {
  // Injected dependencies
  cxDownloader: CxDownloadProviderInterface;
  cxStorager: CxStorageProviderInterface;

  // Operations on Chrome extension (Cx)
  fetch(extensionId: string): Promise<{path: string, version: string}>;
  update(extensionId: string): Promise<boolean>;
  remove(extensionId: string): Promise<boolean>;

  // Handling updates
  checkForUpdate(): boolean;
  autoFetchUpdates(): boolean;
}
