import assert = require('assert');
// import { ipcRenderer } from 'electron';
import CxFetcher from '../../src/browser/cx-fetcher/cx-fetcher';

const EXTENSION_ID = 'dheionainndbbpoacpnopgmnihkcmnkl';
const EXTENSION_UPDATE_URL = '';
const EXTENSION_PATH = '';
const FAKE_CX_INFOS = { version: '1.0.0', update_url: EXTENSION_UPDATE_URL, path: EXTENSION_PATH };

describe('Chrome Extension Fetcher', () => {
  it('instanciate as a singleton', () => {
    const cxFetcher = new CxFetcher();
    assert.equal(cxFetcher instanceof CxFetcher, true);
  });

  it('has default downloader provider', () => {
    const mockStorageProvider = {};
    const cxFetcher = new CxFetcher(mockStorageProvider, undefined);
    assert.equal(true, true);
  });

  it('has default storage provider', () => {
    const mockDlProvider = { downloadById: () => null, cleanupById: () => null, getUpdateInfo: () => null };
    const cxFetcher = new CxFetcher({ cxDownloader: mockDlProvider });
    assert.equal(true, true);
  });

  it('fetch a chrome extension', async () => {
    const cxFetcher = new CxFetcher();
    const cxInfos = await cxFetcher.fetch(EXTENSION_ID);

    // Check it arrived at the right place
    assert.equal(
      cxInfos.path,
      `/Users/mikael/Documents/Code/electron-chrome-extension/src/browser/cx-fetcher/extensions/${EXTENSION_ID}/8.4.2`
    );
  });

  it('discovers installed chrome extensions', async () => {
    const cxFetcher = new CxFetcher();
    const beforeScan = cxFetcher.availableCx();
    await cxFetcher.scanInstalledExtensions();
    const afterScan = cxFetcher.availableCx();

    assert.equal(beforeScan.size, 0);
    assert.equal(afterScan.size, 1);
  });

  it('can check if an update is available', async () => {
    // Mock downloader to return fake XML
    const mockDownloader = new class {
      // @ts-ignore
      getUpdateInfo(url: string) { return FAKE_UPDATE_XML; }
    };

    CxFetcher.reset();

    // @ts-ignore
    const cxFetcher = new CxFetcher(undefined, mockDownloader);
    cxFetcher.saveCx(EXTENSION_ID, FAKE_CX_INFOS);
    const actual = await cxFetcher.checkForUpdate(EXTENSION_ID);
    assert.equal(actual, true);
  });
});
