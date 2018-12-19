import assert = require('assert');
import path from 'path';
import fse from 'fs-extra';
// import { ipcRenderer } from 'electron';
import StorageProvider from '../../src/browser/cx-fetcher/cx-storage-provider';

// Path of different ressources for tests
const TEST_ASSETS = path.join(__dirname, '..', 'assets');
const TEST_ARCHIVE_PATH = path.join(TEST_ASSETS, 'archives', 'test.crx');
const TEST_EXTENSION_FOLDER = path.join(TEST_ASSETS, 'extensions');
// Different fake data for testing
const FAKE_EXTENSION_ID = 'axyz';
const FAKE_EXTENSION_VERSION = '1.2.0';
const FAKE_DL_DESCRIPTOR = {
  path: TEST_ARCHIVE_PATH,
};

describe('Default Storage Provider', () => {
  it('has a default installation folder', () => {
    const storager = new StorageProvider();
    const expected = path.join(__dirname, '..', '..', 'src', 'browser', 'cx-fetcher', 'extension');
    assert.equal(storager.extensionsFolder, expected);
  });

  it('accepts custom installation folder', () => {
    const storager = new StorageProvider('path/to/files');
    const expected = 'path/to/files';
    assert.equal(storager.extensionsFolder, expected);
  });

  // TODO : clean up all generated files after each test
  describe('install extension', () => {
    it('returns a correct CxInfos from a downloadDescriptor', async () => {
      const interpreter = new StorageProvider(TEST_EXTENSION_FOLDER);
      const cxInfos = await interpreter.installExtension(FAKE_EXTENSION_ID, FAKE_DL_DESCRIPTOR);

      const expected = {
        path: path.join(TEST_EXTENSION_FOLDER, FAKE_EXTENSION_ID, FAKE_EXTENSION_VERSION),
        manifest: '',
      };

      assert.equal(cxInfos, expected);
    });

    it('extracted files in correct folder tree', async () => {
      const interpreter = new StorageProvider(TEST_EXTENSION_FOLDER);

      await interpreter.installExtension(FAKE_EXTENSION_ID, FAKE_DL_DESCRIPTOR);
      const expectedFolder = path.join(TEST_EXTENSION_FOLDER, FAKE_EXTENSION_ID, FAKE_EXTENSION_VERSION);
      const expectedManifest = path.join(expectedFolder, 'manifest.json');

      assert.equal(fse.pathExists(expectedFolder), true, 'Folder does not exists at the expected location');
      assert.equal(fse.pathExists(expectedManifest), true, 'Manifest file is not at the expected location');
    });

    it('throws an error if the archive cannot be unzipped', () => {

    });

    it('throws an error if the manifest cannot be read', () => {

    });

    it('throws an error if destination already exists', () => {

    });

    it('cleans up sorting artifacts', () => {

    });

    it('cleans up sorting artifacts on error', () => {

    });
  });

  describe('get all installed extensions', () => {
    it('return an array of CxInfos from an installation folder', () => {

    });

    it('fails gracefully if manifest cannot be read', () => {

    });
  });
});
