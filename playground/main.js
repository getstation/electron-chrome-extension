const { app, BrowserWindow } = require('electron');
const { join } = require('path');
const { format } = require('url');
const { mkdirSync, existsSync } = require('fs');

// for convenience, we'll store electron userData
// in the nearby .electron-user-data directory
if (!app.isPackaged) {
  const userDataPath = join(__dirname, '.electron-user-data');
  if (!existsSync(userDataPath)) mkdirSync(userDataPath);
  app.setPath('userData', userDataPath);
}

const ECx = require('../lib/src/browser/').default;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({ width: 800, height: 600 });

  mainWindow.loadURL(format({
    pathname: join(__dirname, 'app.html'),
    protocol: 'file:',
    slashes: true,
  }));

  mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', async () => {
  createWindow();

  require('electron-process-manager').openProcessManager();

  // Mixmax: ocpljaamllnldhepankaeljmeeeghnid
  // Gmelius: dheionainndbbpoacpnopgmnihkcmnkl
  // Mailtracker: pgbdljpkijehgoacbjpolaomhkoffhnl
  // Boomerang: mdanidgdpmkimeiiojknlnekblgmpdll
  // Clearbit Connect: pmnhcgfcafcnkbengdcanjablaabjplo
  // 1Password X: aeblfdkhhhdcdjpifhhbdiojplfjncoa
  // Dashlane: fdjamakpfbbddfjaooikfcpapjohcfmg
  // Lastpass: hdokiejnpimakedhajhdlcegeplioahd

  await ECx.load('ocpljaamllnldhepankaeljmeeeghnid');

  const onUpdate = (update) => console.log('Extension updated: ', update);

  ECx.configuration = { onUpdate }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('session-created', session => {
  const userAgent = session.getUserAgent();
  session.setUserAgent(userAgent.replace(/Electron\/\S*\s/, ''));

  // const filter = {
  //   urls: ['https://*.mixmax.com/api/*', 'https://compose.mixmax.com/styles.css']
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
  //     // console.log("updatedHeaders l1: ", details);
  //     // console.log("updatedHeaders l2: ", updatedHeaders);
  //     return callback({ cancel: false, responseHeaders: updatedHeaders })
  //   }
  // })

  // session.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
  //   console.log(details);
  //   if (details.resourceType === 'xhr') {
  //     const a = {
  //       ...details.requestHeaders,
  //       'Origin': ['null']
  //     }
  //     callback({ cancel: false, requestHeaders: a });
  //   }
  // })
});
