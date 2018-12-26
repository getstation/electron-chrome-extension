# Electron Chrome Extension

[![Build Status](https://travis-ci.com/getstation/electron-chrome-extension.svg?token=NLebjoCo6B1MogiwMcNq&branch=master](https://travis-ci.com/getstation/electron-chrome-extension)

## Environment
Tested with `Electron v3.0.4` - `Node v8.9.0` - `NPM v5.5.1`

## Tools

- Start Playground
```sh
$ npm start
```

You can tweak the playground files at your convenience and extensions would automatically downloaded and clean app data with `$ npm run clean:playground`

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
