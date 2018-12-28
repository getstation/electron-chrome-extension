import { xml2js } from 'xml-js';
import {
  IInterpreterProvider,
  IVersion,
  IExtension,
  IInstall,
  IUpdate,
} from './types';

export default class InterpreterProvider implements IInterpreterProvider {
  public static parseVersion(version: string) {
    const split = version.split('.');
    const parsed = split.map((elem: string) => parseInt(elem, 10));

    return {
      number: version,
      parsed,
    };
  }

  interpret(installed: IInstall) {
    const {
      id,
      location,
      manifest: {
        update_url,
        version,
      },
    } = installed;

    const parsedVersion = InterpreterProvider.parseVersion(version);

    return {
      id,
      location,
      version: parsedVersion,
      updateUrl: update_url,
    };
  }

  shouldUpdate(extension: IExtension, updateInfos: IUpdate) {
    const parsedUpdates = this.readUpdateManifest(updateInfos.xml);
    const updateCheck = this.findUpdate(extension.id, parsedUpdates);

    if (!updateCheck) {
      return false;
    }

    const newVersion = this.getNewVersion(updateCheck);

    return this.greaterThan(newVersion, extension.version);
  }

  sortLastVersion(versions: IVersion[]) {
    const noVersion = { number: '', parsed: [] };
    const highest = versions.reduce(
      (previous, value) => {
        const greater = this.greaterThan(value, previous);
        return (greater) ? value : previous;
      },
      noVersion
    );

    if (highest === noVersion) {
      throw new Error('No versions could be read and found');
    }

    return highest;
  }

  private readUpdateManifest(xml: string): object {
    return xml2js(xml, { compact: false });
  }

  // todo: Improve the "any"
  private findUpdate(extensionId: IExtension['id'], parsedUpdates: any): any {
    const updates = this.getNested(parsedUpdates, ['elements', '0', 'elements']);
    if (!updates) return undefined;

    for (const update of updates) {
      if (extensionId === update.attributes.appid) {
        return update;
      }
    }

    return undefined;
  }

  private getNewVersion(updateCheck: any): IVersion {
    const version = this.getNested(
      updateCheck, ['elements', '0', 'attributes', 'version']
    );

    if (!version) {
      throw new Error('No version found in the update manifest');
    }

    return InterpreterProvider.parseVersion(version);
  }

  private greaterThan(a: IVersion, b: IVersion) {
    const x = a.parsed;
    const y = b.parsed;
    // Compare each digit of the version
    for (let i = 0; i < x.length; i = i + 1) {
      // The order of the rules is important
      if (isNaN(x[i])) return false;        // If A[i] is not a number, then A cannot be higher or whatever
      if (y[i] === undefined) return true;  // If B[i] has no value when A[i] has one, A is higher
      if (x[i] < y[i]) return false;        // If A[i] is lower than B[i], then A is not higher
      if (x[i] > y[i]) return true;         // If A[i] is higher than B[i], then A is higher
      // If none of the rules returned, then the numbers are equal, go to the next step
    }
    return false;
  }

  private getNested(nestedObj: object, pathArr: string[]) {
    return pathArr.reduce(
      (obj, key) => {
        return (obj && obj[key]) ? obj[key] : undefined;
      },
      nestedObj
    );
  }
}
