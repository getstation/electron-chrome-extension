/**
 * Windows API Types
 * See https://developer.chrome.com/extensions/windows
 */

export type Callback = (payload: Window) => void;
export const CxApiHandler = 'cx-handler';

export enum CxWindowsApi {
  Get = 'get',
  GetCurrent = 'get-current',
  GetLastFocused = 'get-last-focused',
  GetAll = 'get-all',
  Create = 'create',
  Update= 'update',
  Remove= 'remove',
}

// https://developer.chrome.com/extensions/windows#type-WindowType
export enum WindowType {
  NORMAL = 'normal',
  POPUP = 'popup',
  DEVTOOLS = 'devtools',
}

// https://developer.chrome.com/extensions/windows#type-WindowState
export enum WindowState {
  NORMAL = 'normal',
  MINIMIZED = 'minimized',
  MAXIMIZED = 'maximized',
  FULLSCREEN = 'fullscreen',
}

// https://developer.chrome.com/extensions/windows#type-Window
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

// https://developer.chrome.com/extensions/windows#type-CreateType
export enum CreateType {
  NORMAL = 'normal',
  POPUP = 'popup',
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
