const { rpc } = require('electron-simple-rpc');
const Event = require('./event');
import {
  Window,
  CreateData,
  CxWindowsApi,
  GetInfo,
  UpdateInfo,
} from '@src/common/apis/windows';
import {
  CxApiHandler,
  Callback,
  CxApiChannels,
} from '@src/common/apis';

class ChromeWindowsAPIClient {
  WINDOW_ID_NONE: number;
  WINDOW_ID_CURRENT: number;

  scope: string;

  onCreated: Event;
  onRemoved: Event;
  onFocusChanged: Event;

  constructor(extensionId: string) {
    this.scope = `${CxApiHandler}-${CxApiChannels.Windows}-${extensionId}`;

    this.WINDOW_ID_NONE = -1;
    this.WINDOW_ID_CURRENT = -2;

    this.onCreated = new Event();
    this.onRemoved = new Event();
    this.onFocusChanged = new Event();
  }

  get(windowId: Window['id'], getInfo: GetInfo, callback: Callback<Window>) {
    rpc(this.scope, CxWindowsApi.Get)(windowId, getInfo).then(callback);
  }

  getCurrent(getInfo: GetInfo, callback: Callback<Window>) {
    rpc(this.scope, CxWindowsApi.GetCurrent)(getInfo).then(callback);
  }

  getLastFocused(getInfo: GetInfo, callback: Callback<Window>) {
    rpc(this.scope, CxWindowsApi.GetLastFocused)(getInfo).then(callback);
  }

  getAll(getInfo: GetInfo, callback: Callback<Window>) {
    rpc(this.scope, CxWindowsApi.GetAll)(getInfo).then(callback);
  }

  create(createData: CreateData, callback?: Callback<Window>) {
    if (callback) {
      return rpc(this.scope, CxWindowsApi.Create)(createData).then(callback);
    }

    rpc(this.scope, CxWindowsApi.Create)(createData);
  }

  update(
    windowId: Window['id'],
    updateInfo: UpdateInfo,
    callback?: Callback<Window>
  ) {
    if (callback) {
      return rpc(this.scope, CxWindowsApi.Update)(windowId).then(callback);
    }

    rpc(this.scope, CxWindowsApi.Update)(windowId, updateInfo);
  }

  remove(windowId: Window['id'], callback?: Callback<Window>) {
    if (callback) {
      return rpc(this.scope, CxWindowsApi.GetCurrent)(windowId).then(callback);
    }

    rpc(this.scope, CxWindowsApi.GetCurrent)(windowId);
  }
}

exports.setup = (extensionId: string) =>
  new ChromeWindowsAPIClient(extensionId);
