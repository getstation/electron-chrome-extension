import * as assert from 'assert';
const { join } = require('path');
const fse = require('fs-extra');
import StorageProvider from '../../src/browser/cx-fetcher/storage-provider';
import {
  EXAMPLE_EXTENSION_VERSION,
  TEST_PATH_EXTENSIONS,
  FAKE_EXTENSION_ID,
  FAKE_DL_DESCRIPTOR,
  EXAMPLE_ARCHIVE_MANIFEST,
} from './constants';

describe('Default Storage Provider', () => {
  it('has a default installation folder', () => {
    const storager = new StorageProvider();
    const expected = join(
      __dirname, '..', '..', 'src', 'browser', 'cx-fetcher', 'extensions'
    );
    assert.equal(storager.extensionsFolder, expected);
  });

  it('accepts custom installation folder', () => {
    const storager = new StorageProvider({ extensionsFolder: { path: 'path/to/files' } });
    const expected = 'path/to/files';
    assert.equal(storager.extensionsFolder.path, expected);
  });

  describe('installing extension', () => {

    afterEach(async () => {
      await fse.remove(TEST_PATH_EXTENSIONS);
    });

    it('returns a correct IInstall from a IDownload', async () => {
      const storager = new StorageProvider({ extensionsFolder: { path: TEST_PATH_EXTENSIONS } });
      const actual = await storager.installExtension(FAKE_DL_DESCRIPTOR);

      const expected = {
        path: join(TEST_PATH_EXTENSIONS, FAKE_EXTENSION_ID, EXAMPLE_EXTENSION_VERSION),
        manifest: EXAMPLE_ARCHIVE_MANIFEST,
      };

      // Do not check the whole manifest, only the interestings parts
      // TODO : Make sure that we check the CxManifest type entirely and automaticaly
      assert.equal(actual.location.path, expected.path);
      assert.equal(actual.manifest.version, expected.manifest.version);
      assert.equal(actual.manifest.update_url, expected.manifest.update_url);
    });

    it('extracts files in correct folder tree', async () => {
      const storager = new StorageProvider({ extensionsFolder: { path: TEST_PATH_EXTENSIONS } });

      await storager.installExtension(FAKE_DL_DESCRIPTOR);
      const expectedFolder = join(TEST_PATH_EXTENSIONS, FAKE_EXTENSION_ID, EXAMPLE_EXTENSION_VERSION);
      const expectedManifest = join(expectedFolder, 'manifest.json');

      assert.ok(await fse.pathExists(expectedFolder), 'Folder does not exists at the expected location');
      assert.ok(await fse.pathExists(expectedManifest), 'Manifest file is not at the expected location');
    });

    it('fails if the archive cannot be unzipped', async () => {
      const storager = new StorageProvider({ extensionsFolder: { path: TEST_PATH_EXTENSIONS } });
      storager.unzipCrx = () => Promise.reject('Cannot unzip archive');

      // todo: someday, use assert.rejects (availabe in node 10)
      try {
        await storager.installExtension(FAKE_DL_DESCRIPTOR);
      } catch (err) {
        assert.equal('Cannot unzip archive', err);
        return;
      }
      assert.fail('Install should fail if archive cannot be unzipped');
    });

    it('fails if the manifest cannot be read', async () => {
      const storager = new StorageProvider({ extensionsFolder: { path: TEST_PATH_EXTENSIONS } });
      storager.unzipCrx = () => Promise.resolve(true);
      storager.readManifest = () => Promise.reject('Cannot read manifest');

      // todo: someday, use assert.rejects (availabe in node 10)
      try {
        await storager.installExtension(FAKE_DL_DESCRIPTOR);
      } catch (err) {
        assert.equal('Cannot read manifest', err);
        return;
      }
      assert.fail('Install should fail if manifest cannot be read');
    });

    it('fails if destination already exists', () => {
      assert.ok(true); // todo
    });

    it('cleans up sorting artifacts', () => {
      assert.ok(true); // todo
    });

    it('cleans up sorting artifacts on error', () => {
      assert.ok(true); // todo
    });
  });
});
