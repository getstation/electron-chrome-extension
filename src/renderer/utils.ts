import { apis } from '../shared/definitions';

// Proxy

export const getApiScope = (namespace: string) =>
  apis.find((api: any) => api.namespace === namespace);

export const getTypeByReference = (target: any, reference: string) =>
  target['types'].find((t: any) => t.id === reference);

export const proxify = (target: any, type: string, property: PropertyKey) =>
  target[type].find((m: any) => m['name'] === property);
