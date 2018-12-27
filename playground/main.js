const { app, BrowserWindow } = require('electron');
const { join } = require('path');
const { format } = require('url');

const { addExtension } = require('../lib/src/browser/chrome-extension.js');
const CxFetcher = require('../lib/src/browser/cx-fetcher/cx-fetcher.js');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({ width: 800, height: 600 });

  mainWindow.loadURL(format({
    pathname: join(__dirname, 'app.html'),
    protocol: 'file:',
    slashes: true,
  }));

  mainWindow.on('closed', () => mainWindow = null)
}

app.on('ready', async () => {
  createWindow();

  require('electron-process-manager').openProcessManager();

  const cxFetcher = new CxFetcher.default();
  
  await cxFetcher.scanInstalledExtensions();
  console.log('AVAILABLE : ', cxFetcher.availableCx());
  const gmelius = cxFetcher.getCx('dheionainndbbpoacpnopgmnihkcmnkl');
  addExtension(gmelius.id, gmelius.location.path);

  // Check for update
  const update = await cxFetcher.checkForUpdate(gmelius.id);
  console.log('CHECK UPDATE (gmelius) : ', update);

  // Try an update anyway
  const didUpdate = await cxFetcher.update(gmelius.id);
  console.log('DID UPDATE (gmelius) : ', didUpdate);

  // Auto Update loop
  const wasUpdated = await cxFetcher.autoUpdate();
  console.log('AUTO UPDATE (all) : ', wasUpdated);
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
});
