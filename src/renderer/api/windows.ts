import { CreateData, GetInfo, UpdateInfo } from '../../common/types/api-windows';

const Event = require('./event');
const { ipcRenderer } = require('electron');
const constants = require('../../common/constants');

class ChromeWindowsAPIClient {
  WINDOW_ID_NONE: number;
  WINDOW_ID_CURRENT: number;
  onCreated: Event;
  onRemoved: Event;
  onFocusChanged: Event;

  constructor() {
    this.WINDOW_ID_NONE = -1;
    this.WINDOW_ID_CURRENT = -2;

    this.onCreated = new Event();
    this.onRemoved = new Event();
    this.onFocusChanged = new Event();
  }

  get(windowId: number, getInfo: GetInfo, callback: (payload: Window) => void) {
    ipcRenderer.send(`${constants.WINDOWS_GET}`, windowId, getInfo);
    ipcRenderer.on(`${constants.WINDOWS_GET_RESULT}`,
      (_event: Electron.Event, payload: Window) => callback(payload)
    );
  }

  getCurrent (getInfo: GetInfo, callback: (payload: Window) => void) {
    ipcRenderer.send(`${constants.WINDOWS_GET_CURRENT}`, getInfo);
    ipcRenderer.on(`${constants.WINDOWS_GET_CURRENT_RESULT}`,
      (_event: Electron.Event, payload: Window) => callback(payload)
    );
  }

  getLastFocused (getInfo: GetInfo, callback: (payload: Window) => void) {
    ipcRenderer.send(`${constants.WINDOWS_GET_LAST_FOCUSED}`, getInfo);
    ipcRenderer.on(`${constants.WINDOWS_GET_LAST_FOCUSED_RESULT}`,
      (_event: Electron.Event, payload: Window) => callback(payload)
    );
  }

  getAll (getInfo: GetInfo, callback: (payload: Window) => void) {
    ipcRenderer.send(`${constants.WINDOWS_GET_ALL}`, getInfo);
    ipcRenderer.on(`${constants.WINDOWS_GET_ALL_RESULT}`,
      (_event: Electron.Event, payload: Window) => callback(payload)
    );
  }

  create (createData: CreateData, callback: (payload: Window) => void) {
    ipcRenderer.send(`${constants.WINDOWS_CREATE}`, createData);
    ipcRenderer.on(`${constants.WINDOWS_CREATE_RESULT}`,
      (_event: Electron.Event, payload: Window) => callback && callback(payload)
    );
  }

  update (windowId: number, updateInfo: UpdateInfo, callback: (payload: Window) => void) {
    ipcRenderer.send(`${constants.WINDOWS_UPDATE}`, windowId, updateInfo);
    ipcRenderer.on(`${constants.WINDOWS_UPDATE_RESULT}`,
      (_event: Electron.Event, payload: Window) => callback && callback(payload)
    );
  }

  remove (windowId: number, callback: () => void) {
    ipcRenderer.send(`${constants.WINDOWS_REMOVE}`, windowId);
    ipcRenderer.on(`${constants.WINDOWS_REMOVE_RESULT}`,
      () => callback && callback()
    );
  }
}

exports.setup = () => new ChromeWindowsAPIClient();
