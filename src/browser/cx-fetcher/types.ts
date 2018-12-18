export interface CxInfos {
  path?: string;
  version: string;
  update_url: string;
}

export interface DownloadDescriptor {
  path: string;
}

export interface InstallDescriptor {
  path: string;
  manifest: CxManifest;
}

export interface UpdateDescriptor {
  xml: string;
}

export interface CxManifest {
  version: string;
  update_url: string;
}

export interface CxStorageProviderInterface {
  installExtension(extensionId: string, crxDownload: DownloadDescriptor): Promise<InstallDescriptor>;
  getInstalledExtension(): Promise<Map<string, Map<string, InstallDescriptor>>>;
  getExtensionsFolder(): string;
  readManifest(cxFolderPath: string): Promise<CxManifest>;
  unzipCrx(crxPath: string, destination: string): Promise<boolean>
}

export interface CxDownloadProviderInterface {
  downloadById(extensionId: string): Promise<DownloadDescriptor>;
  cleanupById(extensionId: string): void;
  getUpdateInfo(cxInfos: CxInfos): Promise<UpdateDescriptor>;
}

export interface CxInterpreterProviderInterface {
  interpret(manifest: InstallDescriptor | undefined): CxInfos;
  shouldUpdate(extensionId: string, cxInfos: CxInfos, updateInfos: UpdateDescriptor): boolean;
  sortLastVersion(versions: IterableIterator<string>): string;
}

export interface CxFetcherInterface {
  // Injected dependencies
  cxDownloader: CxDownloadProviderInterface;
  cxStorager: CxStorageProviderInterface;
  cxInterpreter: CxInterpreterProviderInterface;

  // Registered Cx
  availableCx(): Map<string, CxInfos>;
  saveCx(extensionId:string, cxInfos: CxInfos): void;
  scanInstalledExtensions(): void;

  // Operations on Chrome extension (Cx)
  fetch(extensionId: string): Promise<CxInfos>;
  update(extensionId: string): Promise<CxInfos | boolean>;

  // Handling updates
  checkForUpdate(extensionId: string): Promise<boolean>;
  autoUpdate(): CxInfos[];
  stopAutoUpdate(): void;
}
