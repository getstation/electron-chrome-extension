import { Extension, ChromeApi } from '../shared/types';

declare global {
  interface Window { chrome: ChromeApi; }
}

const injectChromeApi = (
  context: Window,
  extensionId: Extension['id'],
  isBackgroundPage: boolean,
) => {
  const chromeProxy = {} // new Proxy();

  // Mute the Window object to add the chrome namespace
  const chrome = context.chrome ? context.chrome : context.chrome = chromeProxy;
  console.log('injectChromeApi: ', extensionId, isBackgroundPage, context);

  return chrome;
};

export default injectChromeApi;
