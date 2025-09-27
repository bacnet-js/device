
import {
  type BDNumericValueOpts,
  BDNumericObject,
} from './numeric.js';

import {
  ApplicationTag,
  ObjectType,
} from '@bacnet-js/client';

export interface BDIntegerValueOpts extends Omit<BDNumericValueOpts, 'maxPresentValue' | 'minPresentValue' | 'presentValue'> {
  presentValue?: number;
  maxPresentValue?: number;
  minPresentValue?: number;
}

export class BDIntegerValue extends BDNumericObject<ApplicationTag.SIGNED_INTEGER> {
  constructor(opts: BDIntegerValueOpts) {
    super(ObjectType.INTEGER_VALUE, ApplicationTag.SIGNED_INTEGER, {
      ...opts,
      presentValue: opts.presentValue ?? 0,
      maxPresentValue: opts.maxPresentValue ?? 2_147_483_647,
      minPresentValue: opts.minPresentValue ?? -2_147_483_648,
    });
  }
}
