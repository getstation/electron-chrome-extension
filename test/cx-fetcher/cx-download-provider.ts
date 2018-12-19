import assert = require('assert');
const fs = require('fs').promises;
// import { ipcRenderer } from 'electron';
import DownloadProvider from '../../src/browser/cx-fetcher/cx-download-provider';

const EXTENSION_ID = 'dheionainndbbpoacpnopgmnihkcmnkl';

describe('Default Download Provider', () => {
  describe('downloading', () => {
    it('can download a crx archive with an ID', async () => {
      const downloader = new DownloadProvider();
      const crxPath = await downloader.downloadById(EXTENSION_ID);
      const crxInfo = await fs.stat(crxPath);

      // Check that the downloaded thing is actually a file
      assert.equal(crxInfo.isFile(), true);
      assert.notEqual(crxInfo.size, 0);
    });
  });

  describe('clean up', () => {
    it('remembers and removes a temp dir', () => {

    });

    it('fails graciously if extension doe not exists', () => {

    });
  });

  describe('get update infos', () => {
    it('fetches an update xml from a CxInfos', () => {

    });

    it('throws an error if no update url is present', () => {

    });

    it('throws an error if fetch fails', () => {

    });
  });
});
