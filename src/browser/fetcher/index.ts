import { EventEmitter } from 'events';

import {
  IExtension,
  ExtensionStatus,
} from '../../common/types';

import StorageProvider from './storage-provider';
import DownloadProvider from './download-provider';
import InterpreterProvider from './interpreter-provider';
import {
  IFetcherConfig,
  IFetcher,
  IDownloadProvider,
  IStorageProvider,
  IInterpreterProvider,
  MutexStatus,
} from './types';

const defaultConfig: IFetcherConfig = {
  downloader: new DownloadProvider(),
  storager: new StorageProvider(),
  interpreter: new InterpreterProvider(),
  autoUpdateInterval: 300000,
  autoUpdate: false,
};

export default class Fetcher extends EventEmitter implements IFetcher {
  private static instance: Fetcher;

  public storager: IStorageProvider;
  public downloader: IDownloadProvider;
  public interpreter: IInterpreterProvider;

  private mutex: Map<IExtension['id'], MutexStatus>;
  private available: Map<IExtension['id'], IExtension>;

  private autoUpdateLoop: NodeJS.Timer;
  private autoUpdateInterval: number;

  constructor(customConfiguration: Partial<IFetcherConfig> = {}) {
    if (Fetcher.instance) {
      return Fetcher.instance;
    }

    super();

    const configuration = { ...defaultConfig, ...customConfiguration };

    const {
      storager,
      downloader,
      interpreter,
      autoUpdateInterval,
      autoUpdate,
    } = configuration;

    this.storager = storager;
    this.downloader = downloader;
    this.interpreter = interpreter;

    this.autoUpdateInterval = autoUpdateInterval;

    this.available = new Map();
    this.mutex = new Map();

    if (autoUpdate) {
      this.autoUpdateLoop = setInterval(
        this.autoUpdate.bind(this),
        this.autoUpdateInterval
      );
    }

    Fetcher.instance = this;
  }

  public static reset() {
    if (Fetcher.instance) {
      Fetcher.instance.stopAutoUpdate();
      delete Fetcher.instance;
    }
  }

  list() {
    return this.available;
  }

  save(extension: IExtension) {
    this.available.set(extension.id, extension);
  }

  get(extensionId: IExtension['id']) {
    return this.available.get(extensionId);
  }

  hasMutex(extensionId: IExtension['id']) {
    return this.mutex.has(extensionId);
  }

  getMutex(extensionId: IExtension['id']) {
    return this.mutex.get(extensionId);
  }

  async fetch(extensionId: IExtension['id']): Promise<IExtension> {
    if (this.mutex.has(extensionId)) {
      throw new Error(`Extension ${extensionId} is already being used`);
    }

    // todo: check if the extension already exists with this version ?
    // todo: react to errors

    this.mutex.set(extensionId, MutexStatus.Installing);

    const archiveCrx = await this.downloader.downloadById(extensionId);
    const installed = await this.storager.installExtension(archiveCrx);

    await this.downloader.cleanupById(extensionId);

    const fetched = this.interpreter.interpret(installed);

    this.mutex.delete(extensionId);
    this.save(fetched);
    this.emit(ExtensionStatus.Installed, fetched);

    return fetched;
  }

  async update(extensionId: IExtension['id']) {
    const shouldUpdate = await this.checkForUpdate(extensionId);

    if (shouldUpdate) {
      const updated = await this.fetch(extensionId);
      this.emit(ExtensionStatus.Updated, updated);
      return updated;
    }

    return false;
  }

  async checkForUpdate(extensionId: IExtension['id']) {
    const cxInfos = this.available.get(extensionId);

    if (!cxInfos) {
      throw new Error('Unknown extension');
    }

    const updateInfos = await this.downloader.getUpdateInfo(cxInfos);
    const shouldUpdate = this.interpreter.shouldUpdate(cxInfos, updateInfos);

    return shouldUpdate;
  }

  // todo: pause or cancel if CX are being installed ?
  async scanInstalledExtensions() {
    const installedInfos = await this.storager.getInstalledExtension();

    for (const [key, value] of installedInfos) {
      const parsedVersions = Array.from(
        value.keys(),
        (version: string) => InterpreterProvider.parseVersion(version)
      );

      const latestVersion = this.interpreter.sortLastVersion(parsedVersions);
      const install = value.get(latestVersion.number);

      if (install) {
        const cxInfo = this.interpreter.interpret(install);
        this.available.set(key, cxInfo);
        this.emit(ExtensionStatus.Discovered, cxInfo);
      }
    }
  }

  public async autoUpdate() {
    const updates = [];

    for (const extensionId of this.available.keys()) {
      updates.push(this.update(extensionId));
    }

    const updatesResult = await Promise.all(updates);
    return updatesResult.filter(Boolean);
  }

  stopAutoUpdate() {
    clearInterval(this.autoUpdateLoop);
  }
}
