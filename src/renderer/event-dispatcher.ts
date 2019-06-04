import { ipcRenderer } from 'electron';

import { Channel } from '../common';
import { ExtensionEventMessage } from '../common/types';
import { isIterable } from '../common/utils';

/**
 * @name subscribeAndForwardEvents
 * @abstract Meta event handler that dispatch emitted events from the main
 * into the given Event API channel (e.g: `chrome.tabs.onCreated`).
 * This allow us to keep the renderer agnostic of the APIs events, to be DRY and
 * subscribe only one time per renderer preventing overflow the Electron IPC
 * @example
 * ```ts
 * // main.ts
 *
 * sendEventToExtensions(
 *   CookiesEvents.OnChanged,
 *   {
 *     cookie,
 *     cause,
 *     removed,
 *   }
 * )
 *
 * // renderer.ts
 *
 * chrome.cookies = {
 *   ...,
 *   onChanged: new Event(),
 * }
 * ```
 * will dispatch the event payload to `chrome.cookies.onChanged` listeners
 * @param context the Chrome context (available via `window.chrome`)
 * @returns void
 */

const subscribeAndForwardEvents = (context: any) =>
  ipcRenderer.on(
    Channel.Event,
    (_: Electron.Event, { channel, payload }: ExtensionEventMessage) => {
      const targetedEvent = channel.split('.')
        .reduce(
          // tslint:disable-next-line: no-parameter-reassignment
          (event: any, path: string) => event = event[path],
          context,
        );

      targetedEvent.emit(...(isIterable(payload) ? payload : [payload]));
    }
  );

export default subscribeAndForwardEvents;
