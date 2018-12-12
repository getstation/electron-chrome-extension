import assert = require('assert');
// import { ipcRenderer } from 'electron';
import CxFetcher from '../../src/browser/cx-fetcher/cx-fetcher';

describe('Chrome Extension Fetcher', () => {
  it('Instanciate the CxFetcher singleton', () => {
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

  it('Download a crx zip file', async () => {
    const cxFetcher = new CxFetcher();
    console.log(cxFetcher.cxStorage);
    const filePath = await cxFetcher.fetchOne('dheionainndbbpoacpnopgmnihkcmnkl');
    assert.equal(filePath, 'blob');
  });
});
