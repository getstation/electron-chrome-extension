import assert = require('assert');
// import { ipcRenderer } from 'electron';
import DownloadProvider from '../../src/browser/cx-fetcher/cx-download-provider';

const EXTENSION_ID = 'dheionainndbbpoacpnopgmnihkcmnkl';

describe('Default Download Provider', () => {
  it('has a downloadById function', () => {
    const type = typeof DownloadProvider.downloadById;
    assert.equal(type, 'function');
  });

  it('can download a crx archive', async () => {
    const crxPath = await DownloadProvider.downloadById(EXTENSION_ID);
    assert.equal(crxPath, '');
  });
});
