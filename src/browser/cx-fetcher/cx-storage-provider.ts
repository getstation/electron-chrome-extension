import {
  CxStorageProviderInterface,
  CxManifest,
  DownloadDescriptor,
} from './types';
import * as glob from 'glob';
const path = require('path');
const unzip = require('unzip-crx');
const fse = require('fs-extra');

const EXTENSION_FOLDER = 'extensions';
const ROOT_FOLDER = __dirname;
const TEMP_SORT_FOLDER = '_sorting';

class CxStorageProvider implements CxStorageProviderInterface {
  // Constructor ! (@captainObvious)
  constructor() {
  }

  /**
   * Extract the extension found in the given archive path
   * @param extensionId   Extension ID used for the final folder path
   * @param crxPath       Path of the CRX archive, as a string
   */
  async installExtension(extensionId: string, crxDownload: DownloadDescriptor) {
    try {
      // TODO : ensureDir at some point

      const rootExtensionFolder = this.getExtensionsFolder();
      // Extract temporarily in a sub temporary folder
      // TODO : Improve how is created the temporary folder
      const tempDestination = path.resolve(rootExtensionFolder, TEMP_SORT_FOLDER, extensionId);
      await this.unzipCrx(crxDownload.path, tempDestination);

      // Find version in manifest and create a new destination subfolder
      const manifest = await this.readManifest(path.join(tempDestination, 'manifest.json'));
      const versionDestination = path.resolve(rootExtensionFolder, extensionId, manifest.version);

      // TODO : check if the destination already exists and fall back (with cleanup)
      // Move the extracted file to the final versionned folder
      await fse.move(tempDestination, versionDestination);

      // Return Installation Infos
      return {
        path: versionDestination,
        manifest,
      };

    } catch (err) {
      throw new Error(err);
    }
  }

  // Gather all installed Cx Infos from installation folder
  async getInstalledExtension() {
    const installedCxInfos = new Map();
    const installationFolder = this.getExtensionsFolder();
    const cxFolders = glob.sync(path.join(installationFolder, '**/manifest.json'));

    for (const manifestPath of cxFolders) {
      const extensionTree = manifestPath.split('/');
      const version = extensionTree[extensionTree.length - 2];
      const extensionId = extensionTree[extensionTree.length - 3];

      if (!installedCxInfos[extensionId]) installedCxInfos.set(extensionId, new Map());

      const manifest = await this.readManifest(manifestPath);
      // TODO : This is a bit ugly
      installedCxInfos.get(extensionId).set(version, {
        path: manifestPath.slice(0, -14),
        manifest,
      });
    }

    // Return all Installation Infos found under their version / extension ID
    return installedCxInfos;
  }

  /**
   * Return destination folder path to store chrome extensions.
   * @returns   String representing the folder path where the extensions will be extracted
   */
  getExtensionsFolder(): string {
    return path.resolve(ROOT_FOLDER, EXTENSION_FOLDER);
  }

  /**
   * Return parsed manifest json from a given chrome extension folder.
   * @param cxFolderPath  Path of the chrome extension folder
   * @returns   Object parsed from manifest.json
   */
  async readManifest(manifestPath: string): Promise<CxManifest> {
    return fse.readJson(manifestPath);
  }

  /**
   * Return a promise that resolves when the CRX archive (found at the given path) has been extracted
   * to the given destination folder.
   * @param crxPath       Path of the chrome extension archive
   * @param destination   Folder in which the archive will be unzipped
   */
  async unzipCrx(crxPath: string, destination: string): Promise<boolean | any> {
    return new Promise((resolve, reject) => {
      unzip(crxPath, destination)
        .then(() => resolve(true))
        .catch((err: any) => reject(err));
    });
  }
}

// Expose the default provider class
export default CxStorageProvider;
