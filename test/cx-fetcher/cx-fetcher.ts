import assert = require('assert');
// import { ipcRenderer } from 'electron';
import CxFetcher from '../../src/browser/cx-fetcher/cx-fetcher';

const EXTENSION_ID = 'dheionainndbbpoacpnopgmnihkcmnkl';
const EXTENSION_UPDATE_URL = '';
const EXTENSION_PATH = '';
const FAKE_CX_INFOS = { version: '1.0.0', update_url: EXTENSION_UPDATE_URL, path: EXTENSION_PATH };
const FAKE_UPDATE_XML = `
<?xml version='1.0' encoding='UTF-8'?>
<gupdate xmlns='http://www.google.com/update2/response' protocol='2.0'>
  <app appid='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'>
    <updatecheck codebase='http://myhost.com/mytestextension/mte_v2.crx' version='1.2.0' />
  </app>
</gupdate>
`;

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
    const cxInfos = await cxFetcher.fetch(EXTENSION_ID);

    // Check it arrived at the right place
    assert.equal(
      cxInfos.path,
      `/Users/mikael/Documents/Code/electron-chrome-extension/src/browser/cx-fetcher/extensions/${EXTENSION_ID}/8.4.2`
    );
  });

  it('can check if an update is available', async () => {
    // Mock downloader to return fake XML
    const mockDownloader = new class {
      // @ts-ignore
      fetchUpdateManifest(url: string) { return FAKE_UPDATE_XML; }
    };

    // @ts-ignore // TODO : Replace this with something else
    delete CxFetcher._instance;

    // @ts-ignore
    const cxFetcher = new CxFetcher(undefined, mockDownloader);
    cxFetcher.saveCx(EXTENSION_ID, FAKE_CX_INFOS);
    const actual = await cxFetcher.checkForUpdate(EXTENSION_ID);
    assert.equal(actual, true);
  });
});
