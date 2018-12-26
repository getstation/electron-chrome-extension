import { BrowserWindow } from 'electron';
import {
  Window,
  CreateData,
  CxWindowsApi,
  GetInfo,
  UpdateInfo,
} from '../../common/apis/windows';
import { CxApiChannels, CxApiHandler } from '../../common/apis';
const { RpcIpcManager } = require('electron-simple-rpc');

class ChromeWindowsAPIHandler {
  protected rpcIpcManager: any;
  protected scope: string;
  protected extensionWebContents: Map<
    Electron.WebContents['id'],
    Electron.WebContents
  >;

  constructor(extensionId: string) {
    this.extensionWebContents = new Map();

    const rpcLibraries = Object
      .keys(CxWindowsApi)
      .reduce(
        (library, method) => {
          const handler = this[`handle${method}`];
          library[CxWindowsApi[method]] = (...args: any[]) => {
            return handler.apply(this, args);
          };
          return library;
        },
        {}
      );

    this.scope = `${CxApiHandler}-${CxApiChannels.Windows}-${extensionId}`;

    this.rpcIpcManager = new RpcIpcManager(rpcLibraries, this.scope);
  }

  handleGet(windowId: Window['id'], _getInfo: GetInfo) {
    const window = this.findBrowserWindow(windowId);

    if (window) {
      return {
        id: window.webContents.id,
        focused: window.isFocused(),
        incognito: false,
        alwaysOnTop: false,
      };
    }

    return {};
  }

  handleGetCurrent(_getInfo: GetInfo) {
    const window = BrowserWindow.getFocusedWindow();

    if (window) {
      return {
        id: window.webContents.id,
        focused: window.isFocused(),
        incognito: false,
        alwaysOnTop: false,
      };
    }

    return {};
  }

  handleGetLastFocused(_getInfo: GetInfo) {
    const window = BrowserWindow.getFocusedWindow();

    if (window) {
      return {
        id: window.webContents.id,
        focused: window.isFocused(),
        incognito: false,
        alwaysOnTop: false,
      };
    }

    return {};
  }

  handleGetAll(_getInfo: GetInfo) {
    const windows = BrowserWindow.getAllWindows();
    const focusedWindow = BrowserWindow.getFocusedWindow();

    const webContentsIds = focusedWindow ?
      new Set([...this.extensionWebContents.keys(), focusedWindow.webContents.id]) :
      new Set(this.extensionWebContents.keys());

    return windows
      .filter((window) => webContentsIds.has(window.webContents.id))
      .map(
        (window) => ({
          id: window.webContents.id,
          focused: window.isFocused(),
          incognito: false,
          alwaysOnTop: false,
        })
      );
  }

  handleCreate(createData: CreateData) {
    const { width, height, left, top, url } = createData;

    const window = new BrowserWindow({
      width: width || 800,
      height: height || 600,
      x: left,
      y: top,
    });

    if (url) window.loadURL(url);

    this.extensionWebContents.set(window.webContents.id, window.webContents);

    return {
      id: window.webContents.id,
      focused: window.isFocused(),
      incognito: false,
      alwaysOnTop: false,
    };
  }

  handleUpdate(windowId: Window['id'], updateInfo: UpdateInfo) {
    const window = this.findBrowserWindow(windowId);

    if (window) {
      if (!this.extensionWebContents.has(window.webContents.id)) {
        return {};
      }

      if (updateInfo) {
        const { width, height, left, top } = updateInfo;
        if (updateInfo.width || updateInfo.height) {
          const [windowWidth, windowHeight] = window.getSize();
          window.setSize(width || windowWidth, height || windowHeight);
        }

        if (left || top) {
          const [windowLeft, windowTop] = window.getPosition();
          window.setPosition(left || windowLeft, top || windowTop);
        }
      }

      return {
        id: window.webContents.id,
        focused: window.isFocused(),
        incognito: false,
        alwaysOnTop: false,
      };
    }

    return {};
  }

  handleRemove(windowId: Window['id']) {
    const window = this.findBrowserWindow(windowId);

    if (window && this.extensionWebContents.has(window.webContents.id)) {
      window.close();
      this.extensionWebContents.delete(window.webContents.id);
    }

    return;
  }

  release() {
    this.rpcIpcManager.release();
  }

  private findBrowserWindow(windowId: Window['id']) {
    return BrowserWindow
      .getAllWindows()
      .find((window) => window.webContents.id === windowId);
  }
}

export default ChromeWindowsAPIHandler;
