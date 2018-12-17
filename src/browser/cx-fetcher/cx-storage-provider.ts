import {
  CxStorageProviderInterface,
  CxManifest,
  CxInfos,
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
  async extractExtension(extensionId: string, crxPath: string): Promise<CxInfos> {
    try {

      // TODO : ensureDir at some point

      const rootExtensionFolder = this.getExtensionFolder();
      // Extract temporarily in a sub temporary folder
      const tempDestination = path.resolve(rootExtensionFolder, TEMP_SORT_FOLDER, extensionId);
      await this.unzipCrx(crxPath, tempDestination);

      // Find version in manifest and create a new destination subfolder
      const cxInfos = await this.squeezeManifest(`${tempDestination}/manifest.json`);
      const versionDestination = path.resolve(rootExtensionFolder, extensionId, cxInfos.version);

      // TODO : check if the destination already exists and fall back (with cleanup)
      // Move the extracted file to the final versionned folder
      await fse.move(tempDestination, versionDestination);

      // Return gathered cx infos
      return cxInfos;

    } catch (err) {
      throw new Error(err);
    }
  }

  // Gather all installed Cx Infos from installation folder
  async getInstalledExtension() {
    const installedCxInfos = {};
    const installationFolder = this.getExtensionFolder();
    const cxFolders = glob.sync(path.join(installationFolder, '**/manifest.json'));

    for (const manifestPath of cxFolders) {
      const extensionTree = manifestPath.split('/');
      const version = extensionTree[extensionTree.length - 2];
      const extensionId = extensionTree[extensionTree.length - 3];

      if (!installedCxInfos[extensionId]) installedCxInfos[extensionId] = {};
      installedCxInfos[extensionId][version] = await this.squeezeManifest(manifestPath);
    }

    // Return all CxInfos found under their version / extension ID
    return installedCxInfos;
  }

  /**
   * Return destination folder path to store chrome extensions.
   * @returns   String representing the folder path where the extensions will be extracted
   */
  getExtensionFolder(): string {
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

  // TODO : Rename this (ahem)
  async squeezeManifest(manifestPath: string): Promise<CxInfos> {
    const manifest = await this.readManifest(manifestPath);
    const cxInfos = {
      path: manifestPath.slice(0, -14),   // TODO : This is a bit ugly
      version: manifest.version,
      update_url: manifest.update_url,
    };
    return cxInfos;
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
