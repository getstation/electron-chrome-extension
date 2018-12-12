// download-crx is capble to download a .CRX from WebStore repository
const downloadCrx = require('download-crx');

export default {
  downloadById: (extensionId:string, dir:string) => {
    return downloadCrx(extensionId, dir);
  },
};
