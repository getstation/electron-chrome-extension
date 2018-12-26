import assert = require('assert');
import * as path from 'path';
// import { ipcRenderer } from 'electron';
import CxFetcher from '../../src/browser/cx-fetcher/cx-fetcher';
import {
  EXAMPLE_EXTENSION_ID,
  EXAMPLE_EXTENSION_VERSION,
  TEST_PATH_INSTALLED,
  FAKE_CX_INFOS,
  FAKE_UPDATE_XML,
  FAKE_EXTENSION_ID,
  FAKE_EXTENSION_PATH,
  FAKE_EXTENSION_UPDATE_URL,
  FAKE_INSTALL_DESCRIPTOR,
  FAKE_DL_DESCRIPTOR,
} from './constants';
import CxStorageProvider from '../../src/browser/cx-fetcher/cx-storage-provider';
import CxDownloadProvider from '../../src/browser/cx-fetcher/cx-download-provider';
import CxInterpreterProvider from '../../src/browser/cx-fetcher/cx-interpreter-provider';
import { MutexStatus } from '../../src/browser/cx-fetcher/types';

describe('Chrome Extension Fetcher', () => {

  afterEach(() => {
    CxFetcher.reset();
  });

  it('instanciates as a singleton', () => {
    const cxFetcher = new CxFetcher();
    const evilTwin = new CxFetcher();
    assert.equal(cxFetcher, evilTwin);
  });

  it('has default downloader provider', () => {
    const cxFetcher = new CxFetcher();
    const downloader = cxFetcher.cxDownloader;
    assert.ok(downloader);
    assert.ok(downloader instanceof CxDownloadProvider);
  });

  it('has default storage provider', () => {
    const cxFetcher = new CxFetcher();
    const storager = cxFetcher.cxStorager;
    assert.ok(storager);
    assert.ok(storager instanceof CxStorageProvider);
  });

  it('has a default interpreter', () => {
    const cxFetcher = new CxFetcher();
    const interpreter = cxFetcher.cxInterpreter;
    assert.ok(interpreter);
    assert.ok(interpreter instanceof CxInterpreterProvider);
  });

  describe('fetching chrome extension', () => {
    beforeEach(() => {
      // Mockup all the external stuff
      const cxDownloader = new CxDownloadProvider();
      const cxStorager = new CxStorageProvider();
      const cxInterpreter = new CxInterpreterProvider();
      cxDownloader.downloadById = () => Promise.resolve(FAKE_DL_DESCRIPTOR);
      cxDownloader.cleanupById = () => Promise.resolve();
      cxStorager.installExtension = () => Promise.resolve(FAKE_INSTALL_DESCRIPTOR);
      cxInterpreter.interpret = () => FAKE_CX_INFOS;

      // Override with mockups
      new CxFetcher({
        cxDownloader,
        cxStorager,
        cxInterpreter,
      });
    });

    it('executes the whole cycle and register the expected Cx', async () => {
      const cxFetcher = new CxFetcher();
      const cxInfos = await cxFetcher.fetch(EXAMPLE_EXTENSION_ID);

      // Check the registered extension and its installation
      assert.equal(cxInfos.location.path, FAKE_EXTENSION_PATH);
      assert.equal(cxInfos.version.number, '1.0.0');
      assert.equal(cxInfos.updateUrl, FAKE_EXTENSION_UPDATE_URL);
    });

    it('records the extension as a mutex while installing', async () => {
      const cxFetcher = new CxFetcher();
      cxFetcher.cxDownloader.cleanupById = () => new Promise((resolve) => {
        setTimeout(() => resolve('test'), 5000);
      });
      // Don't await, we want to check while it execs
      cxFetcher.fetch(EXAMPLE_EXTENSION_ID);

      assert.ok(cxFetcher.hasMutex(EXAMPLE_EXTENSION_ID));
      assert.equal(cxFetcher.getMutex(EXAMPLE_EXTENSION_ID), MutexStatus.Installing);
    });

    it('does not execute if the extension is in use already (update/remove)', async () => {
      const cxFetcher = new CxFetcher();
      cxFetcher.cxDownloader.cleanupById = () => new Promise((resolve) => {
        setTimeout(() => resolve('test'), 5000);
      });
      // Don't await the first call, we want to check while it execs
      cxFetcher.fetch(EXAMPLE_EXTENSION_ID);
      try {
        // Await the second (to catch the error);
        await cxFetcher.fetch(EXAMPLE_EXTENSION_ID);
      } catch (err) {
        assert.equal(err.message, `Extension ${EXAMPLE_EXTENSION_ID} is already being used`);
        return;
      }

      assert.fail('Should not execute on an already installing extension');
    });
  });

  describe('discovering already installed extension', () => {
    it('registers installed Cx', async () => {
      const cxStorager = new CxStorageProvider({ extensionsFolder: { path: TEST_PATH_INSTALLED } });
      const cxFetcher = new CxFetcher({ cxStorager: cxStorager });

      const expectedFolder = path.join(TEST_PATH_INSTALLED, EXAMPLE_EXTENSION_ID, EXAMPLE_EXTENSION_VERSION.number);

      // Check before scan
      const beforeScan = cxFetcher.availableCx();
      assert.equal(beforeScan.size, 0);

      // Scan
      await cxFetcher.scanInstalledExtensions();

      // Check after scan
      const afterScan = cxFetcher.availableCx();
      assert.equal(afterScan.size, 1);

      // It is the expected Cx
      const installedCx = afterScan.get(EXAMPLE_EXTENSION_ID);
      assert.ok(installedCx);
      if (installedCx) {
        assert.equal(installedCx.version, EXAMPLE_EXTENSION_VERSION);
        assert.equal(installedCx.location.path, expectedFolder);
      }
    });

    it('sends an event for discovered Cx', () => {

    });
  });

  describe('updating extensions', () => {
    it('checks if an update is available', async () => {
      // Mock downloader to return fake XML
      const mockDownloader = new class {
        // @ts-ignore
        getUpdateInfo(url: string) { return { xml: FAKE_UPDATE_XML }; }
      };

      // @ts-ignore
      const cxFetcher = new CxFetcher({ cxDownloader: mockDownloader });
      cxFetcher.saveCx(FAKE_CX_INFOS);
      const actual = await cxFetcher.checkForUpdate(FAKE_EXTENSION_ID);
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
