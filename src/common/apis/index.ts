
export const CxApiHandler = 'cx-handler';

export enum CxApiChannels {
  Windows = 'api-windows',
}

export type Callback<T> = (payload: T) => void;
