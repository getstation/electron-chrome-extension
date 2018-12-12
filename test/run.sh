#!/usr/bin/env bash
xvfb-maybe electron-mocha --debug --debug-brk --require-main test/main-loader.js --renderer test/loader.js
