import { app, Session, protocol, webContents } from 'electron';
import { readFile } from 'fs';
import { lookup } from 'mime-types';
import { join } from 'path';
import { promisify } from 'util';
import { format } from 'url';
import { Protocol, Extension, UserScripts, ExtensionFS, BackgroundPage, backgroundPageProcessFlag } from 'src/shared/types';

// --- Utils

const getExtensionById = (extensionId: Extension['id']): Extension | undefined =>
  loadedExtensions.has(extensionId) ?
    loadedExtensions.get(extensionId) : undefined;

const getManifestContent = async (src: string): Promise<string | Buffer> => {
  try {
    return await promisify(readFile)(join(src, 'manifest.json'));
  } catch (e) {
    console.warn(`Reading ${join(src, 'manifest.json')}`);
    console.warn(e.stack || e);
    throw e
  }
}

const parseManifest = (src: string, serializedManifest: string) => {
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

// Prevent from colliding with Chrome IDs
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
  id: Extension['id'],
  src: string
): Promise<ExtensionFS> => {
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
  // @ts-ignore : create
  const contents = webContents.create({
    partition: `persist:__chrome_extension:${id}`,
    isBackgroundPage: true,
    commandLineSwitches: [
      backgroundPageProcessFlag,
      `--preload=${join(__dirname, '../../preload.js')}`
    ]
  });

  const name = page ? page : '_generated_background_page.html';
  const html = page ? (await promisify(readFile)(join(src, page))) : jsScriptsAsHtmlPage(scripts);

  contents.loadURL(
    format({
      protocol: Protocol.Extension,
      slashes: true,
      hostname: id,
      pathname: name,
    })
  );

  backgroundPages.set(id, contents);

  return {
    html,
    name,
    webContentsId: contents.id,
  }
}

const getUserScripts = (extension: ExtensionFS): UserScripts => {
  const { id, manifest: { name, content_security_policy } } = extension;

  return {
    isolatedWorlId: getIsolatedWorldId(id),
    humanName: name,
    contentSecurityPolicy: content_security_policy
      || "script-src 'self'; object-src 'self'",
    contentSecurityOrigin: `${Protocol.Extension}://${id}`,
    scripts: [],
  }
}

const loadExtension = async (dir: string, extensionId: Extension['id']): Promise<Extension['manifest']['name']> => {
  const extensionFs = await getExtensionFromFilesystem(dir, extensionId);
  const { manifest: { name, background, content_scripts } } = extensionFs;

  if (!extensionFs) return;

  const backgroundPage = background ?
    await getBackgroundPage(extensionFs) : undefined;
  const userScripts = getUserScripts(extensionFs);

  const extension = {
    ...extensionFs,
    backgroundPage,
    userScripts
  };

  loadedExtensions.set(extensionId, extension);

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

    // unloadUserScripts(extension); in the renderer

    loadedExtensions.delete(extensionId);
  }
};

// --- Glue between Electron and ECx

const protocolHandler = (
  request: Electron.RegisterBufferProtocolRequest,
  callback: Function
) => {
  const { hostname, pathname } = new URL(request.url);
  if (!hostname || !pathname) return callback();

  // Detect if we are in the scope of one of the loaded extensions
  const extension = getExtensionById(hostname);
  if (!extension) return callback();

  // Detect and return the background page of the HTML file
  if (extension.backgroundPage && extension.backgroundPage.name === pathname) {
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

protocol.registerStandardSchemes([Protocol.Extension], { secure: true });

// @ts-ignore : session-created
app.on('session-created', (session: Session) => {
  if (Protocol.Extension === Protocol.ExtensionDefault) {
    session.protocol.unregisterProtocol(Protocol.ExtensionDefault);
  }
  session.protocol.registerBufferProtocol(
    Protocol.Extension,
    protocolHandler,
    function (error) {
      if (error) {
        console.error(`Unable to register ${Protocol.Extension} protocol: ${error}`)
      }
    })
})


// renderer-created Extension[]
// extension-loaded Extension
// extension-unloaded Extension

export default {
  loadExtension,
  unloadExtension,
}
