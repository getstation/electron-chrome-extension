const constants = {};

// chrome.tabs
constants.TABS_ONCREATED = 'CHROME_TABS_ONCREATED';
constants.TABS_ONREMOVED = 'CHROME_TABS_ONREMOVED';

// chrome.webNavigation
constants.WEBNAVIGATION_ONBEFORENAVIGATE = 'CHROME_WEBNAVIGATION_ONBEFORENAVIGATE';
constants.WEBNAVIGATION_ONCOMPLETED = 'CHROME_WEBNAVIGATION_ONCOMPLETED';

// chrome.runtime.connect
constants.PORT_DISCONNECT_ = 'CHROME_PORT_DISCONNECT_';
constants.RUNTIME_ONCONNECT_ = 'CHROME_RUNTIME_ONCONNECT_';
constants.RUNTIME_CONNECT = 'CHROME_RUNTIME_CONNECT';
constants.PORT_POSTMESSAGE_ = 'CHROME_PORT_POSTMESSAGE_';

// chrome.i18n.getMessage
constants.I18N_MANIFEST = 'CHROME_I18N_MANIFEST';

// chrome.runtime.sendMessage
constants.RUNTIME_SENDMESSAGE = 'CHROME_RUNTIME_SENDMESSAGE';
constants.RUNTIME_ONMESSAGE_ = 'CHROME_RUNTIME_ONMESSAGE_';

// chrome.runtime.onMessage
constants.RUNTIME_ONMESSAGE_RESULT_ = 'CHROME_RUNTIME_ONMESSAGE_RESULT_';
constants.RUNTIME_SENDMESSAGE_RESULT_ = 'CHROME_RUNTIME_SENDMESSAGE_RESULT_';

// chrome.runtime.onMessage
constants.RUNTIME_GET_MANIFEST = 'RUNTIME_GET_MANIFEST';

// chrome.tabs.executeScript
constants.TABS_SEND_MESSAGE = 'CHROME_TABS_SEND_MESSAGE';
constants.TABS_SEND_MESSAGE_RESULT_ = 'CHROME_TABS_SEND_MESSAGE_RESULT_';

// chrome.tabs.executeScript
constants.TABS_EXECUTESCRIPT = 'CHROME_TABS_EXECUTESCRIPT';
constants.TABS_EXECUTESCRIPT_RESULT_ = 'CHROME_TABS_EXECUTESCRIPT_RESULT_';

// chrome.webRequest
constants.WEBREQUEST_ASK_CLEAR_CACHE = 'WEBREQUEST_ASK_CLEAR_CACHE';
constants.WEBREQUEST_CLEAR_CACHE = 'WEBREQUEST_CLEAR_CACHE';

constants.EXTENSION_PROTOCOL = 'chrome-extension';

// to differentiate from electron implementation of chrome extensions
// we change the name of ipc  channel used
const overriddenConstants = {};
const PREFIX = 'ELECTRON_CHROME_EXTENSION';
Object.keys(constants).forEach(constantKey => {
  overriddenConstants[constantKey] = `${PREFIX}_${constants[constantKey]}`;
})

// same. we change the extension protocol used
overriddenConstants.EXTENSION_PROTOCOL = 'chrome-extension';
overriddenConstants.DEFAULT_EXTENSION_PROTOCOL = 'chrome-extension';

// module.exports = constants;
module.exports = overriddenConstants;
