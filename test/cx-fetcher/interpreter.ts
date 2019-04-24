import assert = require('assert');

import InterpreterProvider from '../../src/browser/fetcher/interpreter-provider';

import {
  FAKE_CX_INFOS,
  FAKE_INSTALL_DESCRIPTOR,
  FAKE_UPDATE_DESCRIPTOR,
  FAKE_VERSION_ARRAY,
  FAKE_VERSION_INVALID_ARRAY,
} from './constants';

describe('Default Interpreter Provider', () => {
  describe('interpreting', () => {
    it('transforms InstallDescriptor into a correct CxInfo', () => {
      const interpreter = new InterpreterProvider();
      const cxInfos = interpreter.interpret(FAKE_INSTALL_DESCRIPTOR);

      assert(cxInfos.location.path, 'test/to/files');
      assert(cxInfos.version, '0.0.1');
      assert(cxInfos.updateUrl, 'https://unknown.destination.lost');
    });
  });

  describe('detecting updated version', () => {
    it('is true when update version is higher than the current', () => {
      const interpreter = new InterpreterProvider();

      // fake update version is 1.2.0
      FAKE_CX_INFOS.version = { number: '1.0.0.0', parsed: [1, 0, 0, 0] };
      const actual = interpreter.shouldUpdate(FAKE_CX_INFOS, FAKE_UPDATE_DESCRIPTOR);

      assert.equal(actual, true);
    });

    it('is false when both versions are equal', () => {
      const interpreter = new InterpreterProvider();
      // Represents the current version (the fake update version is 1.2.0)
      FAKE_CX_INFOS.version = { number: '1.2.0', parsed: [1, 2, 0] };
      const actual = interpreter.shouldUpdate(FAKE_CX_INFOS, FAKE_UPDATE_DESCRIPTOR);

      assert.equal(actual, false);
    });

    it('is false when the update version is lower than the current', () => {
      const interpreter = new InterpreterProvider();
      // Represents the current version (the fake update version is 1.2.0)
      FAKE_CX_INFOS.version = { number: '10.2.0', parsed: [10, 2, 0] };
      const actual = interpreter.shouldUpdate(FAKE_CX_INFOS, FAKE_UPDATE_DESCRIPTOR);

      assert.equal(actual, false);
    });
  });

  describe('sorting versions', () => {
    it('return the highest version from an array', () => {
      const interpreter = new InterpreterProvider();
      const highest = interpreter.sortLastVersion(FAKE_VERSION_ARRAY);

      assert.equal(highest.number, '2.0');
    });

    it('throw an error if array is empty', () => {
      const interpreter = new InterpreterProvider();
      assert.throws(
        () => { interpreter.sortLastVersion([]); },
        /No versions could be read and found/,
        'Should fail if an empty array is given'
      );
    });

    it('throw an error if no valid values', () => {
      const interpreter = new InterpreterProvider();
      assert.throws(
        () => { interpreter.sortLastVersion(FAKE_VERSION_INVALID_ARRAY); },
        /No versions could be read and found/,
        'Should fail if no valid versions have been given'
      );
    });
  });

});
