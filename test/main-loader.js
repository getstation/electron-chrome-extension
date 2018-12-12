const glob = require('glob');
const { join, resolve } = require('path');

require('ts-node').register();

// debugger;

for (const path of glob.sync(join(__dirname, '**/*.main.ts'))) {
  require(resolve(path));
}