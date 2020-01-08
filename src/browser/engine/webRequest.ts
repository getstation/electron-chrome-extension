import { app } from 'electron';
import enhanceWebRequest from 'electron-better-web-request';
// @ts-ignore
import recursivelyLowercaseJSONKeys from 'recursive-lowercase-json';
// @ts-ignore
import parse from 'content-security-policy-parser';

import { Protocol } from '../../common';
import { fromEntries } from '../../common/utils';

/**
 * Convert object of policies into content security policy heder value
 *
 * @example
 * {
 * 'default-src': ["'self'"],
 * 'script-src': ["'unsafe-eval'", 'scripts.com'],
 * 'object-src': [],
 * 'style-src': ['styles.biz']
 * } => "default-src 'self'; script-src 'unsafe-eval' scripts.com; object-src; style-src styles.biz"
 *
 * @param { [name: string]: string[] } policies policies as object
 * @return {string} the stringified policies
 */
const stringify = (policies: { [name: string]: string[] }): string =>
  Object.entries(policies)
    .map(
      ([name, value]: [string, string[]]) =>
        `${name} ${value.join(' ')}`
    )
    .join(';');

app.on(
  'session-created',
  (session: Electron.Session) => {
    enhanceWebRequest(session);

    session.webRequest.onHeadersReceived(
      // @ts-ignore
      (details: any, callback: Function) => {
        const formattedDetails = recursivelyLowercaseJSONKeys(details);
        const { responseheaders } = formattedDetails;

        const headers = new Map<string, string[]>(Object.entries(responseheaders));

        // Override Content Security Policy Header
        //
        // `chrome-extension://` is registered as privilegied
        // with `webFrame.registerURLSchemeAsPrivileged()`
        // but added iFrames with extension protocol
        // don't bypass top frame CSP frame-src policy
        //
        // ref: https://bugs.chromium.org/p/chromium/issues/detail?id=408932#c35
        // todo: remove this block since Electron 5 fix the problem
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
        const cspDirective: string = (responseheaders[cspHeaderKey] || [])[0];

        if (cspDirective) {
          const policies = parse(cspDirective);
          const frameSrcPolicy = policies[cspPolicyKey];

          if (frameSrcPolicy) {
            const policiesWithOverride = {
              ...policies,
              [cspPolicyKey]: [...frameSrcPolicy, Protocol.Extension],
            };

            headers.set(cspHeaderKey, [stringify(policiesWithOverride)]);
          }
        }
        // End override CSP iframe-src policy

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
