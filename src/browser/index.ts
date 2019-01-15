import {
  IExtension,
  ExtensionMap,
  ExtensionStatus,
  Callback,
  Configuration,
} from '../common/types';

import Fetcher from './fetcher';
import {
  addExtension as startExtension,
  removeExtension as stopExtension,
} from './chrome-extension';

class ECx {
  public loaded: ExtensionMap;
  private needFirstScan: boolean;
  private fetcher: Fetcher;
  private onExtensionUpdateListener: Callback<IExtension> | undefined;

  constructor() {
    this.loaded = new Map();
    this.needFirstScan = true;
  }

  stop() {
    Fetcher.reset();
    this.unregisterExtensionUpdateListener();
  }

  async setConfiguration(configuration: Configuration = {}): Promise<ECx> {
    const { fetcher, onUpdate } = configuration;

    this.stop();

    this.fetcher = new Fetcher(fetcher);

    if (onUpdate) {
      this.registerExtensionUpdateListener(onUpdate);
    }

    return this;
  }

  async load(extensionId: IExtension['id']): Promise<IExtension> {
    if (this.needFirstScan) {
      await this.fetcher.scanInstalledExtensions();
      this.needFirstScan = false;
    }

    if (this.loaded.has(extensionId)) {
      return this.loaded.get(extensionId)!;
    }

    const extension = await this.get(extensionId);
    const { location: { path } } = extension;

    startExtension(extensionId, path);

    this.loaded.set(extensionId, extension);

    return extension;
  }

  unload(extensionId: IExtension['id']): void {
    if (!this.loaded.has(extensionId)) {
      return;
    }

    stopExtension(extensionId);
  }

  isLoaded(extensionId: IExtension['id']): boolean {
    return this.loaded.has(extensionId);
  }

  async isUpToDate(extensionId: IExtension['id']): Promise<boolean> {
    return !(await this.fetcher.checkForUpdate(extensionId));
  }

  async get(extensionId: IExtension['id']): Promise<IExtension> {
    const installedExtension = this.fetcher.get(extensionId);

    if (installedExtension) {
      const isUpToDate = await this.isUpToDate(extensionId);

      if (isUpToDate) {
        return installedExtension;
      }

      return await this.fetcher.update(extensionId) as IExtension;
    }

    return await this.fetcher.fetch(extensionId);
  }

  private registerExtensionUpdateListener(
    callback: Callback<IExtension>
  ): void {
    this.unregisterExtensionUpdateListener();

    this.onExtensionUpdateListener = callback;

    this.fetcher.addListener(
      ExtensionStatus.Updated,
      this.onExtensionUpdateListener
    );
  }

  private unregisterExtensionUpdateListener(): void {
    if (this.onExtensionUpdateListener) {
      this.fetcher.removeListener(
        ExtensionStatus.Updated,
        this.onExtensionUpdateListener
      );
    }
  }
}

export default new ECx();
