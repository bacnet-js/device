
import { BDSingletProperty } from '../../properties/index.js';
import { BDObject, type BDObjectOpts } from '../generic/object.js';
import {
  ObjectType,
  ApplicationTag,
  PropertyIdentifier,
} from '@bacnet-js/client';

export interface BDDateValueOpts extends BDObjectOpts {
  name: string,
  writable?: boolean,
  description?: string,
  presentValue?: Date,
}

export class BDDateValue extends BDObject {

  readonly presentValue: BDSingletProperty<ApplicationTag.DATE>;

  constructor(opts: BDDateValueOpts) {
    super(ObjectType.DATE_VALUE, opts);

    this.presentValue = this.addProperty(new BDSingletProperty(
      PropertyIdentifier.PRESENT_VALUE, ApplicationTag.DATE, opts.writable ?? false, opts.presentValue ?? new Date()));

  }
}
