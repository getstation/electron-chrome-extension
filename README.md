# Electron Chrome Extension

[![Build Status](https://travis-ci.com/getstation/electron-chrome-extension.svg?token=NLebjoCo6B1MogiwMcNq&branch=master)](https://travis-ci.com/getstation/electron-chrome-extension)

## Environment
Tested with `Electron v4.0.4` - `Node v8.9.0` - `NPM v5.5.1`

## Setup

- **Renderer - preload**

```ts
require('electron-chrome-extension/preload');
```

*For some reasons the navigator user agent is not inherited from the session so you will need
to redefine the user agent via the `Object.defineProperty` method after the import*

- **Main**

```ts
import ECx from 'electron-chrome-extension';

app.on('ready', async () => {
  createWindow();

  // Load Grammarly
  await ECx.load('kbfnbcaeplbcioakkpcpgfkobkghlhen');
});
```

### Connect your application logic

Extensions react to browser events for trigger their own logic.
ECx send inner webContents events to extensions subscribers but external events
like creating new window, changing tab focus etc should be triggered on your side like this:

```js
// main.js

ipcMain.on('YOUR_EVENT', (...) =>
  ECx.sendEvent({
    channel: 'tabs.onActivated',
    payload: [{ tabId, windowId }],
  })
);
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

## ECx APIs

- `ECx.load(extensionId: IExtension['id']): Promise<IExtension>`
- `ECx.unload(extensionId: IExtension['id']): void`
- `ECx.setConfiguration(configuration: Configuration = {}): Promise<ECx>`
- `ECx.isLoaded(extensionId: IExtension['id']): boolean`
- `ECx.isUpToDate(extensionId: IExtension['id']): Promise<boolean>`
- `ECx.get(extensionId: IExtension['id']): Promise<IExtension>`
- `ECx.sendEvent(event: ExtensionEventMessage): void`

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

## Know supported extensions

*as of 05/29/19 with their Chrome WebStore ID*

- Mixmax: ocpljaamllnldhepankaeljmeeeghnid
- Gmelius: dheionainndbbpoacpnopgmnihkcmnkl
- Mailtracker: pgbdljpkijehgoacbjpolaomhkoffhnl
- Boomerang: mdanidgdpmkimeiiojknlnekblgmpdll
- Clearbit Connect: pmnhcgfcafcnkbengdcanjablaabjplo
- Grammarly: kbfnbcaeplbcioakkpcpgfkobkghlhen
- React Developers Tools: fmkadmapgofadopljbjfkapdkoienihi
- Redux DevTools: lmhkpmbekcpmknklioeibfkpmmfibljd
- Apollo Client Developer Tools: jdkknkkbebbapilgoeccciglkfbmbnfm
