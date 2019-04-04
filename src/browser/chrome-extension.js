const { app, ipcMain, webContents, BrowserWindow, protocol } = require('electron')
const { getAllWebContents } = process.atomBinding('web_contents')
const ChromeAPIHandler = require('./handlers');

const { Buffer } = require('buffer')
const fs = require('fs')
const path = require('path')
const url = require('url')

const constants = require('../common/constants');

// TODO(zcbenz): Remove this when we have Object.values().
const objectValues = function (object) {
  return Object.keys(object).map(function (key) { return object[key] })
}

// Mapping between extensionId(hostname) and manifest.
const manifestMap = {}  // extensionId => manifest
const manifestNameMap = {}  // name => manifest
const manifestWSMap = {}  // extensionId web store id => manifest
const apiHandlersMap = {};

const generateExtensionIdFromName = function (name) {
  return name.replace(/[\W_]+/g, '-').toLowerCase()
}

const isWindowOrWebView = function (webContents) {
  const type = webContents.getType()
  return type === 'window' || type === 'webview'
}

// Create or get manifest object from |srcDirectory|.
const getManifestFromPath = function (chromeStoreExtensionId, srcDirectory) {
  let manifest
  let manifestContent

  try {
    manifestContent = fs.readFileSync(path.join(srcDirectory, 'manifest.json'))
  } catch (readError) {
    console.warn(`Reading ${path.join(srcDirectory, 'manifest.json')} failed.`)
    console.warn(readError.stack || readError)
    throw readError
  }

  try {
    manifest = JSON.parse(manifestContent)
  } catch (parseError) {
    console.warn(`Parsing ${path.join(srcDirectory, 'manifest.json')} failed.`)
    console.warn(parseError.stack || parseError)
    throw parseError
  }
  if (!manifestNameMap[manifest.name]) {
    const extensionId = generateExtensionIdFromName(manifest.name)
    manifestMap[extensionId] = manifestNameMap[manifest.name] = manifestWSMap[chromeStoreExtensionId] = manifest
    Object.assign(manifest, {
      srcDirectory: srcDirectory,
      chromeStoreExtensionId,
      extensionId: extensionId,
      // We can not use 'file://' directly because all resources in the extension
      // will be treated as relative to the root in Chrome.
      startPage: url.format({
        protocol: constants.EXTENSION_PROTOCOL,
        slashes: true,
        hostname: extensionId,
        pathname: manifest.devtools_page
      })
    })
    return manifest
  } else if (manifest && manifest.name) {
    console.warn(`Attempted to load extension "${manifest.name}" that has already been loaded.`)
  }
}

// Manage the background pages.
const backgroundPages = {}

const startBackgroundPages = function (manifest) {
  if (backgroundPages[manifest.extensionId] || !manifest.background) return

  let html
  let name
  if (manifest.background.page) {
    name = manifest.background.page
    html = fs.readFileSync(path.join(manifest.srcDirectory, manifest.background.page))
  } else {
    name = '_generated_background_page.html'
    const scripts = manifest.background.scripts.map((name) => {
      return `<script src="${name}"></script>`
    }).join('')
    html = Buffer.from(`<html><body>${scripts}</body></html>`)
  }

  const contents = webContents.create({
    partition: `persist:__chrome_extension:${manifest.extensionId}`,
    isBackgroundPage: true,
    commandLineSwitches: [
      '--electron-chrome-extension-background-page',
      `--preload=${path.join(__dirname, '../renderer/index.js')}`
    ]
  });

  backgroundPages[manifest.extensionId] = { html: html, webContents: contents, name: name, src: manifest.srcDirectory }

  contents.loadURL(url.format({
    protocol: constants.EXTENSION_PROTOCOL,
    slashes: true,
    hostname: manifest.chromeStoreExtensionId,
    pathname: name
  }))
}

const removeBackgroundPages = function (manifest) {
  if (!backgroundPages[manifest.extensionId]) return

  backgroundPages[manifest.extensionId].webContents.destroy()
  delete backgroundPages[manifest.extensionId]
}

const sendToBackgroundPages = function (...args) {
  for (const page of objectValues(backgroundPages)) {
    page.webContents.sendToAll(...args)
  }
}

