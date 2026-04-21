
import { BDSingletProperty } from '../properties/index.js';
import { BDObject, type BDObjectOpts } from './generic/object.js';
import {
  ObjectType,
  ApplicationTag,
  PropertyIdentifier,
  BinaryPV,
} from '@bacnet-js/client';

export interface BDBinaryValueOpts extends BDObjectOpts {
  name: string,
  writable: boolean,
  description?: string,
  presentValue?: BinaryPV,
}

export class BDBinaryValue extends BDObject {

  readonly presentValue: BDSingletProperty<ApplicationTag.ENUMERATED, BinaryPV>;

  constructor(opts: BDBinaryValueOpts) {
    super(ObjectType.BINARY_VALUE, opts);

    this.presentValue = this.addProperty(new BDSingletProperty<ApplicationTag.ENUMERATED, BinaryPV>(
      PropertyIdentifier.PRESENT_VALUE, ApplicationTag.ENUMERATED, opts.writable ?? false, opts.presentValue ?? BinaryPV.INACTIVE));

  }
}
