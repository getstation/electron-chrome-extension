import assert = require('assert');
import * as path from 'path';
// import { ipcRenderer } from 'electron';
import CxFetcher from '../../src/browser/cx-fetcher/fetcher';
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
import CxStorageProvider from '../../src/browser/cx-fetcher/storage-provider';
import CxDownloadProvider from '../../src/browser/cx-fetcher/download-provider';
import CxInterpreterProvider from '../../src/browser/cx-fetcher/interpreter-provider';
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
    const downloader = cxFetcher.downloader;
    assert.ok(downloader);
    assert.ok(downloader instanceof CxDownloadProvider);
  });

  it('has default storage provider', () => {
    const cxFetcher = new CxFetcher();
    const storager = cxFetcher.storager;
    assert.ok(storager);
    assert.ok(storager instanceof CxStorageProvider);
  });

  it('has a default interpreter', () => {
    const cxFetcher = new CxFetcher();
    const interpreter = cxFetcher.interpreter;
    assert.ok(interpreter);
    assert.ok(interpreter instanceof CxInterpreterProvider);
  });

  describe('fetching chrome extension', () => {
    beforeEach(() => {
      const downloader = new CxDownloadProvider();
      const storager = new CxStorageProvider();
      const interpreter = new CxInterpreterProvider();
      downloader.downloadById = () => Promise.resolve(FAKE_DL_DESCRIPTOR);
      downloader.cleanupById = () => Promise.resolve();
      storager.installExtension = () => Promise.resolve(FAKE_INSTALL_DESCRIPTOR);
      interpreter.interpret = () => FAKE_CX_INFOS;

      new CxFetcher({
        downloader,
        storager,
        interpreter,
      });
    });

    it('executes the whole cycle and register the expected Cx', async () => {
      const cxFetcher = new CxFetcher();
      const cxInfos = await cxFetcher.fetch(EXAMPLE_EXTENSION_ID);

      assert.equal(cxInfos.location.path, FAKE_EXTENSION_PATH);
      assert.equal(cxInfos.version.number, '1.0.0');
      assert.equal(cxInfos.updateUrl, FAKE_EXTENSION_UPDATE_URL);
    });

    it('records the extension as a mutex while installing', async () => {
      const cxFetcher = new CxFetcher();

      cxFetcher.downloader.cleanupById = () => new Promise((resolve) => {
        setTimeout(() => resolve('test'), 5000);
      });

      cxFetcher.fetch(EXAMPLE_EXTENSION_ID);

      assert.ok(cxFetcher.hasMutex(EXAMPLE_EXTENSION_ID));
      assert.equal(cxFetcher.getMutex(EXAMPLE_EXTENSION_ID), MutexStatus.Installing);
    });

    it('does not execute if the extension is in use already (update/remove)', async () => {
      const cxFetcher = new CxFetcher();
      cxFetcher.downloader.cleanupById = () => new Promise((resolve) => {
        setTimeout(() => resolve('test'), 5000);
      });

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
      const storager = new CxStorageProvider({ extensionsFolder: { path: TEST_PATH_INSTALLED } });
      const cxFetcher = new CxFetcher({ storager });

      const expectedFolder = path.join(TEST_PATH_INSTALLED, EXAMPLE_EXTENSION_ID, EXAMPLE_EXTENSION_VERSION.number);

      const beforeScan = cxFetcher.list();
      assert.equal(beforeScan.size, 0);

      await cxFetcher.scanInstalledExtensions();

      const afterScan = cxFetcher.list();
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
      const mockDownloader = new class {
        getUpdateInfo(_url: string) { return { xml: FAKE_UPDATE_XML }; }
      };

      // @ts-ignore
      const cxFetcher = new CxFetcher({ downloader: mockDownloader });
      cxFetcher.saveCx(FAKE_CX_INFOS);
      const actual = await cxFetcher.checkForUpdate(FAKE_EXTENSION_ID);
      assert.equal(actual, true);
    });

    it('updates an extension', () => {
      // todo
    });

    it('sends an event when updating an extension', () => {
      // todo
    });

    it('auto-update all registered extensions', () => {
      // todo
    });

    it('starts a loop of auto-update on initialization', () => {
      // todo
    });

    it('stops the loop of auto-update', () => {
      // todo
    });
  });

});
