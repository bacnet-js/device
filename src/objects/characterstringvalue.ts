
import { BDSingletProperty } from '../properties/index.js';
import { BDObject, type BDObjectOpts } from './generic/object.js';
import {
  ObjectType,
  ApplicationTag,
  PropertyIdentifier,
  CharacterStringEncoding,
} from '@bacnet-js/client';

export interface BDCharacterStringValueOpts extends BDObjectOpts {
  name: string,
  writable?: boolean,
  description?: string,
  presentValue?: string,
}

export class BDCharacterStringValue extends BDObject {

  readonly presentValue: BDSingletProperty<ApplicationTag.CHARACTER_STRING>;

  constructor(opts: BDCharacterStringValueOpts) {
    super(ObjectType.CHARACTERSTRING_VALUE, opts);

    this.presentValue = this.addProperty(new BDSingletProperty(
      PropertyIdentifier.PRESENT_VALUE, ApplicationTag.CHARACTER_STRING, opts.writable ?? false, opts.presentValue ?? '', CharacterStringEncoding.UTF_8));

  }
}
