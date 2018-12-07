import { Extension } from '../shared/types';
import { warn } from './utils';

// Check
// - Content Scripts
// - Permission

export const operationAllowed = (
  features: any,
  extension: Extension,
  path: string[],
  isBackgroundPage: boolean,
): boolean | void => {
  if (path.length === 0) return false;

  const feature = features[path.join('.')];

  if (feature) {
    const contexts = feature['contexts'];

    if (!Boolean(contexts)) {
      return true;
    }

    const allowedAsContentScripts = contexts
      .includes('content_script');

    if (feature['dependencies']) {
      const requiredPermissions = feature['dependencies']
        .filter((d: string) => d.startsWith('permission:'));

      if (requiredPermissions.length > 0) {
        const requiredPermission = requiredPermissions
          .map((d: string) => d.split(':')[1])[0];

        const { manifest: { permissions } } = extension;
        const permissionChecked = permissions.includes(requiredPermission);

        if (isBackgroundPage) {
          if (!permissionChecked) {
            warn(`Permission missing: ${requiredPermission}`);
          }
          return permissionChecked;
        }

        if (allowedAsContentScripts) {
          if (!permissionChecked) {
            warn(`Permission missing: ${requiredPermission}`);
          }

          return permissionChecked;
        }

        warn(`Access not allowed for ${path} in content scripts`);
        return false;
      }
    }

    if (isBackgroundPage) {
      return true;
    }

    if (allowedAsContentScripts) {
      return true;
    }

    warn(`Access not allowed for ${path} in content scripts`);
    return false;
  }

  path.pop();

  return operationAllowed(features, extension, path, isBackgroundPage);
}
