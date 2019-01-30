import { join } from 'path';

const { RpcIpcManager } = require('electron-simple-rpc');

import {
  Api,
  Channel,
  extensionScope,
  scope,
} from '../../common';

// todo(hugo) abstract event emitter here for emit via RPC

export default class Handler {
  protected manager: any;
  protected handlerScope: string;
  protected eventScope: string;

  constructor(extensionId: string) {
    const namespace = this.constructor.name;
    const definitions = join('..', '..', 'common', 'apis', namespace.toLowerCase());
    const { Methods } = require(definitions);

    const library = Object
      .keys(Methods)
      .reduce(
        (handlers, method) => {
          const handler = this[`handle${method}`];

          handlers[Methods[method]] = async (...args: any[]) =>
            await handler.apply(this, args);

          return handlers;
        },
        {}
      );

    const handlerScope = extensionScope(
      Channel.Handler, Api[namespace], extensionId
    );

    this.eventScope = scope(Channel.Event, Api[namespace]);

    this.manager = new RpcIpcManager(library, handlerScope);
  }

  release() {
    this.manager.release();
  }
}
