import { Protocol } from "./types";

export const protocolAsScheme = (protocol: Protocol) => protocol.slice(0, -1);
