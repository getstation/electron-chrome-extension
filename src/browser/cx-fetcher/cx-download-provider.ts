// download-crx is capble to download a .CRX from WebStore repository
// @ts-ignore
import * as downloadCrx from 'download-crx';
// @ts-ignore
import * as tmp from 'tmp';
const fse = require('fs-extra');
import { CxDownloadProviderInterface } from './types';

class CxDownloadProvider implements CxDownloadProviderInterface {
  // Track what have been downloaded for cleanups
  private downloads: Map<string, string>;

  constructor() {
    this.downloads = new Map();
  }

  async downloadById(extensionId: string) {
    const tempDir = tmp.dirSync().name;
    this.downloads.set(extensionId, tempDir);
    return downloadCrx.downloadById(extensionId, tempDir, extensionId);
  }

  async cleanupById(extensionId: string) {
    const tmpDir = this.downloads.get(extensionId);
    fse.remove(tmpDir);
  }
  
  async fetchUpdateManifest(updateUrl: string) {
    console.log(`Fetching ${updateUrl}`);
    return 'AH AH AH';
  }
}

export default CxDownloadProvider;
