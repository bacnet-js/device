
import { BDSingletProperty } from '../../properties/index.js';
import { BDObject, type BDObjectOpts } from '../generic/object.js';
import {
  ObjectType,
  ApplicationTag,
  PropertyIdentifier,
} from '@bacnet-js/client';

export interface BDTimeValueOpts extends BDObjectOpts {
  name: string,
  writable?: boolean,
  description?: string,
  presentValue?: Date,
}

export class BDTimeValue extends BDObject {

  readonly presentValue: BDSingletProperty<ApplicationTag.TIME>;

  constructor(opts: BDTimeValueOpts) {
    super(ObjectType.TIME_VALUE, opts);

    this.presentValue = this.addProperty(new BDSingletProperty(
      PropertyIdentifier.PRESENT_VALUE, ApplicationTag.TIME, opts.writable ?? false, opts.presentValue ?? new Date()));

  }
}
