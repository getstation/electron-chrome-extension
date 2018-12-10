# Electron Chrome Extension

## Environment
Node v8.9.0
NPM v5.5.1

## Dev Environment

Watch
```sh
$ npm run watch
```

Run Playground
```sh
$ npm run playground
```

## Test Environement

```sh
$ npm run test
```

We use [electron-mocha](https://github.com/jprichardson/electron-mocha) for run our test suit.
Warning (because not explained in the lib): test assertions lives in the renderer, the main remains accessible for IPC calls and API calls.

## Production Environment

Build
```sh
$ npm run build
```
