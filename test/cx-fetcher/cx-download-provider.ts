import assert = require('assert');
const fs = require('fs').promises;
// import { ipcRenderer } from 'electron';
import DownloadProvider from '../../src/browser/cx-fetcher/cx-download-provider';

const EXTENSION_ID = 'dheionainndbbpoacpnopgmnihkcmnkl';

describe('Default Download Provider', () => {
  it('has a downloadById function', () => {
    const type = typeof DownloadProvider.downloadById;
    assert.equal(type, 'function');
  });

  it('can download a crx archive with an ID', async () => {
    const crxPath = await DownloadProvider.downloadById(EXTENSION_ID);
    const crxInfo = await fs.stat(crxPath);

    // TODO : Remove this
    console.log(crxPath);

    // Check that the downloaded thing is actually a file
    assert.equal(crxInfo.isFile(), true);
    assert.notEqual(crxInfo.size, 0);
  });
});
