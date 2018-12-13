#!/usr/bin/env bash

if [[ $TRAVIS == true ]]
then
  xvfb-maybe electron-mocha --require-main test/main-loader.js --renderer test/loader.js
else
  xvfb-maybe electron-mocha --debug --interactive --require-main test/main-loader.js --renderer test/loader.js
fi
