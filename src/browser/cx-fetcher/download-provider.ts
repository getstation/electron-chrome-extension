// @ts-ignore
import { downloadById } from 'download-crx';
import { dir, DirectoryResult } from 'tmp-promise';
import Location from './location';
import {
  IDownloadProvider,
  IExtension,
} from './types';

let fetch: Promise<Response>;
if (process.env.NODE_ENV === 'test') {
  // @ts-ignore
  fetch = window.fetch;
} else {
  fetch = require('electron-fetch');
}

export default class DownloadProvider implements IDownloadProvider {
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
    // @ts-ignore
    const { ok, status, statusText, text } = await fetch(extension.updateUrl);

    if (!ok) {
      throw new Error(`Http Status not ok: ${status} ${statusText}`);
    }

    const xml = await text();

    return {
      xml,
    };
  }
}
