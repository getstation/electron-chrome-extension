/**
 * Windows API Types
 * See https://developer.chrome.com/extensions/windows
 */

// https://developer.chrome.com/extensions/windows#type-WindowType
export enum WINDOW_TYPE {
  NORMAL, POPUP, DEVTOOLS,
}

// https://developer.chrome.com/extensions/windows#type-WindowState
export enum WINDOW_STATE {
  NORMAL, MINIMIZED, MAXIMIZED, FULLSCREEN,
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
  type?: WINDOW_TYPE,
  state?: WINDOW_STATE,
  alwaysOnTop: boolean,
  sessionId?: string,
}

// https://developer.chrome.com/extensions/windows#type-CreateType
export enum CREATE_TYPE {
  NORMAL, POPUP,
}

export interface GetInfo {
  populate?: boolean,
  windowTypes?: WINDOW_TYPE[],
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
  type?: WINDOW_TYPE,
  state?: WINDOW_STATE,
  setSelfAsOpener?: boolean,
}

export interface UpdateInfo {
  left?: number,
  top?: number,
  width?: number,
  height?: number,
  focused?: boolean,
  drawAttention?: boolean,
  state?: WINDOW_STATE,
}
