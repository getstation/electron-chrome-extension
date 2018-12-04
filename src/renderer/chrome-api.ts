import { Extension, ChromeApi } from '../shared/types';
import { getApiScope, getTypeByReference, proxify } from './utils';
import { api } from '../shared/definitions';

declare global {
  interface Window { chrome: ChromeApi; }
}

const injectChromeApi = (
  context: Window,
  extensionId: Extension['id'],
  isBackgroundPage: boolean,
) => {
  console.log('Inject Chrome API: ', extensionId, isBackgroundPage);

  // Detect Chrome version
  // Detect if allowed in CS
  // Detect if permission present

  const handler = {
    get(target: any, property: PropertyKey, _: any): any {
      console.log('--- proxy get: ', target, property);

      // API

      const apiScope = getApiScope(String(property));

      if (apiScope) {
        return new Proxy(apiScope, handler);
      }

      // Sub namepaces and properties

      const properties = target['properties'];

      if (properties) {
        if (properties[property]) {
          const reference = properties[property]['$ref'];

          if (reference) {
            return new Proxy(getTypeByReference(target, reference), handler);
          }

          return properties[property];
        }
      }

      // Methods

      if (target['functions']) {
        const method = proxify(target, 'functions', property);

        if (method) {
          if (method['returns']) {
            console.log('Function return immediatly: ', target['id'], method);
            return;
          }

          console.log('Function with callback: ', method['parameters']);
          return;
        }
      }

      // Events

      const eventMethods = ['addListener', 'hasListener', 'removeListener'];

      if (eventMethods.includes(String(property))) {
        console.log('Event: ', target, property);
        return;
      }

      const events = target['events'];

      if (events) {
        const event = proxify(target, 'events', property);
        return new Proxy(event, handler);
      }


      // Default Behavior

      return target[property];
    },
  };

  // const callbacksStore = new Map<string, Function>();

  // Mute the Window object to add the chrome namespace
  context.chrome = new Proxy({}, handler);

  return Object.freeze(context.chrome);
};

export default injectChromeApi;
