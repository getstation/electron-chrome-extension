### Revive basic support
- [x] implement API to load extension
- [x] rename all IPC call
- [x] Replace preference manager
- [x] reimplement the proptocol buffer handler

### Add corrections
- [x] remove peristence
- [x] content_scrips support: support CSS
- [x] content_scrips support: fix matches rules implementation	
- [x] content_scrips support: run JS scripts in same context
- [x] Fix insecure content error for resources load via chrome-extension: (not needed if https://github.com/electron/electron/pull/9950/ gets merged)
- [x] content_scrips support: fix chrome.storage to access extension data independently of host page's doamain
- [x] Fix page's URL used to test against content_scripts[].matches
- [x] Add support for chrome.runtime.getManifest()
- [x] content_scripts: support `exclude_matches`
- [x] implement `chrome.storage.onChanged.addListener`
- [ ] support manifest `permissions` hosts (requires https://github.com/electron/electron/issues/10180)
- [ ] implement `chrome.tabs.query`
- [ ] implement `chrome.notifications`
- [ ] implement `chrome.webRequest`

### Dummy-implemented API
- [x] `chrome.tabs.query`
- [x] `chrome.browserAction` (no real sense in context of electron)
- [x] `chrome.notifications`
- [x] `chrome.webRequest`
- [ ] `chrome.windows`

### Test extensions
- [x] mailtracker
- [ ] MixMax => unless you use nativeWindowOpen
- [ ] grammarly 
- [ ] Rapportive => unless you disable `webSecurity`
- [ ] Streak 
- [x] Clearbit
- [x] Gmelius

### Extensions integration notes

#### MixMax
Mixmax is using `chrome.storage.onChanged.addListener`, but looks like using a shim is enough.

Overide user-agent to remove any mention of Electron: `session.setUserAgent(userAgent.replace(/Electron\/\S*\s/, ''))`

I had to dummy-implement various APIs:
- `chrome.storage.onChanged.addListener`
- `chrome.tabs.query`
- `chrome.browserAction` (no real sense in context of electron)
- `chrome.notifications`
- `chrome.webRequest`
=> not sure how it impactcs the execution of the app but seems to work


#### Grammarly
No error in console. After few secsonds, a greyed Grammarly logo appears in the inputs.

#### Rapportive
Rapportive is loading external content from `https://rapportive.com/load/launchpad` that are whiltlisted in manifest's `permissions`.
However, we don't support `permssions`.
The dangerous trick is to disable `webSecurity`.

see https://github.com/electron/electron/issues/10180

#### Streak
Use `document_end` instead of `document_start`

Several erros: 

`app.js:1 Uncaught TypeError: Cannot read property 'getAllCookies' of undefined` => no idea


```
Error logged: Error: failure to send updateUninstallPage messaage
    at t.e (app.js:197)
    at new t (app.js:197)
    at e (app.js:197)
    at e (app.js:74)
    at e (app.js:74)
    at e (app.js:74)
    at e (app.js:74)
    at e (app.js:74)
    at e (app.js:74)
    at e (app.js:74)
    at e (app.js:74)
    at app.js:74
    at <anonymous> 

Original error stack:
Error: failure to send updateUninstallPage messaage
    at t.e (https://mailfoogae.appspot.com/build/app.js:197:26356)
    at new t (https://mailfoogae.appspot.com/build/app.js:197:25862)
    at e (https://mailfoogae.appspot.com/build/app.js:197:26736)
    at e (https://mailfoogae.appspot.com/build/app.js:74:18610)
    at e (https://mailfoogae.appspot.com/build/app.js:74:18203)
    at e (https://mailfoogae.appspot.com/build/app.js:74:20611)
    at e (https://mailfoogae.appspot.com/build/app.js:74:17050)
    at e (https://mailfoogae.appspot.com/build/app.js:74:18858)
    at e (https://mailfoogae.appspot.com/build/app.js:74:18203)
    at e (https://mailfoogae.appspot.com/build/app.js:74:20611)
    at e (https://mailfoogae.appspot.com/build/app.js:74:17050)
    at https://mailfoogae.appspot.com/build/app.js:74:19370
    at <anonymous> 

Error logged from:
    at i (https://www.inboxsdk.com/build/platform-implementation.js:80:26920)
    at u (https://www.inboxsdk.com/build/platform-implementation.js:101:7631)
    at e.value (https://www.inboxsdk.com/build/platform-implementation.js:101:11575)
    at Object.error (https://www.inboxsdk.com/build/platform-implementation.js:101:12261)
    at https://mailfoogae.appspot.com/build/app.js:94:15782
    at <anonymous> 

Error details: Object {message: undefined, email: "alexandre@getstation.com", href: "https://mail.google.com/mail/u/0/#inbox", details: Object}details: Objectemail: "alexandre@getstation.com"href: "https://mail.google.com/mail/u/0/#inbox"message: undefined__proto__: Object 

Extension App Ids: [
  {
    "appId": "sdk_streak_21e9788951",
    "version": "6.3112",
    "causedBy": true
  }
] 
Sent by App: true 
Session Id: 1501692922605-0.5971194064432392 
Extension Id: null 
InboxSDK Loader Version: 0.7.24-1484787998857-c248fbb55be579d3 
InboxSDK Implementation Version: 0.7.24-1501629418090-9523e7c700f126e2
```

#### Yesware
Nothing happens when loaded.
This does not like using content_scripts => how does htis event work??


#### Clearbit
Requires `allowPopups`

#### Gmelius
Requires `allowPopups`

### Gooogle Drive Offline

Use `web_accessible_resources` to load a file in `docs.google.com/*` and `drive.google.com/*`.

It also relies on `content_capabilities` to let app comunicate with a background script.

### Notets
#### Use isoalated script injection
- check `ScriptInjection::InjectJs` in `extensions/renderer/script_injection.cc`
- use `inIsolatedWorld` related method from [`blink::webFrame`](https://chromium.googlesource.com/chromium/blink-public/+/master/web/WebLocalFrame.h)
