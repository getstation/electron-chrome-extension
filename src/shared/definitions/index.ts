import glob from 'glob';
import { resolve, join } from 'path';

const mergeDeclarations = (path: string): any => {
  return glob.sync(path).reduce(
    (merge, declaration) => {
      const obj = require(resolve(declaration));
      return { ...merge, ...obj };
    },
    {}
  );
}

const concatDeclarations = (path: string): any => {
  return glob.sync(path).reduce(
    (apis, declaration) => {
      const api = require(resolve(declaration));
      return apis.concat(api);
    },
    []
  );
}

export const apis = concatDeclarations(join(__dirname, 'apis', '*.json'));

export const manifestFeatures = mergeDeclarations(
  join(__dirname, '_manifest_features-*.json')
);

export const permissionFeatures = mergeDeclarations(
  join(__dirname, '_permission_features-*.json')
);

export const apiFeatures = mergeDeclarations(
  join(__dirname, '_api_features-*.json')
);

export default {
  apis,
  manifestFeatures,
  permissionFeatures,
  apiFeatures,
}
