import { Protocol } from './index';

export const protocolAsScheme = (protocol: Protocol) => protocol.slice(0, -1);

// todo(hugo | electron 5) remove for Object.fromEntries()
export const fromEntries = (iterable: any) => [...iterable]
  .reduce((obj, { 0: key, 1: val }) => Object.assign(obj, { [key]: val }), {});

export const log = (...args: any[]) => console.log(
  (new Date(Date.now())).toJSON(), ...args
);

export const isIterable = (obj: any) => {
  if (obj === null || obj === undefined) {
    return false;
  }

  return typeof obj[Symbol.iterator] === 'function';
};
