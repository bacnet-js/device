
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
    this.#data = { type, value: poll({ date: new Date() }), encoding };
  }

  async getData(ctx?: BDPropertyAccessContext) {
    return Promise.resolve(this.___getData(ctx));  }
  
  async getValue(ctx?: BDPropertyAccessContext): Promise<Type> {
    return (await this.getData()).value;
  }
  
  ___getData(ctx?: BDPropertyAccessContext): BACNetAppData<Tag, Type> {
    this.#data.value = this.#poll(ctx ?? { date: new Date() });
    return this.#data;
  }

  ___readData(index: number, ctx: BDPropertyAccessContext): BACNetAppData | BACNetAppData[] {
    this.#data.value = this.#poll(ctx);
    return this.#data;
  }
  
  async setData() {
    throw new BDError('Cannot set data of polled property', ErrorCode.WRITE_ACCESS_DENIED, ErrorClass.PROPERTY);
  }
  
  async setValue() {
    throw new BDError('Cannot set value of polled property', ErrorCode.WRITE_ACCESS_DENIED, ErrorClass.PROPERTY);
  }
  
  async ___writeData() {
    throw new BDError('Cannot write data of polled property', ErrorCode.WRITE_ACCESS_DENIED, ErrorClass.PROPERTY);
  }
  
}

