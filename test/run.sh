#!/usr/bin/env bash
xvfb-maybe electron-mocha --require-main test/main/loader.js --renderer test/renderer/loader.js
