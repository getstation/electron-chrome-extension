const { app, BrowserWindow } = require('electron');
const { join } = require('path');
const { format } = require('url');

const { addExtension } = require('../lib/src/browser/chrome-extension.js');
const CxFetcher = require('../lib/src/browser/cx-fetcher/fetcher.js').default;

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

  // Mixmax: ocpljaamllnldhepankaeljmeeeghnid
  // Gmelius: dheionainndbbpoacpnopgmnihkcmnkl
  // Mailtracker: pgbdljpkijehgoacbjpolaomhkoffhnl
  // Boomerang: mdanidgdpmkimeiiojknlnekblgmpdll
  // Clearbit Connect: pmnhcgfcafcnkbengdcanjablaabjplo
  // 1Password X: aeblfdkhhhdcdjpifhhbdiojplfjncoa
  // Dashlane: fdjamakpfbbddfjaooikfcpapjohcfmg
  // Lastpass: hdokiejnpimakedhajhdlcegeplioahd

  const cxFetcher = new CxFetcher();
  const { id, location: { path } } = await cxFetcher.fetch('ocpljaamllnldhepankaeljmeeeghnid');
  addExtension(id, path);
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
