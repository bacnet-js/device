
import { ObjectType, ApplicationTag } from '@bacnet-js/client';
import { BDTemporalObject, type BDTemporalValueOpts } from './temporal.js';

export interface BDTimeValueOpts extends BDTemporalValueOpts {
  name: string,
  writable?: boolean,
  description?: string,
  presentValue?: Date,
}

export class BDTimeValue extends BDTemporalObject<ApplicationTag.TIME> {

  constructor(opts: BDTimeValueOpts) {
    super(ObjectType.TIME_VALUE, ApplicationTag.TIME, opts);
  }

}
