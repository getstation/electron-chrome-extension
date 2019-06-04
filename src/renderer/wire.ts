const { rpc } = require('electron-simple-rpc');
import { extensionScope, Channel, Api } from '../common';
import { IExtension } from '../common/types';

/**
 * @name createWire
 * @abstract The high order function prepare RPC calls scoped to
 * extension id and API namespace while `bindder` return a function
 * ready to call for a given method in the namespace. All kinds of APIs methods
 * can use this abstract implementation independently of the arguments
 * length and callback usage.
 * @example
 * ```ts
 * export const cookies = (extensionId: IExtension['id']) => {
 *   const bind = createWire<Methods>(Api.Cookies, extensionId);
 *
 *   return {
 *     getAll: bind(Methods.GetAll),
 *     ...,
 *   };
 * };
 * ```
 * @usage `window.chrome.cookies.getAll({ url: 'https://google.com/' }, myCallback)`
 * @param api Api enum
 * @param extensionId string
 * @returns Function
 */
export const createWire = <T>(api: Api, extensionId: IExtension['id']) => {
  const scope = extensionScope(Channel.Handler, api, extensionId);

  const bindder = (method: T) => {
    return (...args: any[]) => {
      const callback = args.find(arg => typeof arg === 'function');
      const params = args.filter(arg => typeof arg !== 'function');

      if (callback) {
        return rpc(scope, method)(...params).then(callback);
      }

      rpc(scope, method)(...params);
    };
  };

  return bindder;
};
