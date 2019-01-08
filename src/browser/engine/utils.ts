import { Protocol } from '../../common';

export const isWindowOrWebView = (webContents: Electron.WebContents) => {
  // @ts-ignore : missing type
  const type = webContents.getType();
  return type === 'window' || type === 'webview';
};

export const protocolAsScheme = (protocol: Protocol) => protocol.slice(0, -1);
