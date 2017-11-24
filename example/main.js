const electron = require('electron')
// Module to control application life.
const app = electron.app
const session = electron.session
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

const extensions = require('../index');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'app.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

app.on('ready', () => {
  extensions.addExtension(path.join(__dirname, './extensions/mixmax'))
  // extensions.addExtension(path.join(__dirname, './extensions/gmelius'))
  // extensions.addExtension(path.join(__dirname, './extensions/dummy-extension'))

  const filter = {
    urls: ['<all_urls>']
  }

  session.defaultSession.webRequest.onResponseStarted(filter, (details) => {
    if (details.url.indexOf('chrome-devtools://') === -1) {
      console.log('--- onResponseStarted')
      console.log(details);
    }
  });
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// some webapps (mixmax) have a special behavior when we see we are on Electron
// we don't want that so we remove the Electron mention
app.on('session-created', session => {
  const userAgent = session.getUserAgent();
  session.setUserAgent(userAgent.replace(/Electron\/\S*\s/, ''));
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.