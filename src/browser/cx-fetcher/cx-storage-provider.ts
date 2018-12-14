import { CxStorageProviderInterface, CxManifest } from './types';
const path = require('path');
const unzip = require('unzip-crx');
const fse = require('fs-extra');

const EXTENSION_FOLDER = 'extensions';
const ROOT_FOLDER = __dirname;
const TEMP_SORT_FOLDER = '_sorting';

class CxStorageProvider implements CxStorageProviderInterface {
  // Constructor ! (@captainObvious)
  constructor() {
    console.log('I am building myself');
  }

  /**
   * Extract the extension found in the given archive path
   * @param extensionId   Extension ID used for the final folder path
   * @param crxPath       Path of the CRX archive, as a string
   */
  async extractExtension(extensionId: string, crxPath: string): Promise<{path: string, version: string}> {
    try {
      const rootExtensionFolder = this.getExtensionFolder();
      // Extract temporarily in a sub temporary folder
      const tempDestination = path.resolve(rootExtensionFolder, TEMP_SORT_FOLDER, extensionId);
      await this.unzipCrx(crxPath, tempDestination);

      // Find version in manifest and create a new destination subfolder
      const cxInfo = await this.readManifest(tempDestination);
      const versionDestination = path.resolve(rootExtensionFolder, extensionId, cxInfo.version);

      // TODO : Improve the unzip again ?
      // Extract the archive into the version subfolder and remove garbage
      this.unzipCrx(crxPath, versionDestination);
      fse.remove(tempDestination);

      // Return new extension folder path
      return { path: versionDestination, version: cxInfo.version };
    } catch (err) {
      throw new Error(err);
    }
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