// Dispatch web contents events to Chrome APIs
const hookWebContentsEvents = function (webContents) {
  const tabId = webContents.id

  sendToBackgroundPages(constants.TABS_ONCREATED)

  webContents.on('will-navigate', (event, url) => {
    sendToBackgroundPages(constants.WEBNAVIGATION_ONBEFORENAVIGATE, {
      frameId: 0,
      parentFrameId: -1,
      processId: webContents.getProcessId(),
      tabId: tabId,
      timeStamp: Date.now(),
      url: url
    })
  })

  webContents.on('did-navigate', (event, url) => {
    sendToBackgroundPages(constants.WEBNAVIGATION_ONCOMPLETED, {
      frameId: 0,
      parentFrameId: -1,
      processId: webContents.getProcessId(),
      tabId: tabId,
      timeStamp: Date.now(),
      url: url
    })
  })

  webContents.once('destroyed', () => {
    sendToBackgroundPages(constants.TABS_ONREMOVED, tabId)
  })
}

// Handle the chrome.* API messages.
let nextId = 0

ipcMain.on(constants.RUNTIME_CONNECT, function (event, extensionId, connectInfo) {
  const page = backgroundPages[extensionId]
  if (!page) {
    console.error(`Connect to unknown extension ${extensionId}`)
    return
  }

  const portId = ++nextId
  event.returnValue = { tabId: page.webContents.id, portId: portId }

  event.sender.once('render-view-deleted', () => {
    if (page.webContents.isDestroyed()) return
    page.webContents.sendToAll(`${constants.PORT_DISCONNECT_}${portId}`)
  })
  page.webContents.sendToAll(`${constants.RUNTIME_ONCONNECT_}${extensionId}`, event.sender.id, portId, connectInfo)
})

ipcMain.on(constants.I18N_MANIFEST, function (event, extensionId) {
  event.returnValue = manifestMap[extensionId]
})

let resultID = 1
ipcMain.on(constants.RUNTIME_SENDMESSAGE, function (event, extensionId, message, originResultID) {
  const page = backgroundPages[extensionId]
  if (!page) {
    console.error(`Connect to unknown extension ${extensionId}`)
    return
  }

  page.webContents.sendToAll(`${constants.RUNTIME_ONMESSAGE_}${extensionId}`, event.sender.id, message, resultID)
  ipcMain.once(`${constants.RUNTIME_ONMESSAGE_RESULT_}${resultID}`, (event, result) => {
    event.sender.send(`${constants.RUNTIME_SENDMESSAGE_RESULT_}${originResultID}`, result)
  })
  resultID++
})

ipcMain.on(constants.TABS_SEND_MESSAGE, function (event, tabId, extensionId, isBackgroundPage, message, originResultID) {
  const contents = webContents.fromId(tabId)
  if (!contents) {
    console.error(`Sending message to unknown tab ${tabId}`)
    return
  }

  const senderTabId = isBackgroundPage ? null : event.sender.id

  contents.sendToAll(`${constants.RUNTIME_ONMESSAGE_}${extensionId}`, senderTabId, message, resultID)
  ipcMain.once(`${constants.RUNTIME_ONMESSAGE_RESULT_}${resultID}`, (event, result) => {
    event.sender.send(`${constants.TABS_SEND_MESSAGE_RESULT_}${originResultID}`, result)
  })
  resultID++
})

ipcMain.on(constants.TABS_EXECUTESCRIPT, function (event, requestId, tabId, extensionId, details) {
  const contents = webContents.fromId(tabId)
  if (!contents) {
    console.error(`Sending message to unknown tab ${tabId}`)
    return
  }

  let code, url
  if (details.file) {
    const manifest = manifestMap[extensionId]
    code = String(fs.readFileSync(path.join(manifest.srcDirectory, details.file)))
    url = `${constants.EXTENSION_PROTOCOL}://${extensionId}${details.file}`
  } else {
    code = details.code
    url = `${constants.EXTENSION_PROTOCOL}://${extensionId}/${String(Math.random()).substr(2, 8)}.js`
  }

  contents.send(constants.TABS_EXECUTESCRIPT, event.sender.id, requestId, extensionId, url, code)
})

ipcMain.on(constants.RUNTIME_GET_MANIFEST, (event, extensionId) => {
  event.returnValue = manifestMap[extensionId];
})

// Transfer the content scripts to renderer.
const contentScripts = {}

