const glob = require('glob');
const { join, resolve } = require('path');

for (const path of glob.sync(join(__dirname, '..', 'lib-test', '**/*.main.js'))) {
  require(resolve(path));
}
