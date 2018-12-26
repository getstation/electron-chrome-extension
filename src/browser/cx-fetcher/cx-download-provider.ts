// @ts-ignore
import { downloadById } from 'download-crx';
// import fetch from 'electron-fetch';
import { dir, DirectoryResult } from 'tmp-promise';
import { remove } from 'fs-extra';
import Location from './Location';
import {
  CxDownloadProviderInterface,
  IExtension,
} from './types';

class CxDownloadProvider implements CxDownloadProviderInterface {
  // Track what have been downloaded for cleanups
  private downloads: Map<IExtension['id'], DirectoryResult>;

  constructor() {
    this.downloads = new Map();
  }

  async downloadById(extensionId: IExtension['id']) {
    const tempDir = await dir();
    this.downloads.set(extensionId, tempDir);
    const path = await downloadById(extensionId, tempDir.path, extensionId);
    return {
      id: extensionId,
      location: new Location(path),
    };
  }

  async cleanupById(extensionId: IExtension['id']) {
    const tmpDir = this.downloads.get(extensionId);
    console.log('tmpDir : ', tmpDir);
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
