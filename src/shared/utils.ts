import { Protocol } from "./constants";

export const protocolAsScheme = (protocol: Protocol) => protocol.slice(0, -1);
