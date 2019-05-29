const { rpc } = require('electron-simple-rpc');
import { extensionScope, Channel, Api } from '../common';
import { IExtension } from '../common/types';

export const createWire = <T>(api: Api, extensionId: IExtension['id']) => {
  const scope = extensionScope(Channel.Handler, api, extensionId);

  return (method: T) => {
    return (...args: any[]) => {
      const callback = args.find(arg => typeof arg === 'function');
      const params = args.filter(arg => typeof arg !== 'function');

      if (callback) {
        return rpc(scope, method)(...params).then(callback);
      }

      rpc(scope, method)(...params);
    };
  };
};
