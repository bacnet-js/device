
import assert from 'node:assert';

import {
  BDSingletProperty,
  BDPolledArrayProperty,
  BDPolledSingletProperty,
} from '../properties/index.js';

import { BDObject } from './generic/object.js';

import {
  ObjectType,
  ApplicationTag,
  PropertyIdentifier,
  ErrorClass,
  ErrorCode,
  type BACNetAppData,
} from '@bacnet-js/client';

import { BDError } from '../errors.js';

export interface BDMultiStateValueOpts {
  name: string,
  states: [first: string, ...rest: string[]],
  writable?: boolean,
  description?: string,
  presentValue?: number,
}

export class BDMultiStateValue extends BDObject {

  readonly stateText: BDPolledArrayProperty<ApplicationTag.CHARACTER_STRING>;
  readonly presentValue: BDSingletProperty<ApplicationTag.UNSIGNED_INTEGER>;
  readonly numberOfStates: BDPolledSingletProperty<ApplicationTag.UNSIGNED_INTEGER>;

  constructor(opts: BDMultiStateValueOpts) {

    assert(opts.states.length > 0, 'states array must not be empty');

    super(ObjectType.MULTI_STATE_VALUE, opts.name, opts.description);

    const numberOfStatesValue = opts.states.length;

    this.numberOfStates = this.addProperty(new BDPolledSingletProperty(
      PropertyIdentifier.NUMBER_OF_STATES, ApplicationTag.UNSIGNED_INTEGER, () => numberOfStatesValue));

    const stateTextData: BACNetAppData<ApplicationTag.CHARACTER_STRING>[] = opts.states.map((state) => {
      return { type: ApplicationTag.CHARACTER_STRING, value: state };
    });

    this.stateText = this.addProperty(new BDPolledArrayProperty<ApplicationTag.CHARACTER_STRING>(
      PropertyIdentifier.STATE_TEXT, () => stateTextData));

    this.presentValue = this.addProperty(new BDSingletProperty(
      PropertyIdentifier.PRESENT_VALUE, ApplicationTag.UNSIGNED_INTEGER, opts.writable ?? false, 1));

    this.presentValue.on('beforecov', (prop, data) => {
      if (data.value < 1 || data.value > numberOfStatesValue) {
        throw new BDError('state index out of range', ErrorCode.INCONSISTENT_PARAMETERS, ErrorClass.PROPERTY);
      }
    });

    if (opts.presentValue) {
      this.presentValue.setValue(opts.presentValue);
    }

  }
}
