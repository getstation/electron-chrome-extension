// This file overrides this one from electron:
// https://raw.githubusercontent.com/electron/electron/65fe703dc2cb3c8850d6373ddf93520a8adcdbd4/lib/renderer/window-setup.js
//
// The main difference is that here we allow ourselves to take precedence
// over `nativeWindowOpen` for specific URLs
const { defineProperty } = Object;

// Helper function to resolve relative url.
const a = document.createElement('a');
const resolveURL = url => {
  a.href = url;
  return a.href;
};

// Use this method to ensure values expected as strings in the main process
// are convertible to strings in the renderer process. This ensures exceptions
// converting values to strings are thrown in this process.
const toString = value => value != null ? `${value}` : value;

const windowProxies = new Map();

const getOrCreateProxy = (ipcRenderer, guestId) => {
  if (windowProxies.has(guestId)) {
    return windowProxies.get(guestId);
  }

  const proxy = new BrowserWindowProxy(ipcRenderer, guestId);
  windowProxies.set(guestId, proxy);

  return proxy;
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
    windowProxies.delete(guestId);
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

module.exports = (win, ipcRenderer, guestInstanceId, openerId) => {
  Object.defineProperty(win.navigator, 'userAgent', {
    value: win.navigator.userAgent.replace(/Electron\/\S*\s/, ''),
    configurable: false,
    writable: false,
  });

  if (openerId != null && win.opener == null) {
    win.opener = getOrCreateProxy(ipcRenderer, openerId);
  }

  ipcRenderer.removeAllListeners('ELECTRON_GUEST_WINDOW_POSTMESSAGE');
  ipcRenderer.on('ELECTRON_GUEST_WINDOW_POSTMESSAGE', (event, sourceId, message, sourceOrigin) => {
    event = new MessageEvent('message', { data: message, origin: sourceOrigin });
    event.source = getOrCreateProxy(ipcRenderer, sourceId);

    // This next code block polyfills Mixmax event forwarding
    // between the opened window and the iframe's event listener.
    // Electron loses event references between the content-scripts
    // and the iframe.
    // We manually trigger the intented effect.
    if (event.data && event.data.method === 'loginFinished') {
      win.location.reload();
    }

    win.dispatchEvent(event);
  });
};
