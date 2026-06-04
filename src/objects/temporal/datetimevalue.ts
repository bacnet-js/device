
import { ObjectType, ApplicationTag } from '@bacnet-js/client';
import { BDTemporalObject, type BDTemporalValueOpts } from './temporal.js';

export interface BDDateTimeValueOpts extends BDTemporalValueOpts {
  name: string,
  writable?: boolean,
  description?: string,
  presentValue?: Date,
}

export class BDDateTimeValue extends BDTemporalObject<ApplicationTag.DATETIME> {

  constructor(opts: BDDateTimeValueOpts) {
    super(ObjectType.DATETIME_VALUE, ApplicationTag.DATETIME, opts);
  }

}
