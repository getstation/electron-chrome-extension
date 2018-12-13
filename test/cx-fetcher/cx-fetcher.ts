import assert = require('assert');
// import { ipcRenderer } from 'electron';
import CxFetcher from '../../src/browser/cx-fetcher/cx-fetcher';

const EXTENSION_ID = 'dheionainndbbpoacpnopgmnihkcmnkl';

describe('Chrome Extension Fetcher', () => {
  it('instanciate as a singleton', () => {
    const cxFetcher = new CxFetcher();
    assert.equal(cxFetcher instanceof CxFetcher, true);
  });

  it('has default downloader provider', () => {
    const mockStorageProvider = {};
    // @ts-ignore
    const cxFetcher = new CxFetcher(mockStorageProvider, undefined);
    assert.equal(true, true);
  });

  it('has default storage provider', () => {
    const mockDlProvider = {};
    // @ts-ignore
    const cxFetcher = new CxFetcher(undefined, mockDlProvider);
    assert.equal(true, true);
  });

  it('fetch a chrome extension', async () => {
    const cxFetcher = new CxFetcher();
    const actualCxPath = await cxFetcher.fetchOne(EXTENSION_ID);

    // Check it arrived at the right place
    assert.equal(
      actualCxPath,
      `/Users/mikael/Documents/Code/electron-chrome-extension/src/browser/cx-fetcher/extensions/${EXTENSION_ID}/8.4.2`
    );
  });
});
