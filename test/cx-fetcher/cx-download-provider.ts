import assert = require('assert');
const fs = require('fs').promises;
// import { ipcRenderer } from 'electron';
import DownloadProvider from '../../src/browser/cx-fetcher/cx-download-provider';

const EXTENSION_ID = 'dheionainndbbpoacpnopgmnihkcmnkl';

describe('Default Download Provider', () => {
  it('has a downloadById function', () => {
    const downloader = new DownloadProvider();
    const type = typeof downloader.downloadById;
    assert.equal(type, 'function');
  });

  it('can download a crx archive with an ID', async () => {
    const downloader = new DownloadProvider();
    const crxPath = await downloader.downloadById(EXTENSION_ID);
    const crxInfo = await fs.stat(crxPath);

    // Check that the downloaded thing is actually a file
    assert.equal(crxInfo.isFile(), true);
    assert.notEqual(crxInfo.size, 0);
  });
});
