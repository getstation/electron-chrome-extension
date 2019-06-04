import { join } from 'path';

const { RpcIpcManager } = require('electron-simple-rpc');

import {
  Api,
  Channel,
  extensionScope,
  eventScope,
} from '../../common';
import { ExtensionEventMessage } from '../../common/types';

/**
 * @name Handler
 * @abstract This abstract class provide the glue to be triggered
 * from the renderer via RPC and emit events. The handler prepare
 * a custom scope per extension id for the RPC Manager and
 * assign methods defined in the enum to the linked handler method.
 * @example see `src/browser/handlers/cookies.ts`
 * @param extensionId string
 * @param emitter Function - the event bus that will forward events to renderers
 */

export default abstract class Handler<E> {

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
