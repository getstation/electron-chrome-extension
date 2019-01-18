import { ILocation } from '../../common/types';

export default class Location implements ILocation {
  public path: string;

  constructor(path: string) {
    this.path = path;
  }
}
