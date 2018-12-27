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
  const gmelius = await cxFetcher.fetch('dheionainndbbpoacpnopgmnihkcmnkl');
  const mixmax = await cxFetcher.fetch('ocpljaamllnldhepankaeljmeeeghnid');
  addExtension(gmelius.id, gmelius.location.path);
  addExtension(mixmax.id, mixmax.location.path);
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
