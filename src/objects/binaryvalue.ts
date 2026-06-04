
import { BDSingletProperty } from '../properties/index.js';
import { BDPresentValueSingletProperty } from '../properties/singlet/presentvalue.js';
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

    this.presentValue = this.addProperty(opts.writable
      ? new BDPresentValueSingletProperty<ApplicationTag.ENUMERATED, BinaryPV>(
        PropertyIdentifier.PRESENT_VALUE,
        ApplicationTag.ENUMERATED,
        true,
        opts.presentValue ?? BinaryPV.INACTIVE,
        )
      : new BDSingletProperty<ApplicationTag.ENUMERATED, BinaryPV>(
        PropertyIdentifier.PRESENT_VALUE,
        ApplicationTag.ENUMERATED,
        false,
        opts.presentValue ?? BinaryPV.INACTIVE,
        )
    );
  }
}
