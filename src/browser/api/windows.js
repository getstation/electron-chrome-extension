const { BrowserWindow, ipcMain } = require('electron');
const constants = require('../../common/constants');

class ChromeWindowsAPIHandler {
  constructor(extensionId) {
    this._handleWindowsGet = this._handleWindowsGet.bind(this);
    ipcMain.on(constants.WINDOWS_GET, this._handleWindowsGet);

    this._handleWindowsGetCurrent = this._handleWindowsGetCurrent.bind(this);
    ipcMain.on(constants.WINDOWS_GET_CURRENT, this._handleWindowsGetCurrent);

    this._handleWindowsGetLastFocused = this._handleWindowsGetLastFocused.bind(this);
    ipcMain.on(constants.WINDOWS_GET_LAST_FOCUSED, this._handleWindowsGetLastFocused);

    this._handleWindowsGetAll = this._handleWindowsGetAll.bind(this);
    ipcMain.on(constants.WINDOWS_GET_ALL, this._handleWindowsGetAll);

    this._handleWindowsCreate = this._handleWindowsCreate.bind(this);
    ipcMain.on(constants.WINDOWS_CREATE, this._handleWindowsCreate);

    this._handleWindowsUpdate = this._handleWindowsUpdate.bind(this);
    ipcMain.on(constants.WINDOWS_UPDATE, this._handleWindowsUpdate);

    this._handleWindowsRemove = this._handleWindowsRemove.bind(this);
    ipcMain.on(constants.WINDOWS_REMOVE, this._handleWindowsRemove);
  };

  _handleWindowsGet(e, windowId, _getInfo) {
    const win = BrowserWindow.getAllWindows().find((window) => window.webContents.id === windowId);
    const payload = {
      id: win.webContents.id,
      focused: win.isFocused(),
      incognito: false,
      alwaysOnTop: false,
    };

    e.sender.send(constants.WINDOWS_GET_RESULT, payload);
  }

  _handleWindowsGetCurrent(e, _getInfo) {
    const win = BrowserWindow.getAllWindows()[0];
    const payload = {
      id: win.webContents.id,
      focused: true,
      incognito: false,
      alwaysOnTop: false,
    };

    e.sender.send(constants.WINDOWS_GET_CURRENT_RESULT, payload);
  }

  _handleWindowsGetLastFocused(e, _getInfo) {
    const win = BrowserWindow.getAllWindows()[0];
    const payload = {
      id: win.webContents.id,
      focused: true,
      incognito: false,
      alwaysOnTop: false,
    };

    e.sender.send(constants.WINDOWS_GET_LAST_FOCUSED_RESULT, payload);
  }

  _handleWindowsGetAll(e, _getInfo) {
    const win = BrowserWindow.getAllWindows();
    const payload = win.map((window) => ({
      id: window.webContents.id,
      focused: window.isFocused(),
      incognito: false,
      alwaysOnTop: false,
    }));

    e.sender.send(constants.WINDOWS_GET_ALL_RESULT, payload);
  }

  _handleWindowsCreate(e, createData) {
    const win = new BrowserWindow({
      width: createData.width | 800,
      height: createData.height | 600,
      x: createData.left,
      y: createData.top,
    });

    if (createData.url) win.loadURL(createData.url);

    const payload = {
      id: win.webContents.id,
      focused: true,
      incognito: false,
      alwaysOnTop: false,
    };

    e.sender.send(constants.WINDOWS_CREATE_RESULT, payload);
  }

  _handleWindowsUpdate(e, windowId, updateInfo) {
    const win = BrowserWindow.getAllWindows().find((window) => window.webContents.id === windowId);

    if (updateInfo.width || updateInfo.height) win.setSize(updateInfo.width, updateInfo.height);
    if (updateInfo.left || updateInfo.top) win.setPosition(updateInfo.left, updateInfo.top);

    if (updateInfo.focused) win.focus();

    const payload = {
      id: win.webContents.id,
      focused: win.isFocused(),
      incognito: false,
      alwaysOnTop: false,
    };

    e.sender.send(constants.WINDOWS_UPDATE_RESULT, payload);
  }

  _handleWindowsRemove(e, windowId) {
    const win = BrowserWindow.getAllWindows().find((window) => window.webContents.id === windowId);
    win.close();

    e.sender.send(constants.WINDOWS_REMOVE_RESULT);
  }

  release () {}
}

module.exports = ChromeWindowsAPIHandler;
