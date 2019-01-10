// @ts-ignore
import { downloadById } from 'download-crx';
import { dir, DirectoryResult } from 'tmp-promise';
import { stringify } from 'querystring';

import { IExtension } from '../../common/types';

import Location from './location';
import {
  IDownloadProvider,
} from './types';

let fetch: Promise<Response>;

if (process.env.NODE_ENV !== 'test') {
  fetch = require('got');
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
    const { id, version, updateUrl } = extension;

    const extQuery = stringify({
      id,
      v: version.number,
      installsource: 'ondemand',
      uc: '',
    });

    const checkQuery = stringify({
      response: 'updatecheck',
      prodversion: '',
      x: [extQuery],
    });

    // @ts-ignore
    const { body } = await fetch(`${updateUrl}?${checkQuery}`);

    if (!body) {
      throw new Error(`Http error for ${updateUrl}`);
    }

    return {
      xml: body,
    };
  }
}
