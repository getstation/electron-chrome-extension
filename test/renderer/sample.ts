import assert = require('assert');
import { ipcRenderer } from 'electron';

describe('Sample Test Feature', () => {
  it('Sample Test', () => {
    const pong = ipcRenderer.sendSync('test-me');
    assert(pong, 'pong');
  });
});
