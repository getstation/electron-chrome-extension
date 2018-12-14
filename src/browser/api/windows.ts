import { BrowserWindow, ipcMain } from 'electron';
import { CreateData, GetInfo, UpdateInfo } from '../../common/types/api-windows';
const constants = require('../../common/constants');

class ChromeWindowsAPIHandler {
  constructor() {
    this.handleWindowsGet = this.handleWindowsGet.bind(this);
    ipcMain.on(constants.WINDOWS_GET, this.handleWindowsGet);

    this.handleWindowsGetCurrent = this.handleWindowsGetCurrent.bind(this);
    ipcMain.on(constants.WINDOWS_GET_CURRENT, this.handleWindowsGetCurrent);

    this.handleWindowsGetLastFocused = this.handleWindowsGetLastFocused.bind(this);
    ipcMain.on(constants.WINDOWS_GET_LAST_FOCUSED, this.handleWindowsGetLastFocused);

    this.handleWindowsGetAll = this.handleWindowsGetAll.bind(this);
    ipcMain.on(constants.WINDOWS_GET_ALL, this.handleWindowsGetAll);

    this.handleWindowsCreate = this.handleWindowsCreate.bind(this);
    ipcMain.on(constants.WINDOWS_CREATE, this.handleWindowsCreate);

    this.handleWindowsUpdate = this.handleWindowsUpdate.bind(this);
    ipcMain.on(constants.WINDOWS_UPDATE, this.handleWindowsUpdate);

    this.handleWindowsRemove = this.handleWindowsRemove.bind(this);
    ipcMain.on(constants.WINDOWS_REMOVE, this.handleWindowsRemove);
  }

  handleWindowsGet(e: Electron.Event, windowId: number, _getInfo: GetInfo) {
    const win = BrowserWindow.getAllWindows().find((window) => window.webContents.id === windowId);
    const payload = {
      id: win && win.webContents.id,
      focused: win && win.isFocused(),
      incognito: false,
      alwaysOnTop: false,
    };

    e.sender.send(constants.WINDOWS_GET_RESULT, payload);
  }

  handleWindowsGetCurrent(e: Electron.Event, _getInfo: GetInfo) {
    const win = BrowserWindow.getAllWindows()[0];
    const payload = {
      id: win.webContents.id,
      focused: true,
      incognito: false,
      alwaysOnTop: false,
    };

    e.sender.send(constants.WINDOWS_GET_CURRENT_RESULT, payload);
  }

  handleWindowsGetLastFocused(e: Electron.Event, _getInfo: GetInfo) {
    const win = BrowserWindow.getAllWindows()[0];
    const payload = {
      id: win.webContents.id,
      focused: true,
      incognito: false,
      alwaysOnTop: false,
    };

    e.sender.send(constants.WINDOWS_GET_LAST_FOCUSED_RESULT, payload);
  }

  handleWindowsGetAll(e: Electron.Event, _getInfo: GetInfo) {
    const win = BrowserWindow.getAllWindows();
    const payload = win.map((window) => ({
      id: window.webContents.id,
      focused: window.isFocused(),
      incognito: false,
      alwaysOnTop: false,
    }));

    e.sender.send(constants.WINDOWS_GET_ALL_RESULT, payload);
  }

  handleWindowsCreate(e: Electron.Event, createData: CreateData) {
    const win = new BrowserWindow({
      width: createData.width || 800,
      height: createData.height || 600,
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

  handleWindowsUpdate(e: Electron.Event, windowId: number, updateInfo: UpdateInfo) {
    const win = BrowserWindow.getAllWindows().find((window) => window.webContents.id === windowId);

    if (win && updateInfo) {
      if (updateInfo.width || updateInfo.height) {
        const [width, height] = win.getSize();
        win.setSize(updateInfo.width || width, updateInfo.height || height);
      }

      if (updateInfo.left || updateInfo.top) {
        const [left, top] = win.getPosition();
        win.setPosition(updateInfo.left || left, updateInfo.top || top);
      }
    }

    if (updateInfo.focused) win && win.focus();

    const payload = {
      id: win && win.webContents.id,
      focused: win && win.isFocused(),
      incognito: false,
      alwaysOnTop: false,
    };

    e.sender.send(constants.WINDOWS_UPDATE_RESULT, payload);
  }

  handleWindowsRemove(e: Electron.Event, windowId: number) {
    const win = BrowserWindow.getAllWindows().find((window) => window.webContents.id === windowId);
    win && win.close();

    e.sender.send(constants.WINDOWS_REMOVE_RESULT);
  }

  release () {}
}

module.exports = ChromeWindowsAPIHandler;
