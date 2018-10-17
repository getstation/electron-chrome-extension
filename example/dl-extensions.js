const downloadCrx = require('download-crx');
const unzip = require('unzip-crx');
const tmp = require('tmp');
const path = require('path');
const fs = require('fs');

const EXTENSIONS = [
  {
    id: 'pgbdljpkijehgoacbjpolaomhkoffhnl',
    slug: 'mailtracker'
  },
  {
    id: 'ocpljaamllnldhepankaeljmeeeghnid',
    slug: 'mixmax'
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
    id: 'kbfnbcaeplbcioakkpcpgfkobkghlhen',
    slug: 'grammarly'
  },
  // {
  //   id: 'dheionainndbbpoacpnopgmnihkcmnkl',
  //   slug: 'gmelius'
  // },
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
  //   id: 'aomjjhallfgjeglblehebfpbcfeobpgk',
  //   slug: '1password'
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
})
