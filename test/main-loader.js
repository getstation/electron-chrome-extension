const glob = require('glob');
const { join, resolve } = require('path');

const mainTests = join(__dirname, '..', 'lib', 'test', '**/*.main.js');

for (const path of glob.sync(mainTests)) {
  require(resolve(path));
}
