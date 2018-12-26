import { xml2js } from 'xml-js';
import {
  CxInterpreterProviderInterface,
  IVersion,
  IExtension,
  IInstall,
  IUpdate,
} from './types';

class CxInterpreterProvider implements CxInterpreterProviderInterface {
  // Create an IVersion from a version represented in a string
  public static parseVersion(version:string) {
    const split = version.split('.');
    const parsed = split.map((elem: string) => parseInt(elem, 10));
    return {
      number: version,
      parsed,
    };
  }

  // Transform an Installation (from the CxStorage) into a registerable IExtension
  interpret(installedCx: IInstall) {
    const {
      id,
      location,
      manifest: {
        update_url,
        version,
      },
    } = installedCx;
    const parsedVersion = CxInterpreterProvider.parseVersion(version);

    return {
      id,
      location,
      version: parsedVersion,
      updateUrl: update_url,
    };
  }

  // Check against update data if a given extension should be updated
  shouldUpdate(extension: IExtension, updateInfos: IUpdate) {
    const parsedUpdates = this.readUpdateManifest(updateInfos.xml);
    const cxUpdateCheck = this.findCxUpdate(extension.id, parsedUpdates);

    if (!cxUpdateCheck) {
      return false;
    }

    const newVersion = this.getNewVersion(cxUpdateCheck);
    return this.greaterThan(newVersion, extension.version);
  }

  // Sort the highest IVersion in an array of IVersion
  sortLastVersion(versions: IVersion[]) {
    const noVersion = { number: '', parsed: [] };
    const highest = versions.reduce((previous, value) => {
      const greater = this.greaterThan(value, previous);
      return (greater) ? value : previous;
    }, noVersion);

    if (highest === noVersion) {
      throw new Error('No versions could be read and found');
    }

    return highest;
  }

  // Parse the xml manifest and return a json object
  private readUpdateManifest(xml: string): object {
    return xml2js(xml, { compact: false });
  }

  // TODO : Improve the "any"
  // Find the extensionId related update data (a manifest can reference many different extension updates)
  private findCxUpdate(extensionId: IExtension['id'], parsedUpdates: any): any {
    // was this before : parsedUpdates.elements[0].elements;
    const updates = this.getNested(parsedUpdates, ['elements', '0', 'elements']);
    if (!updates) return undefined;

    for (const update of updates) {
      if (extensionId === update.attributes.appid) {
        return update;
      }
    }

    return undefined;
  }

  // Extract version from an extension update data
  private getNewVersion(cxUpdateCheck: any): IVersion {
    // was this before : cxUpdateCheck.elements[0].attributes.version;
    const version = this.getNested(cxUpdateCheck, ['elements', '0', 'attributes', 'version']);
    if (!version) {
      throw new Error('No version found in the update manifest');
    }
    return CxInterpreterProvider.parseVersion(version);
  }

  // Compare if the first argument is greater than the second
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
    return pathArr.reduce((obj, key) =>
      (obj && obj[key]) ? obj[key] : undefined,
      nestedObj
    );
  }
}

export default CxInterpreterProvider;
