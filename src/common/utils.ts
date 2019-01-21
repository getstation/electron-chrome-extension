import { Protocol } from './index';

export const protocolAsScheme = (protocol: Protocol) => protocol.slice(0, -1);
