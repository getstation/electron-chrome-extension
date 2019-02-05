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
  // Grammarly: kbfnbcaeplbcioakkpcpgfkobkghlhen
  // Dashlane: fdjamakpfbbddfjaooikfcpapjohcfmg
  // Lastpass: hdokiejnpimakedhajhdlcegeplioahd
  // React Developers Tools: fmkadmapgofadopljbjfkapdkoienihi
  // Redux DevTools: lmhkpmbekcpmknklioeibfkpmmfibljd

  const onUpdate = (update) => console.log('Extension updated: ', update);

  await ECx.setConfiguration({
    onUpdate,
    fetcher: { autoUpdate: true, autoUpdateInterval: 1000000 },
  });

  await ECx.load('ocpljaamllnldhepankaeljmeeeghnid');
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
});
