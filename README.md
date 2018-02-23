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

### Extenions supported

See [issues](https://github.com/getstation/electron-chrome-extension/issues?utf8=%E2%9C%93&q=label%3A%22Extension+Support%22+) to get lists and details.

### Notets
#### Use isoalated script injection
- check `ScriptInjection::InjectJs` in `extensions/renderer/script_injection.cc`
- use `inIsolatedWorld` related method from [`blink::webFrame`](https://chromium.googlesource.com/chromium/blink-public/+/master/web/WebLocalFrame.h)
