import assert = require('assert');
// import { ipcRenderer } from 'electron';
import InterpreterProvider from '../../src/browser/cx-fetcher/cx-interpreter-provider';

const FAKE_EXTENSION_ID = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const FAKE_CXINFOS = {
  path: 'test/to/extension/files',
  version: '1.0.0.0',
  update_url: 'https://unknown.destination.lost',
};
const FAKE_INSTALL_DESCRIPTOR = {
  path: 'test/to/files',
  manifest: {
    version: '0.0.1',
    update_url: 'https://unknown.destination.lost',
  },
};
const FAKE_UPDATE_XML = `
<?xml version='1.0' encoding='UTF-8'?>
<gupdate xmlns='http://www.google.com/update2/response' protocol='2.0'>
  <app appid='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'>
    <updatecheck codebase='http://myhost.com/mytestextension/mte_v2.crx' version='1.2.0' />
  </app>
</gupdate>
`;
const FAKE_UPDATE_DESCRIPTOR = {
  xml: FAKE_UPDATE_XML,
};
const FAKE_VERSION_ARRAY = ['1.0.0', '2.0', '1.0.3.1', '0.9.9.0'];

describe('Default Interpreter Provider', () => {
  describe('interpret', () => {
    it('interpret() transform InstallDescriptor into a correct CxInfo', () => {
      const interpreter = new InterpreterProvider();
      const cxInfos = interpreter.interpret(FAKE_INSTALL_DESCRIPTOR);

      assert(cxInfos.path, 'test/to/files');
      assert(cxInfos.version, '0.0.1');
      assert(cxInfos.update_url, 'https://unknown.destination.lost');
    });
  });

  describe('shouldUpdate()', () => {
    it('shouldupdate() is true with a greater proposed version', () => {
      const interpreter = new InterpreterProvider();
      FAKE_CXINFOS.version = '2.0.0.0';
      const actual = interpreter.shouldUpdate(FAKE_EXTENSION_ID, FAKE_CXINFOS, FAKE_UPDATE_DESCRIPTOR);

      assert.equal(actual, true);
    });

    it('shouldupdate() is false with equal proposed versions', () => {
      const interpreter = new InterpreterProvider();
      FAKE_CXINFOS.version = '1.2.0';
      const actual = interpreter.shouldUpdate(FAKE_EXTENSION_ID, FAKE_CXINFOS, FAKE_UPDATE_DESCRIPTOR);

      assert.equal(actual, false);
    });

    it('shouldupdate() is false with a lower proposed version', () => {
      const interpreter = new InterpreterProvider();
      FAKE_CXINFOS.version = '0.1';
      const actual = interpreter.shouldUpdate(FAKE_EXTENSION_ID, FAKE_CXINFOS, FAKE_UPDATE_DESCRIPTOR);

      assert.equal(actual, false);
    });
  });

  describe('sortLastVersion()', () => {
    it('return the highest version from an array', () => {
      const interpreter = new InterpreterProvider();
      const highest = interpreter.sortLastVersion(FAKE_VERSION_ARRAY);

      assert.equal(highest, '2.0');
    });

    it('throw an error if array is empty', () => {
      const interpreter = new InterpreterProvider();
      try {
        const highest = interpreter.sortLastVersion([]);
      } catch (err) {
        assert.equal(err.message, 'No versions could be read and found');
      }

      assert.fail('An error should have been thrown');
    });

    it('throw an error if no valid values', () => {
      const interpreter = new InterpreterProvider();
      try {
        const highest = interpreter.sortLastVersion(['azz', 'buioo', 'boom']);
      } catch (err) {
        assert.equal(err.message, 'No versions could be read and found');
      }

      assert.fail('An error should have been thrown');
    });
  });

});
