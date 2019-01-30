// chrome.cookies
// See https://developer.chrome.com/extensions/cookies

// -- Types
// SameSiteStatus
// Cookie
// CookieStore
// OnChangedCause
// -- Methods
// get − chrome.cookies.get(object details, function callback)
// getAll − chrome.cookies.getAll(object details, function callback)
// set − chrome.cookies.set(object details, function callback)
// remove − chrome.cookies.remove(object details, function callback)
// getAllCookieStores − chrome.cookies.getAllCookieStores(function callback)
// -- Events
// onChanged

import { Event } from '../types';

// Types

export enum SameSiteStatus {
  NoRestriction = 'no_restriction',
  Lax = 'lax',
  Strict = 'strict',
}

export enum OnChangedCause {
  Evicted = 'evicted',
  Expired = 'expired',
  Explicit = 'explicit',
  ExpiredOverwrite = 'expired_overwrite',
  Overwrite = 'overwrite',
}

export type Cookie = {
  name: string,
  value: string,
  domain: string,
  hostOnly: boolean,
  path: string,
  secure: boolean,
  httpOnly: boolean,
  sameSite: SameSiteStatus,
  session: boolean,
  expirationDate?: number,
  storeId: string,
};

export type CookieStore = {
  id: string,
  tabIds: string[],
};

// Methods

export enum Methods {
  Get = 'get',
  GetAll = 'get-all',
  Set = 'set',
  Remove = 'remove',
  GetAllCookieStores = 'get-all-cookie-stores',
}

// Types

export type OnChanged = Event<{
  cookie: Cookie,
  cause: OnChangedCause,
  removed: boolean,
}>;
