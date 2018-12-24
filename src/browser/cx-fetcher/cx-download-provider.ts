// @ts-ignore
import { downloadCrxById } from 'download-crx';
// import fetch from 'electron-fetch';
// @ts-ignore
import { dir } from 'tmp';
import { remove } from 'fs-extra';
import {
  CxDownloadProviderInterface,
  IExtension,
  IDownload,
} from './types';

class CxDownloadProvider implements CxDownloadProviderInterface {
  // Track what have been downloaded for cleanups
  private downloads: Map<IExtension['id'], IDownload['location']>;

  constructor() {
    this.downloads = new Map();
  }

  async downloadById(extensionId: IExtension['id']) {
    const tempDir = await dir().name;
    this.downloads.set(extensionId, tempDir);
    const path = await downloadCrxById(extensionId, tempDir, extensionId);
    return {
      id: extensionId,
      location: {
        path,
      },
    };
  }

  async cleanupById(extensionId: IExtension['id']) {
    const tmpDir = this.downloads.get(extensionId);
    if (tmpDir) {
      await remove(tmpDir.path);
    }
  }

  async getUpdateInfo(extension: IExtension) {
    console.log(`Fetching ${extension.updateUrl}`);
    // const res = await fetch(extension.updateUrl, );
    // console.log('res : ', res);

    // if (!res.ok) {
    //   // @ts-ignore
    //   throw new Error(`Http Status not ok: ${res.httpStatus}`);
    // }

    // const xml = await res.text();
    const xml = 'test';
    return {
      xml,
    };
  }
}

export default CxDownloadProvider;
