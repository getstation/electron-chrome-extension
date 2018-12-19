import * as xmlConvert from 'xml-js';
import {
  CxInterpreterProviderInterface,
  UpdateDescriptor,
  InstallDescriptor,
  CxInfos,
} from './types';

class CxInterpreterProvider implements CxInterpreterProviderInterface {
  constructor() {

  }

  // TODO : Do I really need to put undefined here ?
  interpret(installedCx: InstallDescriptor | undefined) {
    if (! installedCx) throw new Error('No installation descriptor given');

    // Build understandable info for the CxManager
    const cxInfos = {
      path: installedCx.path,
      version: installedCx.manifest.version,
      update_url: installedCx.manifest.update_url,
    };

    return cxInfos;
  }

  shouldUpdate(extensionId: string, cxInfos: CxInfos, updateInfos: UpdateDescriptor) {
    const parsedUpdates = this.readUpdateManifest(updateInfos.xml);
    const cxUpdateCheck = this.findCxUpdate(extensionId, parsedUpdates);

    if (!cxUpdateCheck) return false;

    const newVersion = this.getNewVersion(cxUpdateCheck);

    // If new version is greater than the current one
    if (this.gt(newVersion, cxInfos.version)) {
      return true;
    }

    return false;
  }

  sortLastVersion(versions: string[]) {
    let highest = undefined;
    // Loop through all versions
    for (const current of versions) {
      try {
        // If no highest already defined, define one  // TODO : Fix the first highest problem
        if (! highest) highest = current;
        else if (this.gt(current, highest)) {
          highest = current;
        }
      } catch (err) {
        continue;
      }
    }

    if (!highest) throw new Error('No versions could be read and found');
    return highest;
  }

  // Parse the xml manifest and return a json object
  private readUpdateManifest(xml: string): object {
    return xmlConvert.xml2js(xml, { compact: false });
  }

  // TODO : Improve the "any"
  // Find the extensionId related update data (a manifest can reference many different extension updates)
  private findCxUpdate(extensionId: string, parsedUpdates: any): any {
    const updates = parsedUpdates.elements[0].elements;
    updates.forEach((update: any) => {
      if (extensionId === update.attributes.appid) {
        return update;
      }
    });

    return false;
  }

  // Extract version from an extension update data
  private getNewVersion(cxUpdateCheck: any): string {
    return cxUpdateCheck.elements[0].attributes.version;
  }

  // TODO : update this
  private gt(a: number[] | string, b: number[] | string) {
    // Convert if need be
    const x = ('string' === typeof a) ? this.parseVersion(a) : a;
    const y = ('string' === typeof b) ? this.parseVersion(b) : b;
    // Compare
    for (let i = 0; i < x.length; i = i + 1) {
      if (x[i] < y[i]) return false;
      if (x[i] > y[i]) return true;
    }
    return false;
  }

  // TODO : Update this
  private parseVersion(version:string) {
    const split = version.split('.');
    return split.map((elem: string) => parseInt(elem, 10));
  }
}

export default CxInterpreterProvider;
