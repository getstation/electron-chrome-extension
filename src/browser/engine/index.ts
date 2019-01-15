import { app, protocol } from 'electron';

import { Protocol } from '../../common';

import protocolHandler from './protocolHandler';
import { protocolAsScheme } from './utils';

protocol.registerStandardSchemes([Protocol.Extension], { secure: true });

app.on('session-created', (session: Electron.Session) => {
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
        console.error(`Unable to register ${Protocol.Extension} protocol: ${error}`);
      }
    }
  );
});
