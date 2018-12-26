import * as assert from 'assert';
import { Window } from '@src/common/apis/windows';

describe('chrome.windows', () => {
  before(() => {
    import('@src/renderer/chrome-api' as any)
      .then(m => m.injectTo('test', false, window));
  });

  it('API Available', () => {
    // @ts-ignore
    const namespace = window.chrome;

    assert.equal(Boolean(namespace), true);
  });

  it('Create Window', () => {
    const win = {
      url: 'google.com',
    };

    // @ts-ignore
    window.chrome.windows.create(
      win,
      (w: Window) => {
        assert.notEqual(w.id, undefined);
      }
    );
  });
});