const injectContentScripts = function (manifest) {
  if (contentScripts[manifest.name] || !manifest.content_scripts) return

  const readArrayOfFiles = function (relativePath) {
    return {
      url: `${constants.EXTENSION_PROTOCOL}://${manifest.extensionId}${relativePath}`,
      code: String(fs.readFileSync(path.join(manifest.srcDirectory, relativePath)))
    }
  }

  const contentScriptToEntry = function (script) {
    return {
      matches: script.matches,
      exclude_matches: script.exclude_matches,
      js: script.js ? script.js.map(readArrayOfFiles) : [],
      css: script.css ? script.css.map(readArrayOfFiles) : [],
      runAt: script.run_at || 'document_idle'
    }
  }

  try {
    const entry = {
      chromeStoreExtensionId: manifest.chromeStoreExtensionId,
      extensionId: manifest.extensionId,
      extensionName: manifest.name,
      contentScripts: manifest.content_scripts.map(contentScriptToEntry)
    }
    contentScripts[manifest.name] = entry;
  } catch (e) {
    console.error('Failed to read content scripts', e)
  }
}

const contentSecurityPolicy = {
  extensionId: undefined,
  policy: undefined
}

const injectContentSecurityPolicy = function (manifest) {
  if (!manifest.content_security_policy) return

  contentSecurityPolicy.extensionId = manifest.extensionId;
  contentSecurityPolicy.policy = manifest.content_security_policy;
}

const removeContentScripts = function (manifest) {
  if (!contentScripts[manifest.name]) return

  delete contentScripts[manifest.name]
}

ipcMain.on('GET_CONTENTSCRIPTS_SYNC', e => {
  e.returnValue = contentScripts;
})

ipcMain.on('GET_CONTENTSECURITYPOLICY_SYNC', e => {
  e.returnValue = contentSecurityPolicy;
})

// Transfer the |manifest| to a format that can be recognized by the
// |DevToolsAPI.addExtensions|.
const manifestToExtensionInfo = function (manifest) {
  return {
    startPage: manifest.startPage,
    srcDirectory: manifest.srcDirectory,
    name: manifest.name,
    exposeExperimentalAPIs: true
  }
}

// Load the extensions for the window.
const loadExtension = function (manifest) {
  const { extensionId } = manifest;

  if (!(extensionId in apiHandlersMap)) {
    apiHandlersMap[extensionId] = new ChromeAPIHandler(extensionId);
  }

  startBackgroundPages(manifest)
  injectContentScripts(manifest)
  injectContentSecurityPolicy(manifest)
}

const loadDevToolsExtensions = function (win, manifests) {
  if (!win.devToolsWebContents) return

  manifests.forEach(loadExtension)

  const extensionInfoArray = manifests.map(manifestToExtensionInfo)
  extensionInfoArray.forEach((extension) => {
    win.devToolsWebContents._grantOriginAccess(extension.startPage)
  })
  // Calling setTimeout allows us to bypass the following issue:
  // https://bugs.chromium.org/p/chromium/issues/detail?id=822966
  setTimeout(() => {
    win.devToolsWebContents.executeJavaScript(`DevToolsAPI.addExtensions(${JSON.stringify(extensionInfoArray)})`)
  }, 1000)
}

app.on('web-contents-created', function (event, webContents) {
  if (!isWindowOrWebView(webContents)) return

  hookWebContentsEvents(webContents)
  webContents.on('devtools-opened', function () {
    loadDevToolsExtensions(webContents, objectValues(manifestMap))
  })
})

module.exports = {
  // should be removed when we have a typed extensions memory store
  getExtensionById: function (extensionId) {
    const bgExt = backgroundPages[extensionId]

    if (bgExt) {
      return {
        src: bgExt.src,
        backgroundPage: {
          name: bgExt.name,
          html: bgExt.html,
        },
      };
    }

    const manifest = manifestWSMap[extensionId];

    if (manifest) {
      const ext = backgroundPages[manifest.extensionId]

      if (ext) {
        return {
          src: ext.src,
          backgroundPage: {
            name: ext.name,
            html: ext.html,
          },
        };
      }
    }

    return undefined;
  },
  // The public API to add/remove extensions.
  addExtension: function (extensionId, srcDirectory) {
    const manifest = getManifestFromPath(extensionId, srcDirectory)
    if (manifest) {
      loadExtension(manifest)
      for (const webContents of getAllWebContents()) {
        if (isWindowOrWebView(webContents)) {
          loadDevToolsExtensions(webContents, [manifest])
        }
      }
      return manifest.name
    }
  },

  removeExtension: function (id) {
    const manifest = manifestWSMap[id];

    if (!manifest) return
    const { extensionId } = manifest;

    apiHandlersMap[extensionId].release();
    delete apiHandlersMap[extensionId];

    removeBackgroundPages(manifest)
    removeContentScripts(manifest)
    delete manifestMap[manifest.extensionId]
    delete manifestNameMap[manifest.name]
    delete manifestWSMap[id];
  },
}
