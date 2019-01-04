import { app } from 'electron';
import { sync } from 'glob';
import { join, resolve } from 'path';
import { move, readJson, ensureDir } from 'fs-extra';
// @ts-ignore
import unzip from 'unzip-crx';
import Location from './location';
import {
  IStorageProvider,
  IManifest,
  IDownload,
  ILocation,
  IStorageProviderConfig,
} from './types';

const defaultConfiguration = process.env.NODE_ENV !== 'test'
  ? {
    extensionsFolder: new Location(
      join(app.getPath('userData'), 'ChromeExtensions')
    ),
    cacheFolder: new Location(
      join(app.getPath('userData'), 'ChromeExtensions-cache')
    ),
  }
  : {
    extensionsFolder: new Location(''),
    cacheFolder: new Location(''),
  };

export default class StorageProvider implements IStorageProvider {
  public extensionsFolder: ILocation;
  public cacheFolder: ILocation;

  constructor(customConfiguration: Partial<IStorageProviderConfig> = {}) {
    const {
      extensionsFolder,
      cacheFolder,
    } = {
      ...defaultConfiguration,
      ...customConfiguration,
    };

    this.extensionsFolder = extensionsFolder;
    this.cacheFolder = cacheFolder;
  }

  async installExtension(crxDownload: IDownload) {
    const tempDestination = resolve(
      this.extensionsFolder.path, this.cacheFolder.path, crxDownload.id
    );

    await ensureDir(tempDestination);

    await this.unzipCrx(crxDownload.location, new Location(tempDestination));

    const manifest = await this.readManifest(
      new Location(join(tempDestination, 'manifest.json'))
    );

    const versionDestination = resolve(
      this.extensionsFolder.path, crxDownload.id, manifest.version
    );

    await ensureDir(versionDestination);

    // todo: don't overwrite directly
    await move(tempDestination, versionDestination, { overwrite: true });

    return {
      id: crxDownload.id,
      location: new Location(versionDestination),
      manifest,
    };
  }

  async getInstalledExtension() {
    const extensionsInstallations = new Map();
    const folders = sync(join(this.extensionsFolder.path, '**/manifest.json'));

    for (const manifestPath of folders) {
      const extensionTree = manifestPath.split('/');
      const version = extensionTree[extensionTree.length - 2];
      const extensionId = extensionTree[extensionTree.length - 3];

      if (!extensionsInstallations[extensionId]) {
        extensionsInstallations.set(extensionId, new Map());
      }

      const manifest = await this.readManifest(new Location(manifestPath));

      extensionsInstallations
        .get(extensionId)
        .set(version, {
          id: extensionId,
          // todo: refacto the slice op
          location: new Location(manifestPath.slice(0, -14)),
          manifest,
        });
    }

    return extensionsInstallations;
  }

  async readManifest(location: ILocation): Promise<IManifest> {
    return readJson(location.path);
  }

  async unzipCrx(crxPath: ILocation, destination: ILocation): Promise<boolean> {
    try {
      await unzip(crxPath.path, destination.path);
      return true;
    } catch (err) {
      return false;
    }
  }
}
