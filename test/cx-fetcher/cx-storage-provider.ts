import * as assert from 'assert';
const path = require('path');
const fse = require('fs-extra');
// import { ipcRenderer } from 'electron';
import StorageProvider from '../../src/browser/cx-fetcher/cx-storage-provider';
import {
  EXTENSION_VERSION,
  TEST_EXTENSION_FOLDER,
  FAKE_EXTENSION_ID,
  FAKE_DL_DESCRIPTOR,
  FAKE_ARCHIVE_MANIFEST,
} from './constants';

describe('Default Storage Provider', () => {
  it('has a default installation folder', () => {
    const storager = new StorageProvider();
    const expected = path.join(__dirname, '..', '..', 'src', 'browser', 'cx-fetcher', 'extensions');
    assert.equal(storager.extensionsFolder, expected);
  });

  it('accepts custom installation folder', () => {
    const storager = new StorageProvider('path/to/files');
    const expected = 'path/to/files';
    assert.equal(storager.extensionsFolder, expected);
  });

  describe('installing extension', () => {

    afterEach(async () => {
      await fse.remove(TEST_EXTENSION_FOLDER);
    });

    it('returns a correct InstallDescriptor from a DownloadDescriptor', async () => {
      const storager = new StorageProvider(TEST_EXTENSION_FOLDER);
      const installDescriptor = await storager.installExtension(FAKE_DL_DESCRIPTOR);

      const expected = {
        path: path.join(TEST_EXTENSION_FOLDER, FAKE_EXTENSION_ID, EXTENSION_VERSION),
        manifest: FAKE_ARCHIVE_MANIFEST,
      };

      // Do not check the whole manifest, only the interestings parts
      // TODO : Make sure that we check the CxManifest type entirely and automaticaly
      assert.equal(installDescriptor.path, expected.path);
      assert.equal(installDescriptor.manifest.version, expected.manifest.version);
      assert.equal(installDescriptor.manifest.update_url, expected.manifest.update_url);
    });

    it('extracts files in correct folder tree', async () => {
      const storager = new StorageProvider(TEST_EXTENSION_FOLDER);

      await storager.installExtension(FAKE_DL_DESCRIPTOR);
      const expectedFolder = path.join(TEST_EXTENSION_FOLDER, FAKE_EXTENSION_ID, EXTENSION_VERSION);
      const expectedManifest = path.join(expectedFolder, 'manifest.json');

      assert.ok(await fse.pathExists(expectedFolder), 'Folder does not exists at the expected location');
      assert.ok(await fse.pathExists(expectedManifest), 'Manifest file is not at the expected location');
    });

    it('fails if the archive cannot be unzipped', async () => {
      const storager = new StorageProvider(TEST_EXTENSION_FOLDER);
      storager.unzipCrx = () => Promise.reject('Cannot unzip archive');

      // TODO : someday, use assert.rejects (availabe in node 10)
      try {
        await storager.installExtension(FAKE_DL_DESCRIPTOR);
      } catch (err) {
        assert.equal('Cannot unzip archive', err);
        return;
      }
      assert.fail('Install should fail if archive cannot be unzipped');
    });

    it('fails if the manifest cannot be read', async () => {
      const storager = new StorageProvider(TEST_EXTENSION_FOLDER);
      storager.unzipCrx = () => Promise.resolve(true);
      storager.readManifest = () => Promise.reject('Cannot read manifest');

      // TODO : HACK -- someday, use assert.rejects (availabe in node 10)
      try {
        await storager.installExtension(FAKE_DL_DESCRIPTOR);
      } catch (err) {
        assert.equal('Cannot read manifest', err);
        return;
      }
      assert.fail('Install should fail if manifest cannot be read');
    });

    it('fails if destination already exists', () => {
      assert.ok(true);
    });

    it('cleans up sorting artifacts', () => {
      assert.ok(true);
    });

    it('cleans up sorting artifacts on error', () => {
      assert.ok(true);
    });
  });

  describe('gathering installed extensions', () => {
    it('returns an array of InstallDescriptor from an installation folder', () => {

    });

    it('fails gracefully if manifest cannot be read', () => {

    });
  });
});
