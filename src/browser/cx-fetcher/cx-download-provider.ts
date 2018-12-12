// download-crx is capble to download a .CRX from WebStore repository
// @ts-ignore
import * as downloadCrx from 'download-crx';

export default {
  // @ts-ignore
  downloadById: (extensionId:string, dir:string) => {
    return downloadCrx.downloadById(extensionId, dir, extensionId);
  },
};
