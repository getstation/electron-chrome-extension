// download-crx is capble to download a .CRX from WebStore repository
// @ts-ignore
import * as downloadCrx from 'download-crx';
// @ts-ignore
import * as tmp from 'tmp';

const downloadById = (extensionId: string) => {
  const tempDir = tmp.dirSync().name;
  return downloadCrx.downloadById(extensionId, tempDir, extensionId);
};

export default {
  downloadById,
};
