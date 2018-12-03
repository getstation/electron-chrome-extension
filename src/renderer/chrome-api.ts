import { Extension, ChromeApi } from 'src/shared/types';

declare global {
  interface Window { chrome: ChromeApi; }
}

const injectChromeApi = (
  context: Window,
  extensionId: Extension['id'],
  isBackgroundPage: boolean,
) => {
  // Mute the Window object to add the chrome namespace
  const chrome = context.chrome ? context.chrome : context.chrome = {};

  console.log('injectChromeApi: ', extensionId, isBackgroundPage, context);

  return chrome;
};

export default injectChromeApi;
