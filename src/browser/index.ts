import { IExtension } from './cx-fetcher/types';
import { ExtensionMap, ManagerConfiguration } from 'src/common/types';
import Fetcher from './cx-fetcher/fetcher';
import { Callback } from 'src/common/apis';
import {
  addExtension as startExtension,
  removeExtension as stopExtension,
} from './chrome-extension';

class ECx {
  public loaded: ExtensionMap;
  private fetcher: Fetcher;
  private onExtensionUpdateListener: Callback<IExtension> | undefined;

  constructor() { this.configuration = {}; }

  set configuration(configuration: ManagerConfiguration) {
    const { fetcher, onUpdate } = configuration;

    this.stop();

    this.fetcher = new Fetcher(fetcher);

    if (onUpdate) {
      this.registerExtensionUpdateListener(onUpdate);
    }
  }

  stop() {
    Fetcher.reset();
    this.unregisterExtensionUpdateListener();
  }

  async load(extensionId: IExtension['id']): Promise<IExtension> {
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

  private registerExtensionUpdateListener(
    callback: Callback<IExtension>
  ): void {
    this.unregisterExtensionUpdateListener();

    this.onExtensionUpdateListener = callback;

    this.fetcher.addListener(
      'chrome-extension-updated',
      this.onExtensionUpdateListener
    );
  }

  private unregisterExtensionUpdateListener(): void {
    if (this.onExtensionUpdateListener) {
      this.fetcher.removeListener(
        'chrome-extension-updated',
        this.onExtensionUpdateListener
      );
    }
  }

  private async get(extensionId: IExtension['id']): Promise<IExtension> {
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
}

export default new ECx();
