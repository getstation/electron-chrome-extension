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
        updateUrl,
        version,
      },
    } = installedCx;
    const parsedVersion = CxInterpreterProvider.parseVersion(version);

    return {
      id,
      location,
      version: parsedVersion,
      updateUrl,
    };
  }

  // Check against update data if a given extension should be updated
  shouldUpdate(extension: IExtension, updateInfos: IUpdate) {
    const parsedUpdates = this.readUpdateManifest(updateInfos.xml);
    const cxUpdateCheck = this.findCxUpdate(extension.id, parsedUpdates);

    if (!cxUpdateCheck) return false;

    const newVersion = this.getNewVersion(cxUpdateCheck);

    // If new version is greater than the current one
    if (this.greaterThan(newVersion, extension.version)) {
      return true;
    }

    return false;
  }

  // Sort the highest IVersion in an array of IVersion
  sortLastVersion(versions: IVersion[]) {
    const noVersion = { number: '', parsed: [] };
    const highest = versions.reduce((previous, value) => {
      const greater = this.greaterThan(value, previous);
      if (greater) return value;
      return previous;
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
    const updates = parsedUpdates.elements[0].elements;

    for (const update of updates) {
      if (extensionId === update.attributes.appid) {
        return update;
      }
    }

    return false;
  }

  // Extract version from an extension update data
  private getNewVersion(cxUpdateCheck: any): IVersion {
    // TODO : Make it safer
    const version = cxUpdateCheck.elements[0].attributes.version;
    return CxInterpreterProvider.parseVersion(version);
  }

  // Compare if the first argument is greater than the second
  private greaterThan(a: IVersion, b: IVersion) {
    const x = a.parsed;
    const y = b.parsed;
    // Compare each digit of the version
    for (let i = 0; i < x.length; i = i + 1) {
      // The order of the rules is important
      if (!y[i]) return false;        // If B[i] has no value when A[i] has at least one, A is higher
      if (x[i] < y[i]) return false;  // If A[i] is lower than B[i], then A is not higher
      if (x[i] > y[i]) return true;   // If A[i] is higher than B[i], then A is higher
      // If none of the rules returned, then the numbers are equal, go to the next step
    }
    return false;
  }
}

export default CxInterpreterProvider;
