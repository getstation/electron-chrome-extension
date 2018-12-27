const downloadCrx = require('download-crx');
const unzip = require('unzip-crx');
const tmp = require('tmp');
const path = require('path');
const fs = require('fs');

const EXTENSIONS = [
  {
    id: 'dheionainndbbpoacpnopgmnihkcmnkl',
    slug: 'gmelius'
  },
  {
    id: 'pgbdljpkijehgoacbjpolaomhkoffhnl',
    slug: 'mailtracker'
  },
  {
    id: 'ocpljaamllnldhepankaeljmeeeghnid',
    slug: 'ocpljaamllnldhepankaeljmeeeghnid'
  },
  {
    id: 'mdanidgdpmkimeiiojknlnekblgmpdll',
    slug: 'boomerang',
  },
  {
    id: 'pmnhcgfcafcnkbengdcanjablaabjplo',
    slug: 'clearbit-connect'
  },
  {
    id: 'aeblfdkhhhdcdjpifhhbdiojplfjncoa',
    slug: '1passwordx'
  },
  {
    id: 'kbfnbcaeplbcioakkpcpgfkobkghlhen',
    slug: 'grammarly'
  },
  // {
  //   id: 'hihakjfhbmlmjdnnhegiciffjplmdhin',
  //   slug: 'rapportive'
  // },
  // {
  //   id: 'pnnfemgpilpdaojpnkjdgfgbnnjojfik',
  //   slug: 'streak'
  // },
  // {
  //   id: 'gkjnkapjmjfpipfcccnjbjcbgdnahpjp',
  //   slug: 'yesware'
  // },
  // {
  //   id: 'ghbmnnjooekpmoecnnnilnnbdlolhkhi',
  //   slug: 'google-drive-offline'
  // },
  // {
  //   id: 'hdokiejnpimakedhajhdlcegeplioahd',
  //   slug: 'lastpass'
  // },
  // {
  //   id: 'fdjamakpfbbddfjaooikfcpapjohcfmg',
  //   slug: 'dashlane'
  // }
];

const destinationFolder = path.resolve(__dirname, 'extensions');

const tempDir = tmp.dirSync().name;
EXTENSIONS.forEach(extension => {
  downloadCrx
    .downloadById(extension.id, tempDir, extension.slug)
    .then(filePath => unzip(filePath, path.resolve(destinationFolder, extension.slug)))
    .then(() => fs.writeFile(path.resolve(destinationFolder, extension.slug, 'chromeStoreExtensionId'), extension.id))
    .then(() => console.log(`DLed ${extension.slug}`))
});
