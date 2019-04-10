import { app, protocol } from 'electron';
import { readFileSync, createReadStream } from 'fs';
import stream from 'stream';
import { lookup } from 'mime-types';
import { join } from 'path';
import { parse } from 'url';
import ECx from './api';

import { Protocol } from '../../common';
import { protocolAsScheme } from '../../common/utils';
import { getExtensionById } from '../chrome-extension';

// tslint:disable-next-line: max-line-length
const defaultContentSecurityPolicy = 'script-src \'self\' blob: filesystem: chrome-extension-resource:; object-src \'self\' blob: filesystem:;';

protocol.registerStandardSchemes(
  [protocolAsScheme(Protocol.Extension)],
  { secure: true }
);

const protocolHandler = async (
  { url }: Electron.RegisterBufferProtocolRequest,
  callback: Function
) => {
  const { hostname, pathname } = parse(url);
  if (!hostname || !pathname) return callback();

  const extension = getExtensionById(hostname);
  if (!extension) return callback();

  const { src, backgroundPage: { name, html } } = extension;
  const headers = {};

  // Hack to get extension ID
  const splitted = src.split('/');
  const ecxId = splitted[splitted.length - 2];

  // Set Content Security Policy
  if (ECx.isLoaded(ecxId)) {
    const { location: { path } } = await ECx.get(ecxId);

    const manifestPath = join(path, 'manifest.json');
    const manifest = await readFileSync(manifestPath, 'utf-8');

    const manifestContentSecurityPolicy = JSON.parse(manifest).content_security_policy;
    const contentSecurityPolicy = manifestContentSecurityPolicy ? manifestContentSecurityPolicy : defaultContentSecurityPolicy;

    headers['content-security-policy'] = contentSecurityPolicy;
  }

  // ?
  if (`/${name}` === pathname) {
    headers['content-type'] = 'text/html';
    const dataStream = new stream.PassThrough();
    dataStream.end(html);

    return callback({
      statusCode: 200,
      headers,
      data: dataStream,
    });
  }

  // todo(hugo) check extension permissions

  // Create stream
  const uri = join(src, pathname);
  const data = createReadStream(uri);

  // Set Mime type
  const mimeType = lookup(pathname);
  if (mimeType) headers['content-type'] = mimeType;

  return callback({
    statusCode: 200,
    headers,
    data,
  });
};

app.on('session-created', (session) => {
  if (Protocol.Extension === Protocol.ExtensionDefault) {
    session.protocol.unregisterProtocol(
      protocolAsScheme(Protocol.ExtensionDefault)
    );
  }

  session.protocol.registerStreamProtocol(
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
