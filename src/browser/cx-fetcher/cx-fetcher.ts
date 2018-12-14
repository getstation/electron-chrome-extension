import EventEmitter = require('events');
import defaultCxStorage from './cx-storage-provider';
import defaultCxDownloader from './cx-download-provider';
import {
  CxFetcherInterface,
  CxDownloadProviderInterface,
  CxStorageProviderInterface,
} from './types';

class CxFetcher extends EventEmitter implements CxFetcherInterface {
  // Singleton instance & injected dependencies
  private static instance: CxFetcher;
  public cxStorager: CxStorageProviderInterface;
  public cxDownloader: CxDownloadProviderInterface;
  // Sets of what's happening with Chrome extensions
  private inUse: Map<string, string>;
  private available: Map<string, {}>;

  // Constructor with dependencies injection
  constructor(cxStorager?: CxStorageProviderInterface, cxDownloader?: CxDownloadProviderInterface) {
    // Let this be a singleton
    if (CxFetcher.instance) {
      return CxFetcher.instance;
    }

    // Never forget this guy
    super();

    // Registrer the downloader and storage handler
    // @ts-ignore
    this.cxStorager = (cxStorager) ? cxStorager : new defaultCxStorage();
    // @ts-ignore
    this.cxDownloader = (cxDownloader) ? cxDownloader : new defaultCxDownloader();
    this.inUse = new Map();
    this.available = new Map();

    // Start auto-update
    this.autoFetchUpdates();

    CxFetcher.instance = this;
  }

  // Expose the list of availabel and installed Chrome extensions
  availableCX() {
    return this.available;
  }

  // Fetch a Chrome extension
  async fetch(extensionId: string): Promise<{path: string, version: string}> {
    // Check if it's already in use
    if (this.inUse.has(extensionId)) {
      throw new Error(`Extension ${extensionId} is already being used`);
    }

    // Record the extension has being toyed with already
    this.inUse.set(extensionId, 'downloading');
    // Start downloading -> unzipping -> cleaning
    const crxPath = await this.cxDownloader.downloadById(extensionId);
    const fetchedCxInfo = await this.cxStorager.extractExtension(extensionId, crxPath);
    await this.cxDownloader.cleanupById(extensionId);

    // Clear status, add to installed and emit ready event for this cx
    this.inUse.delete(extensionId);
    this.available.set(extensionId, fetchedCxInfo);

    return fetchedCxInfo;
  }

  // Update a Chrome extension
  async update(extensionId: string) {
    console.log(`Updating ${extensionId}`);
    return true;
  }

  // Remove a Chrome extension
  async remove(extensionId: string) {
    console.log(`Removing ${extensionId}`);
    return true;
  }

  // Check if a Chrome extension can be updated
  checkForUpdate() {
    return true;
  }

  // Auto update all installed extensions automatically
  autoFetchUpdates() {
    return true;
  }
}

export default CxFetcher;
