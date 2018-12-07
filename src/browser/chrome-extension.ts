import { app, webContents, ipcMain } from 'electron';
import { readFile } from 'fs';
import { lookup } from 'mime-types';
import { join } from 'path';
import { promisify } from 'util';
import { format, parse } from 'url';
import {
  Extension,
  UserScripts,
  ExtensionFS,
  BackgroundPage,
  Script,
  ScriptResource,
  Manifest,
} from '../shared/types';
import {
  ECxChannels,
  Protocol,
  backgroundPageProcessFlag,
  ScriptRuntimeManifest,
} from '../shared/constants';
import { protocolAsScheme } from '../shared/utils';

// --- Utils

const getExtensionById = (
  extensionId: Extension['id']
): Extension | undefined =>
  loadedExtensions.has(extensionId) ?
    loadedExtensions.get(extensionId) : undefined;

const getManifestContent = async (src: string): Promise<string> => {
  try {
    return String(await promisify(readFile)(join(src, 'manifest.json')));
  } catch (e) {
    console.warn(`Reading ${join(src, 'manifest.json')}`);
    console.warn(e.stack || e);
    throw e
  }
}

const parseManifest = (src: string, serializedManifest: string): Manifest => {
  try {
    return JSON.parse(serializedManifest)
  } catch (e) {
    console.warn(`Parsing ${join(src, 'manifest.json')} failed.`)
    console.warn(e.stack || e)
    throw e
  }
}

const jsScriptsAsHtmlPage = (scripts: string[]): Buffer => {
  return Buffer.from(
    `<html>
      <body>
        ${
    scripts
      .map((relativeFilePath: string) =>
        `<script src="${relativeFilePath}"></script>`)
      .join('')
    }
      </body>
    </html>`
  );
}

// Prevent from colliding with Electron IDs
// (main process and its own isolated world)
const counterStart = 1000;
const isolatedWorlds = new Map<Extension['id'], number>();

const getIsolatedWorldId = (extensionId: Extension['id']): number => {
  return isolatedWorlds.has(extensionId) ?
    isolatedWorlds.get(extensionId)! :
    isolatedWorlds.set(extensionId, counterStart + isolatedWorlds.size + 1)
      .get(extensionId)!;
}

// --- ECx

const loadedExtensions = new Map<Extension['id'], Extension>();
// Prevent from GC
const backgroundPages = new Map<Extension['id'], Electron.WebContents>();

const getExtensionFromFilesystem = async (
  dir: string,
  id: Extension['id']
): Promise<ExtensionFS> => {
  const src = join(dir, id);
  const serializedManifest = await getManifestContent(src) as string;
  const manifest = await parseManifest(src, serializedManifest);

  return {
    id,
    manifest,
    src,
  }
}

const getBackgroundPage = async (
  { id, src, manifest: { background: { page, scripts } } }: ExtensionFS
): Promise<BackgroundPage> => {
  const name = page ? page : '_generated_background_page.html';
  const html = page ?
    await promisify(readFile)(join(src, page)) :
    jsScriptsAsHtmlPage(scripts);

  // @ts-ignore : create
  const contents = webContents.create({
    partition: `persist:__chrome_extension:${id}`,
    isBackgroundPage: true,
    commandLineSwitches: [
      backgroundPageProcessFlag,
      `--preload=${join(__dirname, '../../preload.js')}`
    ]
  });

  // Calling setTimeout allows us to bypass the following issue:
  // https://bugs.chromium.org/p/chromium/issues/detail?id=822966
  setTimeout(() => {
    contents.loadURL(
      format({
        protocol: Protocol.Extension,
        slashes: true,
        hostname: id,
        pathname: name,
      })
    )
  }, 500);

  contents.on(
    'did-fail-load',
    (_: any, errorCode: string, errorDescription: string) =>
      console.warn(`Background page failed to load: ${errorCode} ${errorDescription}`)
  );

  backgroundPages.set(id, contents);

  return {
    html,
    name,
    webContentsId: contents.id,
  }
}

