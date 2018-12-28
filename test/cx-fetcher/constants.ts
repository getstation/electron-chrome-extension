import CxInterpreterProvider from '../../src/browser/cx-fetcher/interpreter-provider';

const path = require('path');

export const TEST_PATH_ASSETS = path.join(__dirname, '..', 'assets');
export const TEST_PATH_ARCHIVE = path.join(TEST_PATH_ASSETS, 'archives', 'dheionainndbbpoacpnopgmnihkcmnkl.crx');
export const TEST_PATH_EXTENSIONS = path.join(TEST_PATH_ASSETS, 'extensions');
export const TEST_PATH_INSTALLED = path.join(TEST_PATH_ASSETS, 'installed');

export const EXAMPLE_EXTENSION_ID = 'dheionainndbbpoacpnopgmnihkcmnkl';
export const EXAMPLE_EXTENSION_VERSION = {
  number: '8.4.2',
  parsed: [8, 4, 2],
};
export const EXAMPLE_ARCHIVE_MANIFEST = {
  update_url: 'https://clients2.google.com/service/update2/crx',

  name: '__MSG_extName__',
  short_name: 'Gmelius',
  author: 'Gmelius Ltd',
  description: '__MSG_extDescription__',
  default_locale: 'en',
  version: '8.4.2',
  manifest_version: 2,
  homepage_url: 'https://gmelius.com',
  permissions: [
    'activeTab',
    'storage',
    'webRequest',
    'webRequestBlocking',
    'https://*.googleusercontent.com/*',
  ],
  optional_permissions: ['https://gml.email/*'],
  background: {
    scripts: [
      'background.bundle.js',
    ],
    persistent: true,
  },
  content_scripts: [
    {
      js: [
        'loader.bundle.js',
      ],
      matches: [
        'https://mail.google.com/*',
        'https://inbox.google.com/*',
      ],
      exclude_matches: [
        '*://mail.google.com/*/?mui=ca',
        '*://mail.google.com/tasks/*',
      ],
      run_at: 'document_end',
    },
    {
      all_frames: true,
      js: [
        'print.bundle.js',
      ],
      matches: ['https://mail.google.com/*&view=pt*'],
      run_at: 'document_start',
    },
  ],
  icons: {
    16: 'icons/icon16.png',
    48: 'icons/icon48.png',
    128: 'icons/icon128.png',
  },
  browser_action: {
    default_icon: 'icons/icon32.png',
    default_title: 'Gmelius Dashboard',
    default_popup: 'html/dashboard.html',
  },
  web_accessible_resources: [
    'icons/*',
    'html/*',
  ],
  omnibox: { keyword: 'gml' },
  content_security_policy: 'script-src \'self\' https://gmelius.io https://inboxsdk.com https://cdn.firebase.com  https://*.firebaseio.com; object-src \'self\'; worker-src \'self\' https://gmelius.io',
  incognito: 'split',
  options_page: 'html/dashboard.html',
};

export const FAKE_EXTENSION_ID = 'axyz';
export const FAKE_EXTENSION_UPDATE_URL = 'https://unknown.destination.lost';
export const FAKE_EXTENSION_PATH = 'test/to/extension/files';

export const FAKE_UPDATE_XML = `
<?xml version='1.0' encoding='UTF-8'?>
<gupdate xmlns='http://www.google.com/update2/response' protocol='2.0'>
  <app appid='${FAKE_EXTENSION_ID}'>
    <updatecheck codebase='http://myhost.com/mytestextension/mte_v2.crx' version='1.2.0' />
  </app>
</gupdate>
`;

export const FAKE_DL_DESCRIPTOR = {
  id: FAKE_EXTENSION_ID,
  location: {
    path: TEST_PATH_ARCHIVE,
  },
};

export const FAKE_CX_INFOS = {
  id: FAKE_EXTENSION_ID,
  version: {
    number: '1.0.0',
    parsed: [1, 0, 0],
  },
  updateUrl: FAKE_EXTENSION_UPDATE_URL,
  location: {
    path: FAKE_EXTENSION_PATH,
  },
};

export const FAKE_INSTALL_DESCRIPTOR = {
  id: FAKE_EXTENSION_ID,
  location: {
    path: FAKE_EXTENSION_PATH,
  },
  manifest: {
    version: '0.0.1',
    update_url: FAKE_EXTENSION_UPDATE_URL,
  },
};

export const FAKE_UPDATE_DESCRIPTOR = {
  xml: FAKE_UPDATE_XML,
};

export const FAKE_VERSION_ARRAY = [
  CxInterpreterProvider.parseVersion('1.0.0'),
  CxInterpreterProvider.parseVersion('2.0'),
  CxInterpreterProvider.parseVersion('1.0.3.1'),
  CxInterpreterProvider.parseVersion('0.9.9.0'),
];

export const FAKE_VERSION_INVALID_ARRAY = [
  CxInterpreterProvider.parseVersion('azz'),
  CxInterpreterProvider.parseVersion('buioo'),
  CxInterpreterProvider.parseVersion('boom'),
];
