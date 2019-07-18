// see src/renderer/window-setup for the explanation

import { parse } from 'url';

const { webContents } = require('electron');
const ipcMain = require('@electron/internal/browser/ipc-main-internal');

const allowedWebContentsTypes = ['window', 'browserView', 'webview'];
const allowedProtocols = ['http:', 'https:'];

ipcMain.on(
  'ECX_POLYFILL_WINDOW_OPENER_POST_MESSAGE',
  (
    _event: Electron.Event,
    origin: string,
    message: any,
    targetOrigin?: string,
  ) => {
    const targetOriginMatchSender = origin === targetOrigin;

    if (targetOriginMatchSender) {
      for (const wc of webContents.getAllWebContents()) {
        const wcType = wc.getType();
        const wcURLProtocol = parse(wc.getURL()).protocol!;

        if (
          allowedWebContentsTypes.includes(wcType) &&
          allowedProtocols.includes(wcURLProtocol)
        ) {
          const js = `
            const messageObj = ${JSON.stringify(message)};
            const event = new MessageEvent('message', { data: messageObj, origin: '*' });
            window.dispatchEvent(event);
          `;

          wc.executeJavaScript(js);
        }
      }
    }
  }
);
