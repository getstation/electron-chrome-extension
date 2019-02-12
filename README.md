# Electron Chrome Extension

[![Build Status](https://travis-ci.com/getstation/electron-chrome-extension.svg?token=NLebjoCo6B1MogiwMcNq&branch=master)](https://travis-ci.com/getstation/electron-chrome-extension)

## Environment
Tested with `Electron v3.0.4` - `Node v8.9.0` - `NPM v5.5.1`

## Setup

- **Renderer - preload**

```ts
require('electron-chrome-extension/preload');
```

*For some reasons the navigator user agent is not inherited from the session so you will need
to redefine the user agent via the `Object.defineProperty` method after the import*

- **Main**

```ts
import { addExtension } from 'electron-chrome-extension';

addExtension(join(__dirname, './extensions/ocpljaamllnldhepankaeljmeeeghnid'))
```

### Usage with DevTools extension

⚠️ `electron-chrome-extension` will break [Electron's support for Devtools extensions](https://electronjs.org/docs/tutorial/devtools-extension).

If you wish to use devtools extensions, make sure to add the prelaod on the `Session` itself:
```js
if (isDev) {
  app.on('session-created', session => {
    session.setPreloads([path.join(__dirname, 'node_modules/electron-chrome-extension/preload')]
  });
}
```
It is not recommended to have the preload added to `Sessions` outside developement environnement because it can lead to have extension's code run in priviledged contexts (`BrowserWindows` with `nodeIntegration` for instance).

Then install Chrome DevTools extensions with `electron-chrome-extension`:

```js
import ECx from 'electron-chrome-extension';
// load React Dev Tools
ECx.load('jdkknkkbebbapilgoeccciglkfbmbnfm');

```

## Tools

- Start Playground
```sh
$ npm start
```

You can tweak the playground files at your convenience and extensions would automatically downloaded and clean app data with `$ npm run playground:reset`

- Test
```sh
$ npm test
```

We use [electron-mocha](https://github.com/jprichardson/electron-mocha) for run our test suit.
Warning (because not explained in the lib): test assertions lives in the renderer,
the main remains accessible for IPC calls and Electron Main API calls.

- Publish
```sh
$ npm publish
```

## References

- [Chrome Extensions Overview](https://developer.chrome.com/extensions/overview)
- [Chrome Extensions API index](https://developer.chrome.com/extensions/api_index)
- [Station Exploration](https://www.notion.so/stationhq/Chrome-Extensions-c964f683125f4a758490b60b5d8e28be)
