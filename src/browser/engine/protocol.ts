import { app, protocol } from 'electron';
import { readFile } from 'fs';
import { lookup } from 'mime-types';
import { join } from 'path';
import { parse } from 'url';

import { Protocol } from '../../common';
import { protocolAsScheme } from '../../common/utils';
import { getExtensionById } from '../chrome-extension';

if (protocol.registerStandardSchemes) { // electron <= 4
  protocol.registerStandardSchemes(
    [protocolAsScheme(Protocol.Extension)],
    { secure: true }
  );
} else { // electron >= 5
  (protocol as any).registerSchemesAsPrivileged([
    { scheme: protocolAsScheme(Protocol.Extension), privileges: { standard: true, secure: true } },
  ]);
}

const protocolHandler = (
  { url }: Electron.RegisterBufferProtocolRequest,
  callback: Function
) => {
  const { hostname, pathname } = parse(url);
  if (!hostname || !pathname) return callback();

  const extension = getExtensionById(hostname);

  if (!extension) return callback();

  const { src, backgroundPage: { name, html } } = extension;

  if (`/${name}` === pathname) {
    return callback({
      mimeType: 'text/html',
      data: html,
    });
  }

  // todo(hugo) check extension permissions
  readFile(
    join(src, pathname),
    (err, content) => {
      if (err) {
        return callback(-6);  // FILE_NOT_FOUND
      }

      const mimeType = lookup(pathname);

      if (mimeType) {
        return callback({
          mimeType,
          data: content,
        });
      }

      return callback(content);
    }
  );
};

app.on('session-created', (session) => {
  if (Protocol.Extension === Protocol.ExtensionDefault) {
    session.protocol.unregisterProtocol(
      protocolAsScheme(Protocol.ExtensionDefault)
    );
  }

  session.protocol.registerBufferProtocol(
    protocolAsScheme(Protocol.Extension),
    protocolHandler,
    (error: any) => {
      if (error) {
        console.error(
          `Unable to register ${Protocol.Extension} protocol: ${error}`
        );
      }
    }
  );
});
