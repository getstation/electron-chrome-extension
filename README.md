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
- [ ] implement `chrome.storage.onChanged.addListener`
- [ ] support manifest `permissions` hosts (requires https://github.com/electron/electron/issues/10180)

### Test extensions
- [x] mailtracker
- [ ] MixMax
- [ ] grammarly 
- [x] Rapportive 

### Extensions integration notes

#### MixMax
Mixmax is using `chrome.storage.onChanged.addListener`, but looks like using a shim is enough.

Overide user-agent ti remove any mention of Electron: `session.setUserAgent(userAgent.replace(/Electron\/\S*\s/, ''))`

When loading Mixmax, I have the Mixmax login screen when loading gmail. I can load log on, but then Gmail keeps infinitely looping: load gmail, "Setting Up Mixmax", "Finishing up", reload and so on.. (see screencast).

#### Grammarly
No error in console. After few secsonds, a greyed Grammarly logo appears in the inputs.

#### Rapportive
Rapportive is loading external content from `https://rapportive.com/load/launchpad` that are whiltlisted in manifest's `permissions`.
However, we don't support `permssions`.
The dangerous trick is to disable `webSecurity`.

see https://github.com/electron/electron/issues/10180

