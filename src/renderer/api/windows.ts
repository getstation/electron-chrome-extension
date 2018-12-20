import { Callback, CreateData, CxApiHandler, CxWindowsApi, GetInfo, UpdateInfo } from '../../common/types/api-windows';
const { rpc } = require('electron-simple-rpc');
const Event = require('./event');

class ChromeWindowsAPIClient {
  scope: string;
  WINDOW_ID_NONE: number;
  WINDOW_ID_CURRENT: number;
  onCreated: Event;
  onRemoved: Event;
  onFocusChanged: Event;

  constructor(extensionId: string) {
    this.scope = `${CxApiHandler}-${extensionId}`;

    this.WINDOW_ID_NONE = -1;
    this.WINDOW_ID_CURRENT = -2;

    this.onCreated = new Event();
    this.onRemoved = new Event();
    this.onFocusChanged = new Event();
  }

  get(windowId: number, getInfo: GetInfo, callback: Callback) {
    rpc(this.scope, CxWindowsApi.Get)(windowId, getInfo).then(callback);
  }

  getCurrent(getInfo: GetInfo, callback: Callback) {
    rpc(this.scope, CxWindowsApi.GetCurrent)(getInfo).then(callback);
  }

  getLastFocused(getInfo: GetInfo, callback: Callback) {
    rpc(this.scope, CxWindowsApi.GetLastFocused)(getInfo).then(callback);
  }

  getAll(getInfo: GetInfo, callback: Callback) {
    rpc(this.scope, CxWindowsApi.GetAll)(getInfo).then(callback);
  }

  create(createData: CreateData, callback: Callback) {
    rpc(this.scope, CxWindowsApi.Create)(createData).then(callback);
  }

  update(windowId: number, updateInfo: UpdateInfo, callback: Callback) {
    rpc(this.scope, CxWindowsApi.Update)(windowId, updateInfo).then(callback);
  }

  remove(windowId: number, callback: () => void) {
    rpc(this.scope, CxWindowsApi.GetCurrent)(windowId).then(callback);
  }
}

exports.setup = (extensionId: string) => new ChromeWindowsAPIClient(extensionId);
