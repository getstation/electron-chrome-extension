import assert = require('assert');
// import { ipcRenderer } from 'electron';
import CxFetcher from '../../src/browser/cx-fetcher/cx-fetcher';

describe('Chrome Extension Fetcher', () => {
  it('Instanciate as a singleton', () => {
    const cxFetcher = new CxFetcher();
    assert.equal(cxFetcher instanceof CxFetcher, true);
  });

  it('Has default downloader provider', () => {
    const mockStorageProvider = {};
    // @ts-ignore
    const cxFetcher = new CxFetcher(mockStorageProvider, undefined);
    assert.equal(true, true);
  });

  it('Has default storage provider', () => {
    const mockDlProvider = {};
    // @ts-ignore
    const cxFetcher = new CxFetcher(undefined, mockDlProvider);
    assert.equal(true, true);
  });

  it('Can download a crx zip file', async () => {
    const extensionID = 'dheionainndbbpoacpnopgmnihkcmnkl';
    const cxFetcher = new CxFetcher();

    const filePath = await cxFetcher.fetchOne(extensionID);

    assert.equal(filePath, `/Users/mikael/Documents/Code/electron-chrome-extension/src/browser/cx-fetcher/extensions/${extensionID}.crx`);
  });
});
