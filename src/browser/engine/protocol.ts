import { app, protocol } from 'electron';
import { readFileSync, createReadStream } from 'fs';
import stream from 'stream';
import { lookup } from 'mime-types';
import { join } from 'path';
import { parse } from 'url';

import { Protocol } from '../../common';
import { getExtensionById } from '../chrome-extension';
import { protocolAsScheme } from '../../common/utils';

import ECx from './api';

// tslint:disable-next-line: max-line-length
const defaultContentSecurityPolicy = 'script-src \'self\' blob: filesystem: chrome-extension-resource:; object-src \'self\' blob: filesystem:;';

(protocol as any).registerSchemesAsPrivileged([
  { scheme: protocolAsScheme(Protocol.Extension), privileges: { standard: true, secure: true, bypassCSP: true } },
]);

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

  // Todo : Hack to get extension ID,
  // revert to hostname when this (https://github.com/getstation/electron-chrome-extension/commit/8f8d37e13c47611ce9c8b184775a68fa52fc883d) is reverted too
  const splitted = src.split('/');
  const ecxId = splitted[splitted.length - 2];

  // Set Content Security Policy for Chrome Extensions
  if (ECx.isLoaded(ecxId)) {
    const manifestPath = join(src, 'manifest.json');
    const manifest = await readFileSync(manifestPath, 'utf-8');

    const manifestContentSecurityPolicy = JSON.parse(manifest).content_security_policy;
    const contentSecurityPolicy = manifestContentSecurityPolicy ? manifestContentSecurityPolicy : defaultContentSecurityPolicy;

    headers['content-security-policy'] = contentSecurityPolicy;
  }

  // Check if it's the background page (html)
  if (`/${name}` === pathname) {
    headers['content-type'] = 'text/html';

    // Transform a Buffer into a Stream (expected in callback)
    const dataStream = new stream.PassThrough();
    dataStream.end(html);

    return callback({
      statusCode: 200,
      headers,
      data: dataStream,
    });
  }

  // todo(hugo) check extension permissions

  // Create file stream
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
