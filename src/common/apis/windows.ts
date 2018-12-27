// chrome.windows
// See https://developer.chrome.com/extensions/windows

export enum CxWindowsApi {
  Get = 'get',
  GetCurrent = 'get-current',
  GetLastFocused = 'get-last-focused',
  GetAll = 'get-all',
  Create = 'create',
  Update = 'update',
  Remove = 'remove',
}

export enum WindowType {
  Normal = 'normal',
  Popup = 'popup',
  DevTools = 'devtools',
}

export enum WindowState {
  Normal = 'normal',
  Minimized = 'minimized',
  Maximized = 'maximized',
  Fullscreen = 'fullscreen',
}

export interface Window {
  id?: number,
  focused: boolean,
  top?: number,
  left?: number,
  width?: number,
  height?: number,
  tabs?: any[],
  incognito: boolean,
  type?: WindowType,
  state?: WindowState,
  alwaysOnTop: boolean,
  sessionId?: string,
}

export enum CreateType {
  Normal = 'normal',
  Popup = 'popup',
}

export interface GetInfo {
  populate?: boolean,
  windowTypes?: WindowType[],
}

export interface CreateData {
  url?: string, // Ignoring array of URL
  tabId?: number,
  left?: number,
  top?: number,
  width?: number,
  height?: number,
  focused?: boolean,
  incognito?: boolean,
  type?: WindowType,
  state?: WindowState,
  setSelfAsOpener?: boolean,
}

export interface UpdateInfo {
  left?: number,
  top?: number,
  width?: number,
  height?: number,
  focused?: boolean,
  drawAttention?: boolean,
  state?: WindowState,
}
