import {
  CxStorageProviderInterface,
  CxManifest,
  CxInfos,
} from './types';
const path = require('path');
const unzip = require('unzip-crx');
const fse = require('fs-extra');
const fs = require('fs').promises;

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
      const cxInfo = await this.readManifest(tempDestination);
      const versionDestination = path.resolve(rootExtensionFolder, extensionId, cxInfo.version);

      // TODO : check if the destination already exists and fall back (with cleanup)
      
      // Move the extracted file to the final versionned folder
      await fse.move(tempDestination, versionDestination);

      // Return new extension folder path
      return {
        path: versionDestination,
        version: cxInfo.version,
        update_url: cxInfo.update_url,
      };
    } catch (err) {
      throw new Error(err);
    }
  }

  // TODO : Simplify this (OH SO MUCH)
  async getInstalledManifests() {
    const installedCxManifest = new Map();
    const installationFolder = this.getExtensionFolder();
    const cxFolders = await fs.readdir(installationFolder, { withFileTypes: true });

    console.log('cxFolderds : ', cxFolders);
    
    // For each chrome extrension folder, lookup the versions sub folders (tree is like : /extension_id/version/<files>)
    await cxFolders.forEach(async (cxFolder: any) => {
      console.log('cxFolder name : ', cxFolder);
      if (cxFolder.isDirectory()) {
        console.log('i am a directory');
        const versionsCx = new Map();
        const currentCxFolderPath = `${installationFolder}/${cxFolder.name}`;
        const versionFolders = await fse.readdir(currentCxFolderPath, { withFileTypes: true });

        // For each version sub folder, grab the manifest.json, read it and store it
        await versionFolders.forEach(async (vsFolder: any) => {
          if (vsFolder.isDirectory()) {
            const currentManifestPath = `${currentCxFolderPath}/${vsFolder.name}/manifest.json`;
            const manifestIsReadable = await fse.access(currentManifestPath, fse.constants.F_OK | fse.constants.W_OK);
            if (manifestIsReadable) {
              versionsCx.set(vsFolder.name, await this.readManifest(currentManifestPath));
            }
          }
        });

        // Store all the versions manifest found under the extension ID
        installedCxManifest.set(cxFolder.name, versionsCx);
      }
    });

    // Return all manifests found under their version / extension ID
    return installedCxManifest;
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
  async readManifest(cxFolderPath: string): Promise<CxManifest> {
    return fse.readJson(`${cxFolderPath}/manifest.json`);
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
