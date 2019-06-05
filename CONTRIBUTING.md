# Contributing

## Add extension API binding

Add missing chrome APIs is seamless.

In the folder `src/common/apis/`, add `<namespace>.ts` file if missing.
It should include two enums: `Methods` and `Events` like this:

```ts
// cookies.ts

export enum Methods {
  Get = 'get',
  GetAll = 'get-all',
  Set = 'set',
  Remove = 'remove',
  GetAllCookieStores = 'get-all-cookie-stores',
}

export enum Events {
  OnChanged = 'onChanged',
}
```
Full sample file: [src/common/apis/cookies.ts](src/common/apis/cookies.ts)

Then register it in `src/common/apis/index` and `enum Api` in `src/common/index`

In the folder `src/renderer/api/`, add `<namespace>.ts` file if missing.
It should be like this:

```ts
export const cookies = (extensionId: IExtension['id']) => {
  // `createWire` manage RPC and `bind` manage RPC calls over channels inherited from the enum
  const bind = createWire<Methods>(Api.Cookies, extensionId);

  return {
    MY_PROPERTY: -1,

    set: bind(Methods.Set),
    get: bind(Methods.Get),
    remove: bind(Methods.Remove),
    getAll: bind(Methods.GetAll),
    getAllCookieStores: bind(Methods.GetAllCookieStores),

    onChanged: new Event(),
  };
};

export default cookies;
```
Full sample file: [src/renderer/api/cookies.ts](src/renderer/api/cookies.ts)

The last thing is to write the handler like this:

```ts
// Handler super class manage the RPC manager and match
// binding with method hander: `chrome.cookies.get` will trigger `Cookies#handleGet`
// Emitting events is really simple; `this.emit(<channel>, ...args);` will dispatch to listeners

export default class Cookies extends Handler<Events> {
  private electronCookies: Electron.Cookies;

  constructor(extensionId: IExtension['id'], emitter: Emitter) {
    super(extensionId, emitter);
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

        this.emit(Events.OnChanged, details);
      }
    );
  }

  async handleGet(details: { url: string } & Partial<Cookie>): Promise<Cookie | null> {
    const { url, name } = details;

    return new Promise((resolve) => {
      this.electronCookies.get(
        { url, name },
        (_error, cookies) => {
          if (cookies && cookies[0]) {
            const cookie = cookies[0];
            resolve(this.electronCookieToCxCookie(cookie));
          }

          resolve(null);
        }
      );
    });
  }
  ...
}
```
Full sample file: [src/browser/handlers/cookies.ts](src/browser/handlers/cookies.ts)
