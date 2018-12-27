import * as assert from 'assert';
import { Window } from '../../src/common/apis/windows';

describe('chrome.windows', () => {
  before(() => {
    require('../../src/renderer/chrome-api').injectTo('test', false, window);
  });

  it('API Available', () => {
    const namespace = window.chrome.windows;

    assert.equal(Boolean(namespace), true);
  });

  it('Create Window', () => {
    const win = {
      url: 'google.com',
    };

    window.chrome.windows.create(
      win,
      (w: Window) => {
        assert.notEqual(w.id, undefined);
      }
    );
  });

  it('Get Current Window', () => {
    window.chrome.windows.getCurrent(
      {},
      (w: Window) => {
        assert.notEqual(w.id, undefined);
      }
    );
  });
});
