import assert = require('assert');
import * as path from 'path';
// import { ipcRenderer } from 'electron';
import CxFetcher from '../../src/browser/cx-fetcher/cx-fetcher';
import {
  EXTENSION_ID,
  FAKE_CX_INFOS,
  FAKE_UPDATE_XML,
  TEST_INSTALLED_FOLDER,
  FAKE_EXTENSION_ID,
  EXTENSION_VERSION,
} from './constants';
import CxStorageProvider from '../../src/browser/cx-fetcher/cx-storage-provider';

describe('Chrome Extension Fetcher', () => {

  afterEach(() => {
    CxFetcher.reset();
  });

  it('instanciates as a singleton', () => {
    const cxFetcher = new CxFetcher();
    assert.equal(cxFetcher instanceof CxFetcher, true);
  });

  it('has default downloader provider', () => {
    assert.ok(true);
  });

  it('has default storage provider', () => {
    // const mockDlProvider = { downloadById: () => null, cleanupById: () => null, getUpdateInfo: () => null };
    // const cxFetcher = new CxFetcher({ cxDownloader: mockDlProvider });
    assert.ok(true);
  });

  describe('fetching chrome extension', () => {
    it('executes the whole cycle and register the expected Cx', async () => {
      const cxFetcher = new CxFetcher();
      const cxInfos = await cxFetcher.fetch(EXTENSION_ID);

      // Check it arrived at the right place
      assert.equal(
        cxInfos.path,
        `/Users/mikael/Documents/Code/electron-chrome-extension/src/browser/cx-fetcher/extensions/${EXTENSION_ID}/8.4.2`
      );
    });

    it('records the extension as "in use" while installing', () => {

    });

    it('does not execute if the extension is in use already (update/remove)', () => {

    });
  });

  describe('discovering already installed extension', () => {
    it('registers installed Cx', async () => {
      const cxStorager = new CxStorageProvider(TEST_INSTALLED_FOLDER);
      const expectedFolder = path.join(TEST_INSTALLED_FOLDER, FAKE_EXTENSION_ID, EXTENSION_VERSION);
      const cxFetcher = new CxFetcher({ cxStorager: cxStorager });

      const beforeScan = cxFetcher.availableCx();
      assert.equal(beforeScan.size, 0);

      await cxFetcher.scanInstalledExtensions();

      const afterScan = cxFetcher.availableCx();
      // A Cx is effectively in the map
      assert.equal(afterScan.size, 1);
      // It is the expected Cx
      const installedCx = afterScan.get(FAKE_EXTENSION_ID);
      assert.ok(installedCx);
      // @ts-ignore
      assert.equal(installedCx.version, EXTENSION_VERSION);
      // @ts-ignore
      assert.equal(installedCx.path, expectedFolder);
    });

    it('sends an event for discovered Cx', () => {

    });
  });

  describe('updating extensions', () => {
    it('checks if an update is available', async () => {
      // Mock downloader to return fake XML
      const mockDownloader = new class {
        // @ts-ignore
        getUpdateInfo(url: string) { return FAKE_UPDATE_XML; }
      };

      // @ts-ignore
      const cxFetcher = new CxFetcher({ cxDownloader: mockDownloader });
      cxFetcher.saveCx(EXTENSION_ID, FAKE_CX_INFOS);
      const actual = await cxFetcher.checkForUpdate(EXTENSION_ID);
      assert.equal(actual, true);
    });

    it('updates an extension', () => {

    });

    it('sends an event when updating an extension', () => {

    });

    it('auto-update all registered extensions', () => {

    });

    it('starts a loop of auto-update on initialization', () => {

    });

    it('stops the loop of auto-update', () => {

    });
  });

});
