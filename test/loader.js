const glob = require('glob');
const { join, resolve } = require('path');

require('ts-node').register();

// debugger;

for (const path of glob.sync(join(__dirname, '**/*.ts'))) {
  if (!path.endsWith('.main.ts')) {
    require(resolve(path));
  }
}