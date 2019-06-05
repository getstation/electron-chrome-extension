import { log } from '../common/utils';

// Proxy for log functions/properties calls in a given context
/**
 * @name loggingProxy
 * @abstract This recursive proxy log function calls and property access
 * for debugging purpose
 * @example
 * ```ts
 * // somewhere in the extension codebase
 * chrome.cookies.getAll({ url: 'google.com' }, myCallback)
 *
 * // in the renderer devtool console
 * (log) chrome.cookies.getAll - { url: 'google.com' } myCallback - [...resultCookies]
 * ```
 * @param context object
 */

const handler = {
  get: (apis: any, prop: string): any => {
    if (!Boolean(apis.__path)) {
      apis.__path = 'chrome';
    }

    if (apis[prop] && typeof apis[prop] === 'object') {
      apis[prop].__path = `${apis.__path}.${prop}`;
      return new Proxy(apis[prop], handler);
    }

    if (typeof apis[prop] === 'function') {
      return (...args: any[]) => {
        if (args.filter(String).length > 0) {
          const callResult = apis[prop](...args);
          if (typeof callResult === 'object') {
            callResult.__path = callResult.constructor.name.toLowerCase();
            return new Proxy(callResult, handler);
          }

          log(`${apis.__path}.${prop} `, ...args, callResult);

          return callResult;
        }

        const result = apis[prop]();

        if (result.constructor.name.toLowerCase() === 'object') {
          result.__path = result.constructor.name.toLowerCase();
          return new Proxy(result, handler);
        }

        log(`${apis.__path}.${prop} `, result);

        return result;
      };
    }

    if (['string', 'number'].includes(typeof apis[prop])) {
      const result = apis[prop];
      log(`${apis.__path}.${prop} `, result);

      return result;
    }

    return apis[prop];
  },
};

export const loggingProxy = (context: any) => new Proxy(context, handler);

export default loggingProxy;
