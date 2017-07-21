### Revive basic support
-[x] implement API to load extension
-[x] rename all IPC call
-[ ] ~re-implement preference manager~ => not needed
-[ ] reimplement the proptocol buffer handler

### Add corrections
-[ ] remove peristence
-[ ] content_scrips support: support CSS
-[ ] content_scrips support: fix matches rules implementation	
-[ ] content_scrips support: run JS scripts in same context
-[ ] Fix insecure content error for resources load via chrome-extension:
-[ ] content_scrips support: fix chrome.storage to access extension data independently of host page's doamain
-[ ] Fix page's URL used to test against content_scripts[].matches
-[ ] Add support for chrome.runtime.getManifest()
