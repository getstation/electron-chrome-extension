import { session as electronSession } from 'electron';
const { rpc } = require('electron-simple-rpc');
import { IExtension } from '../../common/types';
import { Cookie, SameSiteStatus } from '../../common/apis/cookies';
import Handler from './handler';

// todo(hugo) check permisions for URLs

const ELECTRON_TO_CRX_COOKIE_CHANGE_CAUSE = {
  explicit: 'explicit',
  overwrite: 'overwrite',
  expired: 'expired',
  evicted: 'evicted',
  'expired-overwrite': 'expired_overwrite',
};

export default class Cookies extends Handler {
  private electronCookies: Electron.Cookies;

  constructor(extensionId: IExtension['id']) {
    super(extensionId);
    this.electronCookies = electronSession.defaultSession!.cookies;

    this.electronCookies.addListener(
      'changed',
      (_, cookie, cause, removed) => {
        const cxCookie = this.electronCookieToCxCookie(cookie);
        const cxCause = ELECTRON_TO_CRX_COOKIE_CHANGE_CAUSE[cause];

        const details = {
          cookie: cxCookie,
          cause: cxCause,
          removed,
        };

        rpc(this.eventScope, 'onChanged')(details);
      }
    );
  }

  handleGet(details: { url: string } & Partial<Cookie>) {
    const { url, name } = details; // warning(hugo) ignore storeId

    return new Promise((resolve) => {
      this.electronCookies.get(
        { url, name },
        (_error, cookies) => {
          if (cookies && cookies[0]) {
            const cookie = cookies[0];
            resolve(this.electronCookieToCxCookie(cookie));
          }

          return (undefined);
        }
      );
    });
  }

  handleGetAll(details: { url: string } & Partial<Cookie>) {
    const { url, name, domain, path, secure, session } = details;
    // warning(hugo) ignore storeId

    return new Promise((resolve) => {
      this.electronCookies.get(
        { url, name, domain, path, secure, session },
        (_error, cookies) => {
          if (cookies) {
            resolve(cookies.map(c => this.electronCookieToCxCookie(c)));
          }

          resolve([]);
        }
      );
    });
  }

  async handleSet(details: { url: string } & Partial<Cookie>) {
    const { url, name, value, domain, path, secure, httpOnly, expirationDate } = details; // warning(hugo) ignore sameSite & storeId

    return new Promise((resolve) => {
      this.electronCookies.set(
        { url, name, value, domain, path, secure, httpOnly, expirationDate },
        (error) => {
          if (error && error !== null) {
            return resolve(undefined);
          }

          resolve({
            name,
            value,
            domain,
            path,
            secure,
            httpOnly,
            expirationDate,
            storeId: null,
          });
        }
      );
    });

  }

  async handleRemove(details: { url: string } & Partial<Cookie>) {
    const { url, name } = details; // warning(hugo) ignore storeId

    return new Promise((resolve) => {
      this.electronCookies.remove(
        url,
        name!,
        () => {
          resolve({ url, name, storeId: null });
        }
      );
    });
  }

  handleGetAllCookieStores() { } // warning(hugo) ignore for now

  private electronCookieToCxCookie(cookie: Electron.Cookie): Cookie {
    const {
      name,
      value,
      domain,
      hostOnly,
      path,
      secure,
      httpOnly,
      session,
      expirationDate,
    } = cookie;

    return {
      name,
      value,
      domain: domain!,
      hostOnly: hostOnly!,
      path: path!,
      secure: secure!,
      httpOnly: httpOnly!,
      sameSite: SameSiteStatus.Lax,
      session: session!,
      expirationDate,
      storeId: '',
    };
  }
}
