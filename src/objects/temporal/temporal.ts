
import { BDSingletProperty } from '../../properties/index.js';
import { BDPresentValueSingletProperty } from '../../properties/singlet/presentvalue.js';
import { BDObject, type BDObjectOpts } from '../generic/object.js';
import {
  ObjectType,
  ApplicationTag,
  PropertyIdentifier,
  type BACNetObjectID,
} from '@bacnet-js/client';

export interface BDTemporalValueOpts extends BDObjectOpts {
  name: string,
  writable?: boolean,
  description?: string,
  presentValue?: Date,
}

export type BDTemporalApplicationTag =
  | ApplicationTag.TIME
  | ApplicationTag.DATE
  | ApplicationTag.DATETIME
;

export class BDTemporalObject<Tag extends BDTemporalApplicationTag> extends BDObject {

  readonly presentValue: BDSingletProperty<Tag>;

  constructor(type: ObjectType, tag: Tag, opts: BDTemporalValueOpts) {
    super(type, opts);

    this.presentValue = this.addProperty(opts.writable
      ? new BDPresentValueSingletProperty<Tag>(
          PropertyIdentifier.PRESENT_VALUE,
          tag,
          true,
          opts.presentValue,
        )
      : new BDSingletProperty<Tag>(
          PropertyIdentifier.PRESENT_VALUE,
          tag,
          false,
          opts.presentValue,
        )
    );

  }
}
