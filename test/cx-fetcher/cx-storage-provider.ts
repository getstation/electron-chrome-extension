import assert = require('assert');
// import { ipcRenderer } from 'electron';
import StorageProvider from '../../src/browser/cx-fetcher/cx-storage-provider';

describe('Default Storage Provider', () => {
  it('has an extractExtension function', () => {
    const type = typeof StorageProvider.extractExtension;
    assert.equal(type, 'function');
  });

  it('extracts an archive', () => {

  });

  it('finds a version number in a chrome extension folder', () => {

  });

  it('extract a chrome extension into a versionned subtree', () => {

  });
});
