import { ChromeApi } from '../src/shared/types';
import { EventsSubscriptions } from 'src/renderer/events';

declare global {
  interface Window {
    __targetProvider: { __apiPath: string[], apis: any }, // todo
    __eventsSubscriptions: EventsSubscriptions,
    chrome: ChromeApi,
  }
}
