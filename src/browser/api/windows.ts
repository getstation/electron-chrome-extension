import { BrowserWindow } from 'electron';
import { CreateData, CxWindowsApi, GetInfo, UpdateInfo } from '../../common/types/api-windows';
import { CxApiChannels } from '../../common/types/api';
const { RpcIpcManager } = require('electron-simple-rpc');
const capitalize = require('capitalize');

class ChromeWindowsAPIHandler {
  protected scope: string;
  protected RpcIpcManager: any;

  constructor(extensionId: string) {
    const library = {};
    [CxWindowsApi.GetCurrent].forEach(channel => {
      const handler = this[`handle${capitalize(channel)}`];
      library[channel] = (...args: any[]) => {
        return handler.apply(this, args);
      };
    });

    this.scope = `${CxApiChannels.Windows}-${extensionId}`;

    this.RpcIpcManager = new RpcIpcManager(library, this.scope);
  }

  handleGet(windowId: number, _getInfo: GetInfo) {
    const win = BrowserWindow.getAllWindows().find((window) => window.webContents.id === windowId);
    return {
      id: win && win.webContents.id,
      focused: win && win.isFocused(),
      incognito: false,
      alwaysOnTop: false,
    };
  }

  handleGetCurrent(_getInfo: GetInfo) {
    const win = BrowserWindow.getFocusedWindow();
    return {
      id: win && win.webContents.id,
      focused: win && win.isFocused(),
      incognito: false,
      alwaysOnTop: false,
    };
  }

  handleGetLastFocused(_getInfo: GetInfo) {
    const win = BrowserWindow.getFocusedWindow();
    return {
      id: win && win.webContents.id,
      focused: win && win.isFocused(),
      incognito: false,
      alwaysOnTop: false,
    };
  }

  handleGetAll(_getInfo: GetInfo) {
    const win = BrowserWindow.getAllWindows();
    return win.map((window) => ({
      id: window.webContents.id,
      focused: window.isFocused(),
      incognito: false,
      alwaysOnTop: false,
    }));
  }

  handleCreate(createData: CreateData) {
    const win = new BrowserWindow({
      width: createData.width || 800,
      height: createData.height || 600,
      x: createData.left,
      y: createData.top,
    });

    if (createData.url) win.loadURL(createData.url);

    return {
      id: win.webContents.id,
      focused: win.isFocused(),
      incognito: false,
      alwaysOnTop: false,
    };
  }

  handleUpdate(windowId: number, updateInfo: UpdateInfo) {
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

    return {
      id: win && win.webContents.id,
      focused: win && win.isFocused(),
      incognito: false,
      alwaysOnTop: false,
    };
  }

  handleRemove(windowId: number) {
    const win = BrowserWindow.getAllWindows().find((window) => window.webContents.id === windowId);
    win && win.close();

    return; // TODO: What should I return?
  }

  release () {
    this.RpcIpcManager.release();
  }
}

module.exports = ChromeWindowsAPIHandler;
