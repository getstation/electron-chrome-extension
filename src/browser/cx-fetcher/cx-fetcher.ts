import EventEmitter = require('events');
import defaultCxStorage from './cx-storage-provider';
import defaultCxDownloader from './cx-download-provider';

export default class CxFetcher extends EventEmitter {
  // Hold the singleton instance
  private static instance:CxFetcher;
  public cxStorage:any;
  public cxDownloader:any;

  /**
   * Construct the singleton, return the only instance if already created, build it if not
   * @param cxStorage Dependence that will handle all file system storage
   * @param cxDownloader Dependence that will handle download and external fetch
   */
  constructor(cxStorage?: any, cxDownloader?: any) {
    // Let this be a singleton
    if (CxFetcher.instance) {
      return CxFetcher.instance;
    }

    // Never forget this guy
    super();

    // Registrer the downloader and storage handler
    this.cxStorage = (cxStorage) ? cxStorage : defaultCxStorage;
    this.cxDownloader = (cxDownloader) ? cxDownloader : defaultCxDownloader;

    // Start auto-update
    this.autoFetchUpdates();

    CxFetcher.instance = this;
  }

  public async fetchOne(extensionId: string) {
    const destFolder = this.cxStorage.getDestinationFolder('extensions');
    const filePath = await this.cxDownloader.downloadById(extensionId, destFolder);
    return filePath;
  }

  public checkForUpdate() {

  }

  private autoFetchUpdates() {

  }
}
