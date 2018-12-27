import { ChromeApi } from './src/common/types';

declare global {
  interface Window {
    chrome: ChromeApi
  }
}
