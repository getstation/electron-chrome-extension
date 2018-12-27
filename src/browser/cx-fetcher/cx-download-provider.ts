// @ts-ignore
import { downloadById } from 'download-crx';
import fetch from 'electron-fetch';
import { dir, DirectoryResult } from 'tmp-promise';
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
    const tempDir = await dir({ prefix: 'ecx-', unsafeCleanup: true });
    this.downloads.set(extensionId, tempDir);
    const path = await downloadById(extensionId, tempDir.path, extensionId);
    return {
      id: extensionId,
      location: new Location(path),
    };
  }

  async cleanupById(extensionId: IExtension['id']) {
    const tmpDir = this.downloads.get(extensionId);
    if (tmpDir) {
      await tmpDir.cleanup();
    }
  }

  async getUpdateInfo(extension: IExtension) {
    const response = await fetch(extension.updateUrl);
    if (!response.ok) {
      throw new Error(`Http Status not ok: ${response.status} ${response.statusText}`);
    }

    const xml = await response.text();
    return {
      xml,
    };
  }
}

export default CxDownloadProvider;
