import { app, protocol } from 'electron';
import { readFileSync, createReadStream } from 'fs';
import { Transform, PassThrough } from 'stream';
import { lookup } from 'mime-types';
import { join, dirname, normalize } from 'path';
import { parse, URL } from 'url';
// @ts-ignore no types
import matchAll from 'string.prototype.matchall';

import { Protocol } from '../../common';
import { getExtensionById } from '../chrome-extension';
import { protocolAsScheme, fromEntries } from '../../common/utils';

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

(protocol as any).registerStandardSchemes(
  [protocolAsScheme(Protocol.Extension)],
  { secure: true }
);

// The protocol handler load file into Buffers
// before transform them into a Stream (expected in callback).
// Stream callback allow custom headers.
//
// Handlable resources are listed in the extension manifest
// for a navigation from a **web origin** to an extension resource
// Allowed HTML pages served under `chrome-extension://` protocol
// can include extension assets that don't need to be whitelisted.
// Since we didn't know the origin of the requests*, each time we serve
// a response, we scan the content to whitelist inner resources.
//
// * protocol request referrer is always blank.
// issue: https://github.com/electron/electron/issues/14747
//
// refs:
// https://developer.chrome.com/extensions/manifest/web_accessible_resources
// AllowExtensionResourceLoad - https://cs.chromium.org/chromium/src/extensions/browser/extension_protocols.cc?l=429
const whitelistedResourcesFromProtocolServedFiles = new Set();

// Regex to capture the src attribute value for scrips, stylesheets...
const resourceLinkRegex = /src\s*=\s*['"](.+?)['"]/g;

const captureWhitelistableResourcesFromProtocolServedFile = (pathname: string) =>
  new Transform({
    transform(chunk: any, _encoding: any, cb: Function) {
      const linksAllowed = matchAll(chunk.toString('utf8'), resourceLinkRegex);
      const directory = dirname(pathname);

      for (const [, link] of linksAllowed) {
        try {
          const isUrl = new URL(link);
          if (isUrl) break;
        } catch (e) { }

        const fullPath = join(directory, normalize(link));

        if (!whitelistedResourcesFromProtocolServedFiles.has(fullPath)) {
          whitelistedResourcesFromProtocolServedFiles.add(fullPath);
        }
      }

      // tslint:disable-next-line: no-invalid-this
      this.push(chunk);
      cb();
    },
  });

const protocolHandler = async (
  { url }: Electron.RegisterBufferProtocolRequest,
  callback: Function
) => {
  const { hostname, pathname } = parse(url);
  if (!hostname || !pathname) return callback();

  const extension = getExtensionById(hostname);
  if (!extension) return callback();

  const { src, backgroundPage: { name, html } } = extension;

  const manifestPath = join(src, 'manifest.json');
  const manifestFile = await readFileSync(manifestPath, 'utf-8');
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
      .pipe(captureWhitelistableResourcesFromProtocolServedFile(pathname))
      .end(html);

    return callback({
      statusCode: 200,
      headers: fromEntries(headers),
      data: backgroundPageData,
    });
  }

  const accessibleResources = manifest.web_accessible_resources
    .map((r: any) => `/${r}`); // accessibles ressources are relatives to the extension folder. Make them absolut to play with URL Node module

  const isResourceAccessible = accessibleResources.includes(pathname) ||
    whitelistedResourcesFromProtocolServedFiles.has(pathname);

  if (!isResourceAccessible) {
    return callback({
      statusCode: 403,
      headers: fromEntries(headers),
    });
  }

  const uri = join(src, pathname);
  const data = createReadStream(uri)
    .pipe(captureWhitelistableResourcesFromProtocolServedFile(pathname));

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
