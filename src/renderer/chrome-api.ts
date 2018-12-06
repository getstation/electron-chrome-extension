import { Extension, ChromeApi } from '../shared/types';
import { getApi, getTypeByReference, resolve, addTargetApiPath } from './utils';
import { apis, apiFeatures } from '../shared/definitions';

declare global {
  interface Window { chrome: ChromeApi; }
}

const { log, warn } = console;

const targetProvider = { __apiPath: [], apis };

const eventsSubscriptions = new Map<string, Set<Function>>();

const addEventSubscription = (
  store: Map<string, Set<Function>>,
  namespace: string,
  value: Function
): Set<Function> => {
  const namespaceEvents = store.get(namespace);

  if (namespaceEvents) {
    return namespaceEvents.add(value);
  }

  store.set(namespace, new Set<Function>());

  const a = store.get(namespace)!.add(value);
  log(store);
  return a;
}

const hasEventSubscription = (
  store: Map<string, Set<Function>>,
  namespace: string,
  value: Function
): boolean => {
  const namespaceEvents = store.get(namespace);

  if (namespaceEvents) {
    return namespaceEvents.has(value);
  }

  return false;
}

const removeEventSubscription = (
  store: Map<string, Set<Function>>,
  namespace: string,
  value: Function
): void => {
  const namespaceEvents = store.get(namespace);

  if (namespaceEvents) {
    namespaceEvents.delete(value);
  }
}

// Content Scripts and Permission check
const operationAllowed = (
  features: any,
  extension: Extension,
  path: string[],
  isBackgroundPage: boolean,
): boolean | void => {
  if (path.length === 0) return false;

  const feature = features[path.join('.')];

  if (feature) {
    const contexts = feature['contexts'];

    if (!Boolean(contexts)) {
      return true;
    }

    const allowedAsContentScripts = contexts
      .includes('content_script');

    if (feature['dependencies']) {
      const requiredPermissions = feature['dependencies']
        .filter((d: string) => d.startsWith('permission:'));

      if (requiredPermissions.length > 0) {
        const requiredPermission = requiredPermissions
          .map((d: string) => d.split(':')[1])[0];

        const { manifest: { permissions } } = extension;
        const permissionChecked = permissions.includes(requiredPermission);

        if (isBackgroundPage) {
          if (!permissionChecked) {
            warn(`Permission missing: ${requiredPermission}`);
          }
          return permissionChecked;
        }

        if (allowedAsContentScripts) {
          if (!permissionChecked) {
            warn(`Permission missing: ${requiredPermission}`);
          }

          return permissionChecked;
        }

        warn(`Access not allowed for ${path} in content scripts`);
        return false;
      }
    }

    if (isBackgroundPage) {
      return true;
    }

    if (allowedAsContentScripts) {
      return true;
    }

    warn(`Access not allowed for ${path} in content scripts`);
    return false;
  }

  path.pop();

  return operationAllowed(features, extension, path, isBackgroundPage);
}

const injectChromeApi = (
  context: Window,
  extension: Extension,
  isBackgroundPage: boolean,
) => {
  log(`Inject Chrome API for ${extension.id} ${isBackgroundPage}`);

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

          log([...__apiPath, method.name], method.parameters);
          // asynchronous method call
          return;
        }
      }

      // Events

      const eventMethods = ['addListener', 'hasListener', 'removeListener'];

      if (eventMethods.includes(property)) {
        const path = __apiPath.join('.');

        switch (property) {
          case 'addListener':
            return (callback: Function) =>
              addEventSubscription(eventsSubscriptions, path, callback);
          case 'hasListener':
            return (callback: Function) =>
              hasEventSubscription(eventsSubscriptions, path, callback);
          case 'removeListener':
            return (callback: Function) =>
              removeEventSubscription(eventsSubscriptions, path, callback);
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

  // Mute the Window object to add the chrome namespace
  context.chrome = new Proxy(targetProvider, handler);

  return Object.freeze(context.chrome);
};

export default injectChromeApi;
