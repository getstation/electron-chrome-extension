import { app, protocol } from 'electron';
import { createReadStream, readFile } from 'fs';
import { PassThrough } from 'stream';
import { lookup } from 'mime-types';
import { join } from 'path';
import { parse } from 'url';
import { promisify } from 'util';
// @ts-ignore no types
import matchAll from 'string.prototype.matchall';

import { Protocol } from '../../common';
import { getExtensionById } from '../chrome-extension';
import { protocolAsScheme, fromEntries } from '../../common/utils';

const asyncReadFile = promisify(readFile);

/**
 * Protocol.ts
 *
 * Everything related to `chrome-extension://` protocol goes here
 *
 * - Register protocol
 * - Handle and serve extension web resources and background page
 *
**/

// defaultContentSecurityPolicy match Chromium kDefaultContentSecurityPolicy
// https://cs.chromium.org/chromium/src/extensions/common/manifest_handlers/csp_info.cc?l=31
// tslint:disable-next-line: max-line-length
const defaultContentSecurityPolicy = 'script-src \'self\' blob: filesystem: chrome-extension-resource:; object-src \'self\' blob: filesystem:;';

(protocol as any).registerSchemesAsPrivileged([
  { scheme: protocolAsScheme(Protocol.Extension),
    privileges: { standard: true, secure: true, bypassCSP: true } },
]);

// The protocol handler load file into Buffers
// before transform them into a Stream (expected in callback).
// Stream callback allow custom headers.

const protocolHandler = async (
  { url }: any,
  callback: Function
) => {
  const { hostname, pathname } = parse(url);
  if (!hostname || !pathname) return callback();

  const extension = getExtensionById(hostname);
  if (!extension) return callback();

  const { src, backgroundPage: { name, html } } = extension;

  const manifestPath = join(src, 'manifest.json');
  const manifestFile = await asyncReadFile(manifestPath, 'utf-8');
  const manifest = JSON.parse(manifestFile);

  const headers = new Map();

  // Always send CORS
  // refs:
  // https://cs.chromium.org/chromium/src/extensions/browser/extension_protocols.cc?l=524
  // https://cs.chromium.org/chromium/src/extensions/browser/extension_protocols.cc?l=330
  // https://cs.chromium.org/chromium/src/extensions/browser/extension_protocols.cc?l=1017
  headers.set('access-control-allow-origin', '*');

  // Set Content Security Policy for Chrome Extensions
  //
  // refs:
  // GetSecurityPolicyForURL - https://cs.chromium.org/chromium/src/extensions/browser/extension_protocols.cc?l=498
  // CSPInfo::GetExtensionPagesCSP - https://cs.chromium.org/chromium/src/extensions/common/manifest_handlers/csp_info.cc?l=110
  // CSPHandler::ParseExtensionPagesCSP - https://cs.chromium.org/chromium/src/extensions/common/manifest_handlers/csp_info.cc?l=216
  // CSPHandler::SetDefaultExtensionPagesCSP - https://cs.chromium.org/chromium/src/extensions/common/manifest_handlers/csp_info.cc?rcl=4292bebbd8388070fc8718bb54d793b6f36fe4a6&l=311
  const manifestContentSecurityPolicy = manifest.content_security_policy;
  const contentSecurityPolicy = manifestContentSecurityPolicy ?
    manifestContentSecurityPolicy : defaultContentSecurityPolicy;

  headers.set('content-security-policy', contentSecurityPolicy);

  // Check if we serve the background page (html)
  if (`/${name}` === pathname) {
    headers.set('content-type', 'text/html');

    const backgroundPageData = (new PassThrough())
      .end(html);

    return callback({
      statusCode: 200,
      headers: fromEntries(headers),
      data: backgroundPageData,
    });
  }

  const uri = join(src, pathname);
  const data = createReadStream(uri);

  const mimeType = lookup(pathname);
  if (mimeType) headers.set('content-type', mimeType);

  return callback({
    statusCode: 200,
    headers: fromEntries(headers),
    data,
  });
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
