import { join } from 'path';

const { RpcIpcManager } = require('electron-simple-rpc');

import {
  Api,
  Channel,
  extensionScope,
  eventScope,
} from '../../common';
import { ExtensionEventMessage } from '../../common/types';

export default class Handler<E> {

  protected namespace: Api;
  protected manager: any;
  protected emitter: (payload: ExtensionEventMessage['payload']) => void;
  protected handlerScope: string;
  protected eventScope: string;

  constructor(extensionId: string, emitter: (payload: ExtensionEventMessage['payload']) => void) {
    this.namespace = this.constructor.name as Api;
    this.emitter = emitter;
    const definitions = join('..', '..', 'common', 'apis', this.namespace.toLowerCase());
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
      Channel.Handler, Api[this.namespace], extensionId
    );

    this.manager = new RpcIpcManager(library, handlerScope);
  }

  emit(eventName: E, payload: ExtensionEventMessage['payload']) {
    const channel = eventScope(Api[this.namespace] as Api, eventName);
    this.emitter({ channel, payload });
  }

  release() {
    this.manager.release();
  }
}
