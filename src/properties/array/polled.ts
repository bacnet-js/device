
import {
  type ApplicationTagValueTypeMap,
  type BACNetAppData,
  ErrorCode,
  ErrorClass,
  ApplicationTag,
  PropertyIdentifier,
} from '@bacnet-js/client';

import {
  BDAbstractArrayProperty,
} from './abstract.js';

import {
  BDError,
} from '../../errors.js';

import {
  type BDPropertyAccessContext,
} from './../types.js';


/**
 *
 */
export class BDPolledArrayProperty<
  Tag extends ApplicationTag,
  Type extends ApplicationTagValueTypeMap[Tag] = ApplicationTagValueTypeMap[Tag],
> extends BDAbstractArrayProperty<Tag, Type> {

  #poll: (ctx: BDPropertyAccessContext) => BACNetAppData<Tag, Type>[];

  constructor(identifier: PropertyIdentifier, poll: (ctx: BDPropertyAccessContext) => BACNetAppData<Tag, Type>[]) {
    super(identifier);
    this.#poll = poll;
  }

  getData(ctx?: BDPropertyAccessContext) {
    return this.#poll(ctx ?? { date: new Date() });
  }

  async setData() {
    throw new BDError('Cannot set data of polled property', ErrorCode.WRITE_ACCESS_DENIED, ErrorClass.PROPERTY);
  }

  /**
   *
   * @internal
   */
  async ___writeData() {
    throw new BDError('Cannot write data of polled property', ErrorCode.WRITE_ACCESS_DENIED, ErrorClass.PROPERTY);
  }

}
