import { sync } from 'glob';
import { join, resolve } from 'path';
import { move, readJson } from 'fs-extra';
// @ts-ignore
import unzip from 'unzip-crx';
import {
  CxStorageProviderInterface,
  ICxManifest,
  IDownload,
  ILocation,
} from './types';

const EXTENSIONS_FOLDER = {
  path: join(__dirname, 'extensions'),
};
const TEMP_SORT_FOLDER = '_sorting';

class CxStorageProvider implements CxStorageProviderInterface {
  public extensionsFolder: ILocation;

  // Constructor ! (@captainObvious)
  constructor(extensionsFolder?: ILocation) {
    this.extensionsFolder = (extensionsFolder) ? extensionsFolder : EXTENSIONS_FOLDER;
  }

  /**
   * Extract the extension found in the given archive path
   * @param extensionId   Extension ID used for the final folder path
   * @param crxPath       Path of the CRX archive, as a string
   */
  async installExtension(crxDownload: IDownload) {
    // TODO : ensureDir at some point

    // Extract temporarily in a sub temporary folder
    // TODO : Improve how is created the temporary folder
    const tempDestination = resolve(this.extensionsFolder.path, TEMP_SORT_FOLDER, crxDownload.id);
    await this.unzipCrx(crxDownload.location, tempDestination);

    // Find version in manifest and create a new destination subfolder
    const manifest = await this.readManifest(join(tempDestination, 'manifest.json'));
    const versionDestination = resolve(this.extensionsFolder, crxDownload.id, manifest.version);

    // TODO : check if the destination already exists and fall back (with cleanup)
    // Move the extracted file to the final versionned folder
    await move(tempDestination, versionDestination);

    // Return Installation Infos
    return {
      id: crxDownload.id,
      location: {
        path: versionDestination,
      },
      manifest,
    };
  }

  // Gather all installed Cx Infos from installation folder
  async getInstalledExtension() {
    const installedCxInfos = new Map();
    const cxFolders = sync(join(this.extensionsFolder.path, '**/manifest.json'));

    for (const manifestPath of cxFolders) {
      const extensionTree = manifestPath.split('/');
      const version = extensionTree[extensionTree.length - 2];
      const extensionId = extensionTree[extensionTree.length - 3];

      if (!installedCxInfos[extensionId]) installedCxInfos.set(extensionId, new Map());

      const manifest = await this.readManifest(manifestPath);
      // TODO : This is a bit ugly ?
      installedCxInfos.get(extensionId).set(version, {
        path: manifestPath.slice(0, -14),
        manifest,
      });
    }

    // Return all Installation Infos found under their version / extension ID
    return installedCxInfos;
  }

  // Parse a manifest.json into a JSON object
  async readManifest(location: ILocation): Promise<ICxManifest> {
    return readJson(location.path);
  }

  // Unzip archive to the given path
  async unzipCrx(crxPath: ILocation, destination: ILocation): Promise<boolean> {
    try {
      await unzip(crxPath, destination);
      return true;
    } catch (err) {
      return false;
    }
  }
}

// Expose the default provider class
export default CxStorageProvider;
