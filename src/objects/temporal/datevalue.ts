
import { ObjectType, ApplicationTag } from '@bacnet-js/client';
import { BDTemporalObject, type BDTemporalValueOpts } from './temporal.js';

export interface BDDateValueOpts extends BDTemporalValueOpts {
  name: string,
  writable?: boolean,
  description?: string,
  presentValue?: Date,
}

export class BDDateValue extends BDTemporalObject<ApplicationTag.DATE> {

  constructor(opts: BDDateValueOpts) {
    super(ObjectType.DATE_VALUE, ApplicationTag.DATE, opts);
  }

}
