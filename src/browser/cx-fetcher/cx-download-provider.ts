// @ts-ignore
import * as downloadCrx from 'download-crx';
import fetch from 'electron-fetch';
// @ts-ignore
import * as tmp from 'tmp';
const fse = require('fs-extra');
import {
  CxDownloadProviderInterface,
  CxInfos,
} from './types';

class CxDownloadProvider implements CxDownloadProviderInterface {
  // Track what have been downloaded for cleanups
  private downloads: Map<string, string>;

  constructor() {
    this.downloads = new Map();
  }

  async downloadById(extensionId: string) {
    const tempDir = tmp.dirSync().name;
    this.downloads.set(extensionId, tempDir);
    return {
      path: downloadCrx.downloadById(extensionId, tempDir, extensionId),
    };
  }

  async cleanupById(extensionId: string) {
    const tmpDir = this.downloads.get(extensionId);
    fse.remove(tmpDir);
  }

  async getUpdateInfo(cxInfos: CxInfos) {
    console.log(`Fetching ${cxInfos.update_url}`);
    const res = await fetch(cxInfos.update_url);
    console.log('res : ', res);

    // @ts-ignore
    if (!res.ok) throw new Error(`Http Status not ok: ${res.httpStatus}`);
    const xml = await res.text();

    return {
      xml,
    };
  }
}

export default CxDownloadProvider;
