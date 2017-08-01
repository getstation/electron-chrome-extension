const downloadCrx = require('download-crx');
const unzip = require('unzip-crx');
const tmp = require('tmp');
const path = require('path');

const EXTENSIONS = [
  {
    id: 'pgbdljpkijehgoacbjpolaomhkoffhnl',
    slug: 'mailtracker'
  },
  {
    id: 'kbfnbcaeplbcioakkpcpgfkobkghlhen',
    slug: 'gramarly'
  },
  {
    id: 'ocpljaamllnldhepankaeljmeeeghnid',
    slug: 'mixmax'
  }
];
const destinationFolder = path.resolve(__dirname, 'extensions');

const tempDir = tmp.dirSync().name;
EXTENSIONS.forEach(extension => {
  downloadCrx
    .downloadById(extension.id, tempDir, extension.slug)
    .then(filePath => unzip(filePath, path.resolve(destinationFolder, extension.slug)))
    .then(() => console.log(`DLed ${extension.slug}`))
})
