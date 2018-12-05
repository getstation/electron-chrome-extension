// Proxy

export const getApi = (target: any, namespace: string) =>
  target.find((api: any) => api.namespace === namespace);

export const getTypeByReference = (target: any, reference: string) =>
  target['types'].find((t: any) => t.id === reference);

export const resolve = (target: any, type: string, property: string) =>
  target[type].find((m: any) => m['name'] === property);

export const addTargetApiPath = (target: any, originalTarget: any, path: string) => {
  const { __apiPath } = originalTarget;

  return Object.assign(
    {},
    target,
    {
      __apiPath: [...__apiPath, path],
    },
  );
};
