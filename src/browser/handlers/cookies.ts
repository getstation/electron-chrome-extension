import { session as electronSession } from 'electron';

import { IExtension, ExtensionEventMessage } from '../../common/types';
import { Cookie, SameSiteStatus, Events } from '../../common/apis/cookies';
import Handler from '../engine/handler';

// todo(hugo) check permisions for URLs

const ELECTRON_TO_CRX_COOKIE_CHANGE_CAUSE = {
  explicit: 'explicit',
  overwrite: 'overwrite',
  expired: 'expired',
  evicted: 'evicted',
  'expired-overwrite': 'expired_overwrite',
};

export default class Cookies extends Handler<Events> {
  private electronCookies: Electron.Cookies;

  constructor(extensionId: IExtension['id'], emitter: (payload: ExtensionEventMessage['payload']) => void) {
    super(extensionId, emitter);
    this.electronCookies = electronSession.defaultSession!.cookies;

    this.electronCookies.addListener(
      'changed',
      (_: any, cookie: any, cause: any, removed: any) => {
        const cxCookie = this.electronCookieToCxCookie(cookie);
        const cxCause = ELECTRON_TO_CRX_COOKIE_CHANGE_CAUSE[cause];

        const details = {
          cookie: cxCookie,
          cause: cxCause,
          removed,
        };

        this.emit(Events.OnChanged, details);
      }
    );
  }

  async handleGet(details: { url: string } & Partial<Cookie>): Promise<Cookie | null> {
    const { url, name } = details; // warning(hugo) ignore storeId

    const cookies = await this.electronCookies.get({ url, name });

    if (cookies && cookies[0]) {
      const cookie = cookies[0];
      return this.electronCookieToCxCookie(cookie);
    }

    // "This parameter is null if no such cookie was found"
    // https://developer.chrome.com/extensions/cookies#property-get-callback
    return null;
  }

  async handleGetAll(details: { url: string } & Partial<Cookie>) {
    const { url, name, domain, path, secure, session } = details;
    // warning(hugo) ignore storeId

    const cookies = await this.electronCookies.get(
      { url, name, domain, path, secure, session });

    if (cookies) {
      return cookies.map(c => this.electronCookieToCxCookie(c));
    }

    return [];
  }

  async handleSet(details: { url: string } & Partial<Cookie>) {
    const { url, name, value, domain, path, secure, httpOnly, expirationDate } = details; // warning(hugo) ignore sameSite & storeId

    await this.electronCookies.set(
      { url, name, value, domain, path, secure, httpOnly, expirationDate });

    return {
      name,
      value,
      domain,
      path,
      secure,
      httpOnly,
      expirationDate,
      storeId: null,
    };
  }

  async handleRemove(details: { url: string } & Partial<Cookie>) {
    const { url, name } = details; // warning(hugo) ignore storeId

    await this.electronCookies.remove(url, name!);
    return { url, name, storeId: null };
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
      sameSite: SameSiteStatus.NoRestriction,
      session: session!,
      expirationDate,
      storeId: '0',
    };
  }
}
