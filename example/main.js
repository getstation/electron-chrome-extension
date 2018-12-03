const { app, BrowserWindow } = require('electron'); term
const { join } = require('path');
const { format } = require('url');

const { addExtension } = require('../index');

let mainWindow;

// require('electron-local-crash-reporter').start();

function createWindow() {
  mainWindow = new BrowserWindow({ width: 800, height: 600 });

  mainWindow.loadURL(format({
    pathname: join(__dirname, 'app.html'),
    protocol: 'file:',
    slashes: true,
  }));

  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', () => mainWindow = null)
}

app.on('ready', () => {
  createWindow();

  require('electron-process-manager').openProcessManager();
  addExtension(join(__dirname, './extensions/mixmax'))
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
});

app.on('session-created', session => {
  const userAgent = session.getUserAgent();
  session.setUserAgent(userAgent.replace(/Electron\/\S*\s/, ''))

  // const filter = {
  //   urls: [
  //     'https://*.google.com/mail/u/0/*', 'chrome-extension://dheionainndbbpoacpnopgmnihkcmnkl'
  //   ],
  // }
  // session.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
  //   console.log(details);
  //   callback({ cancel: false, requestHeaders: details.requestHeaders });
  // })

  // Sample example of how disable cors
  // const filter = {
  //   urls: ['https://compose.mixmax.com/api/views/*']
  // }

  // session.webRequest.onHeadersReceived(filter, (details, callback) => {
  //   if (details.resourceType === 'xhr') {
  //     const { protocol, hostname, pathname } = new URL(details.url)

  //     const responseHeaders = details.responseHeaders
  //     const requestHeaders = details.headers
  //     const updatedHeaders = {
  //       ...responseHeaders,
  //       'access-control-allow-credentials': responseHeaders['access-control-allow-credentials'] || ['true'],
  //       'access-control-allow-headers': [].concat(
  //         responseHeaders['access-control-allow-headers'],
  //         requestHeaders['Access-Control-Request-Headers'],
  //         Object.keys(requestHeaders).filter((k) => k.startsWith('X-'))
  //       ),
  //       'Access-Control-Allow-Origin': [
  //         `chrome-extension://ocpljaamllnldhepankaeljmeeeghnid`
  //       ]
  //     }
  //     console.log("updatedHeaders l1: ", details);
  //     console.log("updatedHeaders l2: ", updatedHeaders);
  //     return callback({ cancel: false, responseHeaders: updatedHeaders })
  //   }
  // })

  // session.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
  //   if (details.resourceType === 'xhr') {
  //     const a = {
  //       ...details.requestHeaders,
  //       'Origin': ['null']
  //     }
  //     callback({ cancel: false, requestHeaders: a })
  //   }
  // })
});
