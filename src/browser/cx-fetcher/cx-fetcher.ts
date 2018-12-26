import { EventEmitter } from 'events';
import CxStorageProvider from './cx-storage-provider';
import CxDownloadProvider from './cx-download-provider';
import CxInterpreterProvider from './cx-interpreter-provider';
import {
  CxFetcherConfig,
  CxFetcherInterface,
  CxDownloadProviderInterface,
  CxStorageProviderInterface,
  CxInterpreterProviderInterface,
  IExtension,
  MutexStatus,
  CxStatus,
} from './types';

// Default config for CxFetcher
const defaultConfig: CxFetcherConfig = {
  cxDownloader: new CxDownloadProvider(),
  cxStorager: new CxStorageProvider(),
  cxInterpreter: new CxInterpreterProvider(),
  autoUpdateInterval: 300000,
  autoUpdate: false,
};

class CxFetcher extends EventEmitter implements CxFetcherInterface {
  // Singleton instance & injected dependencies
  private static instance: CxFetcher;
  public cxStorager: CxStorageProviderInterface;
  public cxDownloader: CxDownloadProviderInterface;
  public cxInterpreter: CxInterpreterProviderInterface;
  // Maps of what's happening with Chrome extensions
  private mutex: Map<IExtension['id'], MutexStatus>;
  private available: Map<IExtension['id'], IExtension>;
  // Auto update related
  private autoUpdateLoop: NodeJS.Timer;
  private autoUpdateInterval: number;

  // Constructor with dependencies injection
  constructor(customConfiguration: Partial<CxFetcherConfig> = {}) {
    // Let this be a singleton
    if (CxFetcher.instance) {
      return CxFetcher.instance;
    }

    // Never forget this guy
    super();

    // Merge custom options with default options
    const configuration = { ...defaultConfig, ...customConfiguration };

    // Registrer the downloader and storage handler
    const {
      cxStorager,
      cxDownloader,
      cxInterpreter,
      autoUpdateInterval,
      autoUpdate,
    } = configuration;

    this.cxStorager = cxStorager;
    this.cxDownloader = cxDownloader;
    this.cxInterpreter = cxInterpreter;

    // Initialise options
    this.autoUpdateInterval = autoUpdateInterval;

    // Initialise internal maps of extensions (with those already installed, if ever)
    this.available = new Map();
    this.mutex = new Map();

    // Start auto-update
    if (autoUpdate) {
      this.autoUpdateLoop = setInterval(this.autoUpdate, this.autoUpdateInterval);
    }

    // Save the one and only instance
    CxFetcher.instance = this;
  }

  // Static method to reset the Singleton
  public static reset() {
    delete CxFetcher.instance;
  }

  // Expose the list of registed Chrome extensions
  availableCx() {
    return this.available;
  }

  // Register a new Chrome extension as available (in the internal map)
  saveCx(extension: IExtension) {
    this.available.set(extension.id, extension);
  }

  // Get a registered Cx
  getCx(extensionId: IExtension['id']) {
    return this.available.get(extensionId);
  }

  // Check if a Cx is being used in another process
  hasMutex(extensionId: IExtension['id']) {
    return this.mutex.has(extensionId);
  }

  // Get the "mutex status" of a Cx (if has one, of course)
  getMutex(extensionId: IExtension['id']) {
    return this.mutex.get(extensionId);
  }

  // Fetch, install and register (as available) a Chrome extension
  async fetch(extensionId: IExtension['id']): Promise<IExtension> {
    // Check if it's already in use
    if (this.mutex.has(extensionId)) {
      throw new Error(`Extension ${extensionId} is already being used`);
    }

    // TODO : check if the extension already exists with this version ?
    // TODO : React to errors

    // Record theat extension is being toyed with already
    this.mutex.set(extensionId, MutexStatus.Installing);

    // Start downloading -> unzipping -> cleaning
    const archiveCrx = await this.cxDownloader.downloadById(extensionId);
    const installedCx = await this.cxStorager.installExtension(archiveCrx);
    await this.cxDownloader.cleanupById(extensionId);

    // Translate raw data from installation into handled IExtension
    const fetchedCx = this.cxInterpreter.interpret(installedCx);

    // Clear status, add to installed and emit ready event for this cx
    this.mutex.delete(extensionId);
    this.saveCx(fetchedCx);
    this.emit(CxStatus.Installed, fetchedCx);

    return fetchedCx;
  }

  // Check if an update is available for a Chrome extension and install it if there is
  async update(extensionId: IExtension['id']) {
    const shouldUpdate = await this.checkForUpdate(extensionId);

    if (shouldUpdate) {
      const updatedCx = await this.fetch(extensionId);
      this.emit(CxStatus.Updated, updatedCx);
      return updatedCx;
    }

    return false;
  }

  // Check if a Chrome extension has an update
  async checkForUpdate(extensionId: IExtension['id']) {
    const cxInfos = this.available.get(extensionId);
    if (!cxInfos) {
      throw new Error('Unknown extension');
    }

    const updateInfos = await this.cxDownloader.getUpdateInfo(cxInfos);
    const shouldUpdate = this.cxInterpreter.shouldUpdate(cxInfos, updateInfos);

    return shouldUpdate;
  }

  // TODO : Pause or cancel if CX are being installed ?
  // Scan all installed extensions and register their last version as available
  async scanInstalledExtensions() {
    const installedCxInfos = await this.cxStorager.getInstalledExtension();

    for (const [key, value] of installedCxInfos) {
      const parsedVersions = Array.from(
        value.keys(),
        (version:string) => CxInterpreterProvider.parseVersion(version)
      );
      const latestVersion = this.cxInterpreter.sortLastVersion(parsedVersions);
      const cxInstall = value.get(latestVersion.number);

      if (cxInstall) {
        const cxInfo = this.cxInterpreter.interpret(cxInstall);
        this.available.set(key, cxInfo);
        this.emit(CxStatus.Discovered, cxInfo);
      }
    }
  }

  // Auto update all installed extensions
  public async autoUpdate() {
    const updates = [];
    for (const extensionId of this.available.keys()) {
      updates.push(this.update(extensionId));
    }

    const updatesResult = await Promise.all(updates);
    return updatesResult.filter(Boolean);
  }

  stopAutoUpdate() {
    clearInterval(this.autoUpdateLoop);
  }
}

export default CxFetcher;
