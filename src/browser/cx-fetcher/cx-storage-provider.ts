const path = require('path');
const unzip = require('unzip-crx');
const fse = require('fs-extra');

const EXTENSION_FOLDER = 'extensions';
const ROOT_FOLDER = __dirname;
const TEMP_SORT_FOLDER = '_sorting';

/**
 * Extract the extension found in the given archive path
 * @param extensionId   Extension ID used for the final folder path
 * @param crxPath       Path of the CRX archive, as a string
 */
const extractExtension = async (extensionId: string, crxPath: string) => {
  try {
    const rootExtensionFolder = getExtensionFolder();
    // Extract temporarily in a sub temporary folder
    const tempDestination = path.resolve(rootExtensionFolder, TEMP_SORT_FOLDER, extensionId);
    await unzipCrx(crxPath, tempDestination);

    // Find version in manifest and create a new destination subfolder
    const cxInfo = await readManifest(tempDestination);
    const versionDestination = path.resolve(rootExtensionFolder, extensionId, cxInfo.version);

    // TODO : Improve the unzip again ?
    // Extract the archive into the version subfolder and remove garbage
    unzipCrx(crxPath, versionDestination);
    fse.remove(tempDestination);

    // Return new extension folder path
    return versionDestination;
  } catch (err) {
    throw new Error(err);
  }
};

/**
 * Return destination folder path to store chrome extensions.
 * @returns   String representing the folder path where the extensions will be extracted
 */
const getExtensionFolder = () => path.resolve(ROOT_FOLDER, EXTENSION_FOLDER);

/**
 * Return parsed manifest json from a given chrome extension folder.
 * @param cxFolderPath  Path of the chrome extension folder
 * @returns   Object parsed from manifest.json
 */
const readManifest = (cxFolderPath: string) => fse.readJson(`${cxFolderPath}/manifest.json`);

/**
 * Return a promise that resolves when the CRX archive (found at the given path) has been extracted
 * to the given destination folder.
 * @param crxPath       Path of the chrome extension archive
 * @param destination   Folder in which the archive will be unzipped
 */
const unzipCrx = (crxPath: string, destination: string) => new Promise((resolve, reject) => {
  unzip(crxPath, destination)
    .then(() => resolve())
    .catch((err: any) => reject(err));
});

// Expose all functions
export default {
  extractExtension,
  unzipCrx,
  readManifest,
  getExtensionFolder,
};
