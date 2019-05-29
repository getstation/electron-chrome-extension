import { log } from '../common/utils';

// API Calls Logger

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

export const logger = (context: any) => new Proxy(context, handler);

export default logger;
