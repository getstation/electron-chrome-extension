### Revive basic support
-[x] implement API to load extension
-[x] rename all IPC call
-[x] Replace preference manager
-[x] reimplement the proptocol buffer handler

### Add corrections
-[x] remove peristence
-[x] content_scrips support: support CSS
-[x] content_scrips support: fix matches rules implementation	
-[x] content_scrips support: run JS scripts in same context
-[x] Fix insecure content error for resources load via chrome-extension: (not needed if https://github.com/electron/electron/pull/9950/ gets merged)
-[x] content_scrips support: fix chrome.storage to access extension data independently of host page's doamain
-[x] Fix page's URL used to test against content_scripts[].matches
-[x] Add support for chrome.runtime.getManifest()

### Test extensions
-[ ] MixMax
-[x] mailtracker
-[ ] grammarly 
