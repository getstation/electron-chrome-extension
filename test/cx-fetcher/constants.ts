/* tslint:disable */
const path = require('path');

// Fake Extension Info
export const FAKE_EXTENSION_ID = 'axyz';
export const FAKE_EXTENSION_UPDATE_URL = 'https://unknown.destination.lost';
export const FAKE_EXTENSION_PATH = 'test/to/extension/files';

// Asset archive info
// @ts-ignore
export const EXTENSION_ID = 'dheionainndbbpoacpnopgmnihkcmnkl';
export const EXTENSION_VERSION = '8.4.2';

// Paths
export const TEST_ASSETS = path.join(__dirname, '..', 'assets');
export const TEST_ARCHIVE_PATH = path.join(TEST_ASSETS, 'archives', 'dheionainndbbpoacpnopgmnihkcmnkl.crx');
export const TEST_EXTENSION_FOLDER = path.join(TEST_ASSETS, 'extensions');
export const TEST_INSTALLED_FOLDER = path.join(TEST_ASSETS, 'installed');

// Fake content
export const FAKE_ARCHIVE_MANIFEST = {
"update_url": "https://clients2.google.com/service/update2/crx",

  "name": "__MSG_extName__",
  "short_name": "Gmelius",
  "author": "Gmelius Ltd",
  "description": "__MSG_extDescription__",
  "default_locale": "en",
  "version": "8.4.2",
  "manifest_version": 2,
  "homepage_url": "https://gmelius.com",
  "permissions": [
    "activeTab",
    "storage",
    "webRequest",
    "webRequestBlocking",
    "https://*.googleusercontent.com/*"
  ],
  "optional_permissions": [ "https://gml.email/*" ],
  "background": {
    "scripts": [
      "background.bundle.js"
    ],
    "persistent": true
  },
  "content_scripts": [{
      "js": [
        "loader.bundle.js"
        ],
      "matches": [
        "https://mail.google.com/*",
        "https://inbox.google.com/*"
        ],
      "exclude_matches": [
        "*://mail.google.com/*/?mui=ca",
        "*://mail.google.com/tasks/*"
        ],
      "run_at": "document_end"
    },{
      "all_frames": true,
      "js": [
        "print.bundle.js"
        ],
      "matches": [ "https://mail.google.com/*&view=pt*" ],
      "run_at": "document_start"
    }
  ],
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128":"icons/icon128.png"
  },
  "browser_action": {
    "default_icon": "icons/icon32.png",
    "default_title": "Gmelius Dashboard",
    "default_popup": "html/dashboard.html"
  },
  "web_accessible_resources": [
    "icons/*",
    "html/*"
  ],
  "omnibox": { "keyword" : "gml" },
  "content_security_policy": "script-src 'self' https://gmelius.io https://inboxsdk.com https://cdn.firebase.com  https://*.firebaseio.com; object-src 'self'; worker-src 'self' https://gmelius.io",
  "incognito": "split",
  "options_page": "html/dashboard.html"
};  

export const FAKE_UPDATE_XML = `
<?xml version='1.0' encoding='UTF-8'?>
<gupdate xmlns='http://www.google.com/update2/response' protocol='2.0'>
  <app appid='${FAKE_EXTENSION_ID}'>
    <updatecheck codebase='http://myhost.com/mytestextension/mte_v2.crx' version='1.2.0' />
  </app>
</gupdate>
`;

// Fake inter module data
export const FAKE_DL_DESCRIPTOR = {
  path: TEST_ARCHIVE_PATH,
};

export const FAKE_CX_INFOS = {
  version: '1.0.0',
  updateUrl: FAKE_EXTENSION_UPDATE_URL,
  path: FAKE_EXTENSION_PATH,
};

export const FAKE_INSTALL_DESCRIPTOR = {
  path: FAKE_EXTENSION_PATH,
  manifest: {
    version: '0.0.1',
    update_url: FAKE_EXTENSION_UPDATE_URL,
  },
};

export const FAKE_UPDATE_DESCRIPTOR = {
  xml: FAKE_UPDATE_XML,
};

export const FAKE_VERSION_ARRAY = ['1.0.0', '2.0', '1.0.3.1', '0.9.9.0'];
