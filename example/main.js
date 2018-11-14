const { app, BrowserWindow } = require('electron');
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

  // require('electron-process-manager').openProcessManager();

  addExtension(join(__dirname, './extensions/gmelius'))
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
