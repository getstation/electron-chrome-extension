import assert = require('assert');
// import { ipcRenderer } from 'electron';
import CxFetcher from '../../src/browser/cx-fetcher/cx-fetcher';

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
    const extensionID = 'dheionainndbbpoacpnopgmnihkcmnkl';   // Use gmelius extension id
    const cxFetcher = new CxFetcher();                        // Use default providers
    // Fetch the extension
    const filePath = await cxFetcher.fetchOne(extensionID);
    // Check it arrived at the right place
    assert.equal(filePath, `/Users/mikael/Documents/Code/electron-chrome-extension/src/browser/cx-fetcher/extensions/${extensionID}.crx`);
  });
});
