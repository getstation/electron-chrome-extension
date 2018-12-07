import { Extension } from '../shared/types';
import { apis, apiFeatures } from '../shared/definitions';
import {
  getApi,
  getTypeByReference,
  resolve,
  addTargetApiPath,
  log,
  warn,
} from './utils';
import {
  addEventSubscription,
  hasEventSubscription,
  removeEventSubscription,
} from './events';
import { operationAllowed } from './checker';
import { ipcMain } from 'electron';

const injectChromeApi = (
  context: Window,
  extension: Extension,
  isBackgroundPage: boolean,
) => {
  log(`Inject Chrome API for ${extension.id} ${isBackgroundPage}`);

  const handler = {
    get(target: any, property: PropertyKey, _: any): any {
      const { __apiPath } = target;

      if (typeof property !== 'string') {
        warn('Property is not a string');
        return;
      }

      // API

      const apis = target['apis'];

      if (apis) {
        const api = getApi(apis, property);

        if (api) {
          return new Proxy(addTargetApiPath(api, target, property), handler);
        }

        if (__apiPath.length === 0) {
          warn(`chrome.${property} is missing`);
          return;
        }
      }

      // Sub namepaces and properties

      const properties = target['properties'];

      if (properties) {
        if (properties[property]) {
          const reference = properties[property]['$ref'];

          if (reference) {
            const type = getTypeByReference(target, reference);

            return new Proxy(addTargetApiPath(type, target, property), handler);
          }

          // property
          return properties[property];
        }
      }

      if (!operationAllowed(apiFeatures, extension, [...__apiPath, property], isBackgroundPage)) {
        return;
      }

      // Methods

      if (target['functions']) {
        const method = resolve(target, 'functions', property);

        if (method) {
          if (method['returns']) {
            log([...__apiPath, method.name], method.parameters);
            // synchronous method call
            return;
          }


          // asynchronous method call
          const mock = (...args: any) => {
            // ['tabs', 'get']  method
            log([...__apiPath, method.name], method.parameters)
            log(args);

            // send { channel: '', args: 'args - cb', ext: Extension, meta :{} } =>
          };

          return mock;
        }
      }

      // Events

      const eventMethods = ['addListener', 'hasListener', 'removeListener'];

      if (eventMethods.includes(property)) {
        const path = __apiPath.join('.');

        log(Array.from(context.__eventsSubscriptions.keys()));

        switch (property) {
          case 'addListener':
            return (callback: Function) =>
              addEventSubscription(context.__eventsSubscriptions, path, callback);
          case 'hasListener':
            return (callback: Function) =>
              hasEventSubscription(context.__eventsSubscriptions, path, callback);
          case 'removeListener':
            return (callback: Function) =>
              removeEventSubscription(context.__eventsSubscriptions, path, callback);
        }
      }

      const events = target['events'];

      if (events) {
        const event = resolve(target, 'events', property);
        return new Proxy(addTargetApiPath(event, target, property), handler);
      }

      // Default Behavior

      warn(`${target}.${property} is not handled`);
    },
  };


  context.__targetProvider = { __apiPath: [], apis };
  context.__eventsSubscriptions = new Map();
  context.chrome = new Proxy(context.__targetProvider, handler);

  return Object.freeze(context.chrome);
};

export default injectChromeApi;
