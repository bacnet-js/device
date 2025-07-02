
import { 
  type BDNumericValueOpts,
  BDNumericObject,
} from './numeric.js';

import { 
  ApplicationTag,
  ObjectType,
} from '@bacnet-js/client';

export interface BDAnalogValueOpts extends Omit<BDNumericValueOpts, 'maxPresentValue' | 'minPresentValue' | 'presentValue'> {
  presentValue?: number;
  maxPresentValue?: number;
  minPresentValue?: number;
}

export type BDAnalogValueObjectType =
  | ObjectType.ANALOG_VALUE
  | ObjectType.ANALOG_INPUT
  | ObjectType.ANALOG_OUTPUT;

export class BDAnalogValue extends BDNumericObject<ApplicationTag.REAL> { 
  constructor(instance: number, opts: BDAnalogValueOpts, type: BDAnalogValueObjectType = ObjectType.ANALOG_VALUE) {
    super({ type, instance }, ApplicationTag.REAL, {
      ...opts,
      presentValue: opts.presentValue ?? 0,
      maxPresentValue: opts.maxPresentValue ?? Number.MAX_SAFE_INTEGER,
      minPresentValue: opts.minPresentValue ?? Number.MIN_SAFE_INTEGER,
    });
  }
}
