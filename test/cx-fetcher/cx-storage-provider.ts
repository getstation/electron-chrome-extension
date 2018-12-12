import assert = require('assert');
// import { ipcRenderer } from 'electron';
import StorageProvider from '../../src/browser/cx-fetcher/cx-storage-provider';

describe('Default Storage Provider', () => {
  it('Has a getDestinationFolder function', () => {
    const type = typeof StorageProvider.getDestinationFolder;
    assert.equal(type, 'function');
  });
});
