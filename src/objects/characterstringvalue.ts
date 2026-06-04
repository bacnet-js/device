
import { BDSingletProperty } from '../properties/index.js';
import { BDPresentValueSingletProperty } from '../properties/singlet/presentvalue.js';
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

    this.presentValue = this.addProperty(opts.writable
      ? new BDPresentValueSingletProperty(
          PropertyIdentifier.PRESENT_VALUE,
          ApplicationTag.CHARACTER_STRING,
          true,
          opts.presentValue ?? '',
          CharacterStringEncoding.UTF_8,
        )
      : new BDSingletProperty(
          PropertyIdentifier.PRESENT_VALUE,
          ApplicationTag.CHARACTER_STRING,
          false,
          opts.presentValue ?? '',
          CharacterStringEncoding.UTF_8,
        )
    );

  }
}
