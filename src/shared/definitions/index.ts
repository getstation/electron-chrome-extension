import glob from 'glob';
import { resolve, join } from 'path';

export const apis = glob.sync(join(__dirname, 'apis', '*.json')).reduce(
  (apis, declaration) => {
    const api = require(resolve(declaration));
    return apis.concat(api);
  },
  []
);

export const manifest = require('./_manifest_features.json');
export const permission = require('./_permission_features.json');
export const api = require('./_api_features.json');


export default {
  apis,  // as Window['ChromeApi']
  features: {
    manifest,
    permission,
    api,
  },
}
