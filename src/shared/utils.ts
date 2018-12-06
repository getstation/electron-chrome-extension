import { Protocol } from "./types";

export const protocolAsScheme = (protocol: Protocol) => protocol.slice(0, -1);

export const toSnakeCase = (str: string): string => {
  var upperChars = str.match(/([A-Z])/g);
  if (!upperChars) {
    return str;
  }

  for (var i = 0, n = upperChars.length; i < n; i++) {
    str = str.replace(
      new RegExp(upperChars[i]), '_' + upperChars[i].toLowerCase()
    );
  }

  if (str.slice(0, 1) === '_') {
    str = str.slice(1);
  }

  return str;
};
