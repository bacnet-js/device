
import {
  type ApplicationTagValueTypeMap,
  type BACNetAppData,
  type PropertyIdentifier,
  type CharacterStringEncoding,
  ErrorCode,
  ErrorClass,
  ApplicationTag,
} from '@bacnet-js/client';

import { BDError } from '../../errors.js';
import { BDAbstractSingletProperty } from './abstract.js';
import { type BDPropertyAccessContext } from '../types.js';





export class BDPolledSingletProperty<
  Tag extends ApplicationTag,
  Type extends ApplicationTagValueTypeMap[Tag] = ApplicationTagValueTypeMap[Tag],
> extends BDAbstractSingletProperty<Tag, Type> {

  #poll: (ctx: BDPropertyAccessContext) => Type;
  #data: BACNetAppData<Tag, Type>;

  constructor(identifier: PropertyIdentifier, type: Tag, poll: (ctx: BDPropertyAccessContext) => Type, encoding?: CharacterStringEncoding) {
    super(identifier);
    this.#poll = poll;
    // The cast `undefined as any` is there because the value is not yet known
    // at instantiation time and the TS compiler (rightfully) complains about
    // the type mismatch. However, it is safe to do so because the value will be
    // set via the poll function every time the property is read.
    this.#data = { type, value: undefined as any, encoding };
  }

  getData(ctx?: BDPropertyAccessContext) {
    this.#data.value = this.#poll(ctx ?? { date: new Date() });
    return this.#data;
  }

  getValue(ctx?: BDPropertyAccessContext): Type {
    return this.getData(ctx).value;
  }

  /**
   *
   * @internal
   */  ___readData(index: number, ctx: BDPropertyAccessContext): BACNetAppData | BACNetAppData[] {
    return this.getData(ctx);
  }

  async setData() {
    throw new BDError('Cannot set data of polled property', ErrorCode.WRITE_ACCESS_DENIED, ErrorClass.PROPERTY);
  }

  async setValue() {
    throw new BDError('Cannot set value of polled property', ErrorCode.WRITE_ACCESS_DENIED, ErrorClass.PROPERTY);
  }

  /**
   *
   * @internal
   */
  async ___writeData() {
    throw new BDError('Cannot write data of polled property', ErrorCode.WRITE_ACCESS_DENIED, ErrorClass.PROPERTY);
  }

}