const getUserScripts = async (extension: ExtensionFS): Promise<UserScripts> => {
  const {
    id,
    src,
    manifest: { name, content_security_policy, content_scripts },
  } = extension;

  const asScriptResource = async (
    relativePath: string
  ): Promise<ScriptResource> => ({
    url: `${Protocol.Extension}://${id}${relativePath}`,
    code: String(await promisify(readFile)(join(src, relativePath))),
  });

  const contentScriptToUserScripts = async (
    script: Script<string>
  ): Promise<Script<ScriptResource>> => {
    const { matches, exclude_matches, js, css, run_at } = script;

    return {
      matches,
      exclude_matches,
      js: js ? await Promise.all(js.map(asScriptResource)) : [],
      css: css ? await Promise.all(css.map(asScriptResource)) : [],
      run_at: run_at || ScriptRuntimeManifest.DocumentIdle,
    }
  }

  // @ts-ignore
  return {
    isolatedWorlId: getIsolatedWorldId(id),
    humanName: name,
    contentSecurityPolicy: content_security_policy
      || "script-src 'self'; object-src 'self'",
    contentSecurityOrigin: `${Protocol.Extension}://${id}`,
    scripts: await Promise.all(content_scripts.map(contentScriptToUserScripts)),
  }
}

const loadExtension = async (
  dir: string,
  extensionId: Extension['id']
): Promise<Extension['manifest']['name'] | undefined> => {
  const extensionFs = await getExtensionFromFilesystem(dir, extensionId);
  const { manifest: { name, background, content_scripts } } = extensionFs;

  if (!extensionFs) return;

  const backgroundPage = background ?
    await getBackgroundPage(extensionFs) : undefined;
  const userScripts = content_scripts ?
    await getUserScripts(extensionFs) : undefined;

  const extension = {
    ...extensionFs,
    backgroundPage,
    userScripts
  };

  loadedExtensions.set(extensionId, extension);

  ipcMain.emit(ECxChannels.OnExtensionLoaded, extension);

  return name;
};

const unloadExtension = (extensionId: Extension['id']) => {
  const extension = getExtensionById(extensionId);

  if (extension) {
    const { backgroundPage } = extension;

    if (backgroundPage) {
      const { webContentsId } = backgroundPage;
      destroyWebContents(webContentsId);
      backgroundPages.delete(extensionId);
    }

    ipcMain.emit(ECxChannels.OnExtensionUnloaded, extension);

    loadedExtensions.delete(extensionId);
  }
};

// --- Glue between Electron and ECx

const onCreateRenderer = (event: any) =>
  event.returnValue = Array.from(loadedExtensions.values());

ipcMain.on(ECxChannels.OnCreateRenderer, onCreateRenderer);
ipcMain.on(
  ECxChannels.GetExtension,
  (event: any, id: string) => event.returnValue = loadedExtensions.get(id)
);

const protocolHandler = (
  request: Electron.RegisterBufferProtocolRequest,
  callback: Function
) => {
  const { hostname, pathname } = parse(request.url);
  if (!hostname || !pathname) return callback();

  // Detect if we are in the scope of one of the loaded extensions
  const extension = getExtensionById(hostname);
  if (!extension) return callback();

  // Detect and return the background page of the HTML file
  if (extension.backgroundPage
    && `/${extension.backgroundPage.name}` === pathname) {
    return callback({
      mimeType: 'text/html',
      data: extension.backgroundPage.html,
    })
  }

  // After check permissions (todo) return the file from the user's filesystem
  readFile(
    join(extension.src, pathname),
    (err, content) => {
      if (err) {
        return callback(-6)  // FILE_NOT_FOUND
      } else {
        const mimeType = lookup(pathname);
        if (mimeType) {
          return callback({
            mimeType,
            data: content,
          });
        }
        return callback(content);
      }
    }
  );
}

// --- Electron

const destroyWebContents = (webContentsId: Electron.WebContents['id']) => {
  const wc = webContents.fromId(webContentsId);
  // @ts-ignore : destroy
  if (wc && !wc.isDestroyed()) wc.destroy();
}

// @ts-ignore : bad type definition for listener
app.on('session-created', (session) => {
  if (Protocol.Extension === Protocol.ExtensionDefault) {
    // @ts-ignore : bad type definition for listener
    session.protocol.unregisterProtocol(
      protocolAsScheme(Protocol.ExtensionDefault)
    );
  }
  // @ts-ignore : bad type definition for listener
  session.protocol.registerBufferProtocol(
    protocolAsScheme(Protocol.Extension),
    protocolHandler,
    (error: any) => {
      if (error) {
        console.error(`Unable to register ${Protocol.Extension} protocol: ${error}`)
      }
    }
  );
})

export default {
  loadExtension,
  unloadExtension,
}
