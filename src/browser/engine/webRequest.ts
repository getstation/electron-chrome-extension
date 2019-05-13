import { app, webContents } from 'electron';
import enhanceWebRequest from 'electron-better-web-request';
// @ts-ignore
import recursivelyLowercaseJSONKeys from 'recursive-lowercase-json';

import { Protocol } from '../../common';
import { fromEntries } from '../../common/utils';

const requestIsXhrOrSubframe = (details: any) => {
  const { resourcetype } = details;

  const isXhr = resourcetype === 'xhr';
  const isSubframe = resourcetype === 'subFrame';

  return isXhr || isSubframe;
};

const requestHasExtensionOrigin = (details: any) => {
  const { headers: { origin } } = details;

  if (origin) {
    return origin.startsWith(Protocol.Extension);
  }

  return false;
};

const requestIsFromBackgroundPage = (details: any): boolean => {
  const { webcontentsid } = details;

  if (webcontentsid) {
    const wc = webContents.fromId(webcontentsid);

    if (wc) {
      return wc.getURL().startsWith(Protocol.Extension);
    }

    return false;
  }

  return false;
};

const requestIsOption = (details: any) => {
  const { method } = details;

  return method === 'OPTIONS';
};

const requestIsForExtension = (details: any) =>
  requestHasExtensionOrigin(details) && requestIsXhrOrSubframe(details);

const requestsOrigins = new Map<string, string>();

app.on(
  'session-created',
  (session: Electron.Session) => {
    enhanceWebRequest(session);

    session.webRequest.onBeforeSendHeaders(
      // @ts-ignore
      (details: any, callback: Function) => {
        const formattedDetails = recursivelyLowercaseJSONKeys(details);
        const { id, headers: { origin } } = formattedDetails;

        requestsOrigins.set(id, origin);

        if (!requestIsFromBackgroundPage(formattedDetails) && requestIsForExtension(formattedDetails)
          && !requestIsOption(formattedDetails)) {
          return callback({
            cancel: false,
            requestHeaders: {
              ...formattedDetails.requestheaders,
              origin: ['null'],
            },
          });
        }

        callback({
          cancel: false,
          requestHeaders: formattedDetails.requestheaders,
        });
      },
      {
        origin: 'ecx-cors',
      }
    );

    session.webRequest.onHeadersReceived(
      // @ts-ignore
      (details: any, callback: Function) => {
        const formattedDetails = recursivelyLowercaseJSONKeys(details);
        const { id, responseheaders } = formattedDetails;

        const headers = new Map<string, string[]>(Object.entries(responseheaders));

        // Override Content Security Policy Header
        //
        // `chrome-extension://` is registered as privilegied
        // with `webFrame.registerURLSchemeAsPrivileged()`
        // but added iFrames with extension protocol
        // don't bypass top frame CSP frame-src policy
        //
        // ref: https://bugs.chromium.org/p/chromium/issues/detail?id=408932#c35
        //
        //
        // * Protocol `chrome-extension://` is considered trustworthy
        // ref: https://w3c.github.io/webappsec-secure-contexts/#is-origin-trustworthy
        //
        // * Protocol can bypass secure context check
        // ref: //src/chrome/common/secure_origin_whitelist.cc
        // https://cs.chromium.org/chromium/src/chrome/common/secure_origin_whitelist.cc?l=16
        //
        // * Protocol added to the Renderer Web Secure Context Safelist
        // ref: //src/chrome/renderer/chrome_content_renderer_client.cc
        // https://cs.chromium.org/chromium/src/chrome/renderer/chrome_content_renderer_client.cc?l=428
        //
        // * Protocol should bypass CSP check
        // ref: //src/third_party/blink/renderer/core/frame/csp/content_security_policy.cc?l=706
        // https://cs.chromium.org/chromium/src/third_party/blink/renderer/core/frame/csp/content_security_policy.cc?l=1557
        //
        // * Secure Directive Values
        // ref: //src/extensions/common/csp_validator.cc
        // https://cs.chromium.org/chromium/src/extensions/common/csp_validator.cc?l=256

        const cspHeaderKey = 'content-security-policy';
        const cspPolicyKey = 'frame-src';
        const cspPolicyDelimiter = ';';
        const cspDirective: string | undefined = (responseheaders[cspHeaderKey] || [])[0];

        if (cspDirective) {
          const policies = cspDirective.split(cspPolicyDelimiter);

          const unmodifiedPolicies = policies.filter((p: string) => !p.includes(cspPolicyKey));

          const modifiedFrameSrcPolicies = policies
            .filter((p: string) => p.includes(cspPolicyKey))
            .map((p: string) => `${p} ${Protocol.Extension}`);

          const newPolicies = unmodifiedPolicies.concat(modifiedFrameSrcPolicies).join(`${cspPolicyDelimiter} `);

          headers.set(cspHeaderKey, [newPolicies]);
        }
        // End override CSP iframe-src policy

        const accessControlAllowOrigin = responseheaders['access-control-allow-origin'] || [];
        const allowedOriginIsWildcard = accessControlAllowOrigin.includes('*');

        if (requestIsForExtension(formattedDetails)
          || allowedOriginIsWildcard) {
          headers.set('access-control-allow-credentials', ['true']);
          headers.set('access-control-allow-origin', [requestsOrigins.get(id)!]);
        } else {
          headers.set('access-control-allow-credentials', ['true']);
        }

        requestsOrigins.delete(id);

        callback({
          cancel: false,
          responseHeaders: fromEntries(headers),
        });
      },
      {
        origin: 'ecx-cors',
      }
    );
  }
);
