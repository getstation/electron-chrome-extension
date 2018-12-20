import EventEmitter = require('events');
import defaultCxStorage from './cx-storage-provider';
import defaultCxDownloader from './cx-download-provider';
import defaultCxInterpreter from './cx-interpreter-provider';
import {
  CxFetcherConfig,
  CxFetcherInterface,
  CxDownloadProviderInterface,
  CxStorageProviderInterface,
  CxInfos,
  CxInterpreterProviderInterface,
} from './types';

// Default config for CxFetcher
const DEFAULT_CONFIG: CxFetcherConfig = {
  cxDownloader: new defaultCxDownloader(),
  cxStorager: new defaultCxStorage(),
  cxInterpreter: new defaultCxInterpreter(),
  autoUpdateInterval: 300000,
  autoUpdate: false,
};

class CxFetcher extends EventEmitter implements CxFetcherInterface {
  // Singleton instance & injected dependencies
  private static _instance: CxFetcher;
  public cxStorager: CxStorageProviderInterface;
  public cxDownloader: CxDownloadProviderInterface;
  public cxInterpreter: CxInterpreterProviderInterface;
  // Maps of what's happening with Chrome extensions
  private inUse: Map<string, string>;
  private available: Map<string, CxInfos>;
  // Auto update related
  private autoUpdateLoop: NodeJS.Timer;
  private autoUpdateInterval: number;

  // Constructor with dependencies injection
  constructor(specifiedConfig: Partial<CxFetcherConfig> = {}) {
    // Let this be a singleton
    if (CxFetcher._instance) {
      return CxFetcher._instance;
    }

    // Never forget this guy
    super();

    // Merge specified options with default options
    const config = Object.assign({}, DEFAULT_CONFIG, specifiedConfig);

    // Registrer the downloader and storage handler
    this.cxStorager = config.cxStorager;
    this.cxDownloader = config.cxDownloader;
    this.cxInterpreter = config.cxInterpreter;

    // Initialise options
    this.autoUpdateInterval = config.autoUpdateInterval;

    // Initialise internal maps of extensions (with those already installed, if ever)
    this.available = new Map();
    this.inUse = new Map();

    // Start auto-update
    if (config.autoUpdate) {
      this.autoUpdateLoop = setInterval(this.autoUpdate, this.autoUpdateInterval);
    }

    // Save the one and only instance
    CxFetcher._instance = this;
  }

  // Static method to reset the Singleton
  public static reset() {
    delete CxFetcher._instance;
  }

  // Expose the list of registed Chrome extensions
  availableCx() {
    return this.available;
  }

  // Register a new Chrome extension as available (in the internal map)
  saveCx(extensionId: string, cxInfos: CxInfos) {
    try {
      this.available.set(extensionId, cxInfos);
    } catch (err) {
      throw err;
    }
  }

  // Fetch, install and register (as available) a Chrome extension
  async fetch(extensionId: string): Promise<CxInfos> {
    // Check if it's already in use
    if (this.inUse.has(extensionId)) throw new Error(`Extension ${extensionId} is already being used`);

    // TODO : check if the extension already exists with this version ?
    // TODO : React to errors

    // Record theat extension is being toyed with already
    this.inUse.set(extensionId, 'downloading');

    // Start downloading -> unzipping -> cleaning
    const archiveCrx = await this.cxDownloader.downloadById(extensionId);
    const installedCx = await this.cxStorager.installExtension(extensionId, archiveCrx);
    await this.cxDownloader.cleanupById(extensionId);

    // Translate raw data from installation into handled CxInfos
    const fetchedCxInfo = this.cxInterpreter.interpret(installedCx);

    // Clear status, add to installed and emit ready event for this cx
    // TODO : emit an event
    this.inUse.delete(extensionId);
    this.saveCx(extensionId, fetchedCxInfo);

    return fetchedCxInfo;
  }

  // Check if an update is available for a Chrome extension and install it if there is
  async update(extensionId: string) {
    try {
      const shouldUpdate = await this.checkForUpdate(extensionId);
      if (shouldUpdate) return await this.fetch(extensionId);
      return false;
    } catch (err) {
      throw err;
    }
  }

  // Check if a Chrome extension has an update
  async checkForUpdate(extensionId: string) {
    const cxInfos = this.available.get(extensionId);
    if (!cxInfos) throw new Error('Unknown extension');

    const updateInfos = await this.cxDownloader.getUpdateInfo(cxInfos);
    const shouldUpdate = this.cxInterpreter.shouldUpdate(extensionId, cxInfos, updateInfos);

    return shouldUpdate;
  }

  // TODO : Pause or cancel if CX are being installed ?
  // Scan all installed extensions and register their last version as available
  async scanInstalledExtensions() {
    const installedCxInfos = await this.cxStorager.getInstalledExtension();

    for (const [key, value] of installedCxInfos) {
      const versions = Array.from(value.keys());
      const latestVersion = this.cxInterpreter.sortLastVersion(versions);
      const cxInfo = this.cxInterpreter.interpret(value.get(latestVersion));
      this.available.set(key, cxInfo);
    }

    // TODO : emit event for each chrome extension
  }

  // Auto update all installed extensions
  public async autoUpdate() {
    const updated = [];
    for (const extensionId of this.available.keys()) {
      // TODO : Transform this into good information, not just false / cxInfos (promisify better with extensionId)
      updated.push(this.update(extensionId));
    }
    return await Promise.all(updated);
  }

  stopAutoUpdate() {
    clearInterval(this.autoUpdateLoop);
  }
}

export default CxFetcher;
