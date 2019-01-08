const { RpcIpcManager, rpc } = require('electron-simple-rpc');
const Event = require('./event');
import {
  Window,
  CreateData,
  CxWindowsApi,
  GetInfo,
  UpdateInfo,
} from '../../common/apis/windows';
import {
  ApiHandler,
  ApiEvent,
  ApiChannels,
} from '../../common/apis';

import { Callback } from '../../common/types';

class ChromeWindowsAPIClient {
  WINDOW_ID_NONE: number;
  WINDOW_ID_CURRENT: number;

  handlerScope: string;
  eventScope: string;

  onCreated: Event;
  onRemoved: Event;
  onFocusChanged: Event;

  rpcIpcEventsManager: any;

  constructor(extensionId: string) {
    this.handlerScope = `${ApiHandler}-${ApiChannels.Windows}-${extensionId}`;

    this.eventScope = `${ApiEvent}-${ApiChannels.Windows}`;

    this.WINDOW_ID_NONE = -1;
    this.WINDOW_ID_CURRENT = -2;

    this.onCreated = new Event();
    this.onRemoved = new Event();
    this.onFocusChanged = new Event();

    const library = {
      onCreated: this.onCreated,
      onRemoved: this.onRemoved,
      onFocusChanged: this.onFocusChanged,
    };

    this.rpcIpcEventsManager = new RpcIpcManager(library, this.eventScope);
  }

  get(windowId: Window['id'], getInfo: GetInfo, callback: Callback<Window>) {
    rpc(this.handlerScope, CxWindowsApi.Get)(windowId, getInfo).then(callback);
  }

  getCurrent(getInfo: GetInfo, callback: Callback<Window>) {
    rpc(this.handlerScope, CxWindowsApi.GetCurrent)(getInfo).then(callback);
  }

  getLastFocused(getInfo: GetInfo, callback: Callback<Window>) {
    rpc(this.handlerScope, CxWindowsApi.GetLastFocused)(getInfo).then(callback);
  }

  getAll(getInfo: GetInfo, callback: Callback<Window>) {
    rpc(this.handlerScope, CxWindowsApi.GetAll)(getInfo).then(callback);
  }

  create(createData: CreateData, callback?: Callback<Window>) {
    if (callback) {
      return rpc(this.handlerScope, CxWindowsApi.Create)(createData).then(callback);
    }

    rpc(this.handlerScope, CxWindowsApi.Create)(createData);
  }

  update(
    windowId: Window['id'],
    updateInfo: UpdateInfo,
    callback?: Callback<Window>
  ) {
    if (callback) {
      return rpc(this.handlerScope, CxWindowsApi.Update)(windowId).then(callback);
    }

    rpc(this.handlerScope, CxWindowsApi.Update)(windowId, updateInfo);
  }

  remove(windowId: Window['id'], callback?: Callback<Window>) {
    if (callback) {
      return rpc(this.handlerScope, CxWindowsApi.GetCurrent)(windowId).then(callback);
    }

    rpc(this.handlerScope, CxWindowsApi.GetCurrent)(windowId);
  }
}

exports.setup = (extensionId: string) =>
  new ChromeWindowsAPIClient(extensionId);
