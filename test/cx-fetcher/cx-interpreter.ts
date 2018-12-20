import assert = require('assert');
// import { ipcRenderer } from 'electron';
import InterpreterProvider from '../../src/browser/cx-fetcher/cx-interpreter-provider';
import {
  FAKE_EXTENSION_ID,
  FAKE_CX_INFOS,
  FAKE_INSTALL_DESCRIPTOR,
  FAKE_UPDATE_DESCRIPTOR,
  FAKE_VERSION_ARRAY,
} from './constants';

describe('Default Interpreter Provider', () => {
  describe('interpreting', () => {
    it('transforms InstallDescriptor into a correct CxInfo', () => {
      const interpreter = new InterpreterProvider();
      const cxInfos = interpreter.interpret(FAKE_INSTALL_DESCRIPTOR);

      assert(cxInfos.path, 'test/to/files');
      assert(cxInfos.version, '0.0.1');
      assert(cxInfos.update_url, 'https://unknown.destination.lost');
    });
  });

  describe('detecting updated version', () => {
    it('is true with a greater proposed version', () => {
      const interpreter = new InterpreterProvider();
      FAKE_CX_INFOS.version = '2.0.0.0';
      const actual = interpreter.shouldUpdate(FAKE_EXTENSION_ID, FAKE_CX_INFOS, FAKE_UPDATE_DESCRIPTOR);

      assert.equal(actual, true);
    });

    it('is false with equal proposed versions', () => {
      const interpreter = new InterpreterProvider();
      FAKE_CX_INFOS.version = '1.2.0';
      const actual = interpreter.shouldUpdate(FAKE_EXTENSION_ID, FAKE_CX_INFOS, FAKE_UPDATE_DESCRIPTOR);

      assert.equal(actual, false);
    });

    it('is false with a lower proposed version', () => {
      const interpreter = new InterpreterProvider();
      FAKE_CX_INFOS.version = '0.1';
      const actual = interpreter.shouldUpdate(FAKE_EXTENSION_ID, FAKE_CX_INFOS, FAKE_UPDATE_DESCRIPTOR);

      assert.equal(actual, false);
    });
  });

  describe('sorting versins', () => {
    it('return the highest version from an array', () => {
      const interpreter = new InterpreterProvider();
      const highest = interpreter.sortLastVersion(FAKE_VERSION_ARRAY);

      assert.equal(highest, '2.0');
    });

    it('throw an error if array is empty', () => {
      const interpreter = new InterpreterProvider();
      assert.throws(
        () => { interpreter.sortLastVersion([]); },
        /No versions could be read and found/,
        'Sort happened even if no versions has been given'
      );
    });

    it('throw an error if no valid values', () => {
      const interpreter = new InterpreterProvider();
      assert.throws(
        () => { interpreter.sortLastVersion(['azz', 'buioo', 'boom']); },
        /No versions could be read and found/,
        'Sort happened even if no valid values has been given'
      );
    });
  });

});
