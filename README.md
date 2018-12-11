# Electron Chrome Extension

[![Build Status](https://travis-ci.com/getstation/electron-chrome-extension.svg?token=NLebjoCo6B1MogiwMcNq&branch=fix/explorations-for-revamp)](https://travis-ci.com/getstation/electron-chrome-extension)

## Environment
Electron v3.0.4 - Node v8.9.0 - NPM v5.5.1

## Dev Environment

- Watch
```sh
$ npm run watch
```

- Run Playground
```sh
$ npm run playground
```

## Test Environement

- Run
```sh
$ npm run test
```

We use [electron-mocha](https://github.com/jprichardson/electron-mocha) for run our test suit.
Warning (because not explained in the lib): test assertions lives in the renderer, 
the main remains accessible for IPC calls and API calls.

## Production Environment

- Build
```sh
$ npm run build
```
