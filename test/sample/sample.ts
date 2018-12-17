import { ipcRenderer } from 'electron';
import assert = require('assert');

describe('Sample Loop', () => {
  it('IPC sync call should respond', () => {
    const result = ipcRenderer.sendSync('ping');
    assert.equal(result, 'pong');
  });
});
