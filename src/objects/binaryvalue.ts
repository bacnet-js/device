
import { BDSingletProperty } from '../properties/index.js';
import { BDObject } from './generic/object.js';
import {
  ObjectType,
  ApplicationTag,
  PropertyIdentifier,
  BinaryPV,
} from '@bacnet-js/client';

export interface BDBinaryValueOpts {
  name: string,
  writable: boolean,
  description?: string,
  presentValue?: BinaryPV,
}

export class BDBinaryValue extends BDObject {

  readonly presentValue: BDSingletProperty<ApplicationTag.ENUMERATED, BinaryPV>;

  constructor(opts: BDBinaryValueOpts) {
    super(ObjectType.BINARY_VALUE, opts.name, opts.description);

    this.presentValue = this.addProperty(new BDSingletProperty<ApplicationTag.ENUMERATED, BinaryPV>(
      PropertyIdentifier.PRESENT_VALUE, ApplicationTag.ENUMERATED, opts.writable ?? false, opts.presentValue ?? BinaryPV.INACTIVE));

  }
}
