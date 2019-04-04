import { app, webContents } from 'electron';
import enhanceWebRequest from 'electron-better-web-request';
// @ts-ignore
import recursivelyLowercaseJSONKeys from 'recursive-lowercase-json';

import { Protocol } from '../../common';

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

        const accessControlAllowOrigin = responseheaders['access-control-allow-origin'] || [];
        const allowedOriginIsWildcard = accessControlAllowOrigin.includes('*');

        if (requestIsForExtension(formattedDetails)
          || allowedOriginIsWildcard) {
          const modifiedHeaders = {
            'access-control-allow-credentials': ['true'],
            'access-control-allow-origin': [requestsOrigins.get(id)],
          };
          requestsOrigins.delete(id);

          return callback({
            cancel: false,
            responseHeaders: {
              ...responseheaders,
              ...modifiedHeaders,
            },
          });
        }

        requestsOrigins.delete(id);

        callback({
          cancel: false,
          responseHeaders: {
            ...responseheaders,
            'access-control-allow-credentials': ['true'],
          },
        });
      },
      {
        origin: 'ecx-cors',
      }
    );
  }
);
