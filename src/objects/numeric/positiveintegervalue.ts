
import {
  type BDNumericValueOpts,
  BDNumericObject,
} from './numeric.js';

import {
  ApplicationTag,
  ObjectType,
} from '@bacnet-js/client';

export interface BDPositiveIntegerValueOpts extends Omit<BDNumericValueOpts, 'maxPresentValue' | 'minPresentValue' | 'presentValue'> {
  presentValue?: number;
  maxPresentValue?: number;
  minPresentValue?: number;
}

export class BDPositiveIntegerValue extends BDNumericObject<ApplicationTag.UNSIGNED_INTEGER> {
  constructor(opts: BDPositiveIntegerValueOpts) {
    super(ObjectType.POSITIVE_INTEGER_VALUE, ApplicationTag.UNSIGNED_INTEGER, {
      ...opts,
      presentValue: opts.presentValue ?? 0,
      maxPresentValue: opts.maxPresentValue ?? 4_294_967_296,
      minPresentValue: opts.minPresentValue ?? 0,
    });
  }
}
