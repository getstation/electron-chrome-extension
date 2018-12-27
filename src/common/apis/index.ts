
export const CxApiHandler = 'cx-handler';
export const CxApiEvent = 'cx-event';

export enum CxApiChannels {
  Windows = 'channel-windows',
}

export type Callback<T> = (payload: T) => void;
