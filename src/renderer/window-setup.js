/* eslint-disable no-param-reassign */

// This file overrides this one from electron:
// https://raw.githubusercontent.com/electron/electron/65fe703dc2cb3c8850d6373ddf93520a8adcdbd4/lib/renderer/window-setup.js
//
// The main difference is that here we allow ourselves to take precedence
// over `nativeWindowOpen` for specific URLs
const { defineProperty } = Object;

// Helper function to resolve relative url.
const a = window.top.document.createElement('a');
const resolveURL = url => {
  a.href = url;
  return a.href;
};

// Use this method to ensure values expected as strings in the main process
// are convertible to strings in the renderer process. This ensures exceptions
// converting values to strings are thrown in this process.
const toString = value => value != null ? `${value}` : value;

const windowProxies = {};

const getOrCreateProxy = (ipcRenderer, guestId) => {
  let proxy = windowProxies[guestId];
  if (proxy == null) {
    proxy = new BrowserWindowProxy(ipcRenderer, guestId);
    windowProxies[guestId] = proxy;
  }
  return proxy;
};

const removeProxy = (guestId) => {
  delete windowProxies[guestId];
};

function BrowserWindowProxy(ipcRenderer, guestId) {
  this.closed = false;

  defineProperty(this, 'location', {
    get() {
      const url = ipcRenderer.sendSync('ELECTRON_GUEST_WINDOW_MANAGER_WEB_CONTENTS_METHOD_SYNC', guestId, 'getURL');
      return new URL(url);
    },
    set(url) {
      url = resolveURL(url);
      return ipcRenderer.sendSync('ELECTRON_GUEST_WINDOW_MANAGER_WEB_CONTENTS_METHOD_SYNC', guestId, 'loadURL', url);
    }
  });

  ipcRenderer.once(`ELECTRON_GUEST_WINDOW_MANAGER_WINDOW_CLOSED_${guestId}`, () => {
    removeProxy(guestId);
    this.closed = true;
  });

  this.close = () => {
    ipcRenderer.send('ELECTRON_GUEST_WINDOW_MANAGER_WINDOW_CLOSE', guestId);
  };

  this.focus = () => {
    ipcRenderer.send('ELECTRON_GUEST_WINDOW_MANAGER_WINDOW_METHOD', guestId, 'focus');
  };

  this.blur = () => {
    ipcRenderer.send('ELECTRON_GUEST_WINDOW_MANAGER_WINDOW_METHOD', guestId, 'blur');
  };

  this.print = () => {
    ipcRenderer.send('ELECTRON_GUEST_WINDOW_MANAGER_WEB_CONTENTS_METHOD', guestId, 'print');
  };

  this.postMessage = (message, targetOrigin) => {
    ipcRenderer.send('ELECTRON_GUEST_WINDOW_MANAGER_WINDOW_POSTMESSAGE', guestId, message, null, null);
  };

  this.eval = (...args) => {
    ipcRenderer.send('ELECTRON_GUEST_WINDOW_MANAGER_WEB_CONTENTS_METHOD', guestId, 'executeJavaScript', ...args);
  };
}

function useNativeWindowOpen(usesNativeWindowOpen, nativeWindowOverrideList, url) {
  if (!usesNativeWindowOpen) return false;
  if (!Array.isArray(nativeWindowOverrideList)) return nativeWindowOverrideList;
  if (!url) return usesNativeWindowOpen;
  return !nativeWindowOverrideList.some(elUrl => url.includes(elUrl));
}

module.exports = (win, ipcRenderer, guestInstanceId, openerId, hiddenPage, usesNativeWindowOpen, nativeWindowOverrideList) => {
  const originalWindowOpen = win.open;

  // Make the browser window or guest view emit "new-window" event.
  win.open = (url, frameName, features) => {
    if (url != null && url !== '') {
      url = resolveURL(url);
    }
    // console.log('url', url);
    if (useNativeWindowOpen(usesNativeWindowOpen, nativeWindowOverrideList, url)) {
      // console.log('using native window.open');
      return originalWindowOpen.apply(win, [url, frameName, features]);
    }
    // console.log('using overriden window.open');
    const guestId = ipcRenderer.sendSync('ELECTRON_GUEST_WINDOW_MANAGER_WINDOW_OPEN', url, toString(frameName), toString(features));
    if (guestId != null) {
      return getOrCreateProxy(ipcRenderer, guestId);
    }
    return null;
  };

  if (openerId != null && win.opener == null) {
    win.opener = getOrCreateProxy(ipcRenderer, openerId);
  }

  // todo warn: diff with electron
  ipcRenderer.removeAllListeners('ELECTRON_GUEST_WINDOW_POSTMESSAGE');
  ipcRenderer.on('ELECTRON_GUEST_WINDOW_POSTMESSAGE', (event, sourceId, message, sourceOrigin) => {
    event = new MessageEvent('message', { data: message, origin: sourceOrigin });
    event.source = getOrCreateProxy(ipcRenderer, sourceId);

    // This crappy code block fix an ugly behaviour from Mixmax who open
    // a window from an iframe and catch message in the extension content
    // script. References are lost between contexts.
    // We manually trigger the intented effect.
    if (event.data && event.data.method === 'loginFinished') {
      win.location.reload();
    }

    win.dispatchEvent(event);
  });
};
