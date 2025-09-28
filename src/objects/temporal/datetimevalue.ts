
import { BDSingletProperty } from '../../properties/index.js';
import { BDObject } from '../generic/object.js';
import {
  ObjectType,
  ApplicationTag,
  PropertyIdentifier,
} from '@bacnet-js/client';

export interface BDDateTimeValueOpts {
  name: string,
  writable?: boolean,
  description?: string,
  presentValue?: Date,
}

export class BDDateTimeValue extends BDObject {

  readonly presentValue: BDSingletProperty<ApplicationTag.DATETIME>;

  constructor(opts: BDDateTimeValueOpts) {
    super(ObjectType.DATETIME_VALUE, opts.name, opts.description);

    this.presentValue = this.addProperty(new BDSingletProperty(
      PropertyIdentifier.PRESENT_VALUE, ApplicationTag.DATETIME, opts.writable ?? false, opts.presentValue ?? new Date()));

  }
}
