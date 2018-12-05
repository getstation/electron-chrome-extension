import { Extension, ChromeApi } from '../shared/types';
import { getApi, getTypeByReference, resolve, addTargetApiPath } from './utils';
import { apis } from '../shared/definitions';

declare global {
  interface Window { chrome: ChromeApi; }
}

const { log, warn } = console;
const targetProvider = { __apiPath: [], apis };

const injectChromeApi = (
  context: Window,
  extensionId: Extension['id'],
  isBackgroundPage: boolean,
) => {
  log(`Inject Chrome API for ${extensionId} ${isBackgroundPage}`);

  // Detect Chrome version
  // Detect if allowed in CS
  // Detect if permission present
  // Type checking on call

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

      // Methods

      if (target['functions']) {
        const method = resolve(target, 'functions', property);

        if (method) {
          if (method['returns']) {
            log([...__apiPath, method.name], method.parameters);
            // synchronous method call
            return;
          }

          log([...__apiPath, method.name], method.parameters);
          // asynchronous method call
          return;
        }
      }

      // Events

      const eventMethods = ['addListener', 'hasListener', 'removeListener'];

      if (eventMethods.includes(String(property))) {
        log([...__apiPath, property]);
        return;
      }

      const events = target['events'];

      if (events) {
        const event = resolve(target, 'events', property);
        return new Proxy(addTargetApiPath(event, target, property), handler);
      }


      // Default Behavior

      warn(` ${target}.${property} is not handled`);
    },
  };

  // Mute the Window object to add the chrome namespace
  context.chrome = new Proxy(targetProvider, handler);

  return Object.freeze(context.chrome);
};

export default injectChromeApi;
