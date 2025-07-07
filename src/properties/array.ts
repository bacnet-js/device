
/**
 * BACnet array property implementation module
 * 
 * This module provides the implementation for BACnet properties
 * that contain multiple values in an array.
 * 
 * @module
 */

import {
  type ApplicationTagValueTypeMap,
  type BACNetAppData,
  ErrorCode,
  ErrorClass,
  ApplicationTag,
  PropertyIdentifier,
} from '@bacnet-js/client';
 
import { BDError } from '../errors.js';
import { BDAbstractProperty } from './abstract.js';
import { BDPropertyType, type BDPropertyAccessContext } from './types.js';

import { MAX_ARRAY_INDEX } from '../constants.js';


export abstract class BDAbstractArrayProperty<
  Tag extends ApplicationTag, 
  Type extends ApplicationTagValueTypeMap[Tag]
> extends BDAbstractProperty<Tag, Type, BACNetAppData<Tag, Type>[]> {

  declare readonly type: BDPropertyType.ARRAY;
  
  constructor(identifier: PropertyIdentifier) {
    super(BDPropertyType.ARRAY, identifier);
    this.type = BDPropertyType.ARRAY;
  }
  
  abstract ___getData(ctx: BDPropertyAccessContext): BACNetAppData<Tag, Type>[];
  abstract ___setData(data: BACNetAppData<Tag, Type>[]): Promise<void>;
  
  ___readData(index: number, ctx: BDPropertyAccessContext): BACNetAppData<ApplicationTag.UNSIGNED_INTEGER> | BACNetAppData<Tag, Type> | BACNetAppData<Tag, Type>[] {
    const data = this.___getData(ctx);
    if (index === 0) {
      return { type: ApplicationTag.UNSIGNED_INTEGER, value: data.length };
    }
    if (index === MAX_ARRAY_INDEX){
      return data;
    }
    if (index > data.length) {
      throw new BDError('index out of range', ErrorCode.INVALID_ARRAY_INDEX, ErrorClass.PROPERTY);
    }
    return data[index - 1];
  }
  
}

export class BDPolledArrayProperty<
  Tag extends ApplicationTag, 
  Type extends ApplicationTagValueTypeMap[Tag] = ApplicationTagValueTypeMap[Tag],
> extends BDAbstractArrayProperty<Tag, Type> { 
  
  #poll: (ctx: BDPropertyAccessContext) => BACNetAppData<Tag, Type>[];
  
  constructor(identifier: PropertyIdentifier, poll: (ctx: BDPropertyAccessContext) => BACNetAppData<Tag, Type>[]) {
    super(identifier);
    this.#poll = poll;
  }

  async getData(ctx?: BDPropertyAccessContext) {
    return this.___queue.run(async () => this.___getData(ctx))
  }
  
  ___getData(ctx?: BDPropertyAccessContext): BACNetAppData<Tag, Type>[] {
    return this.#poll(ctx ?? { date: new Date() });
  }
  
  async ___setData() {
    throw new BDError('Cannot set data of polled property', ErrorCode.WRITE_ACCESS_DENIED, ErrorClass.PROPERTY);
  }
  
  async setData() {
    throw new BDError('Cannot set data of polled property', ErrorCode.WRITE_ACCESS_DENIED, ErrorClass.PROPERTY);
  }
  
  async ___writeData() { 
    throw new BDError('Cannot write data of polled property', ErrorCode.WRITE_ACCESS_DENIED, ErrorClass.PROPERTY);
  }
  
}

export class BDArrayProperty<
  Tag extends ApplicationTag, 
  Type extends ApplicationTagValueTypeMap[Tag] = ApplicationTagValueTypeMap[Tag],
> extends BDAbstractArrayProperty<Tag, Type> { 
  
  readonly #writable: boolean;
  
  #data: BACNetAppData<Tag, Type>[];
  
  constructor(identifier: PropertyIdentifier, writable: boolean, data: BACNetAppData<Tag, Type>[]) {
    super(identifier);
    this.#data = data;
    this.#writable = writable;
  }

  async getData(ctx?: BDPropertyAccessContext) {
    return this.___queue.run(async () => this.___getData(ctx)); 
  }
  
  async setData(data: BACNetAppData<Tag, Type>[]) {
    await this.___queue.run(() => this.___setData(data));
  }
  
  ___getData(ctx?: BDPropertyAccessContext): BACNetAppData<Tag, Type>[] {
    return this.#data;
  }
  
  async ___setData(data: BACNetAppData<Tag, Type>[]) { 
    await this.___asyncEmitSeries(true, 'beforecov', this, data);
    this.#data = data;
    await this.___asyncEmitSeries(false, 'aftercov', this, data);
  }

  async ___writeData(data: BACNetAppData<Tag, Type> | BACNetAppData<Tag, Type>[]) { 
    if (!this.#writable) { 
      throw new BDError('not writable', ErrorCode.WRITE_ACCESS_DENIED, ErrorClass.PROPERTY);
    }
    if (!Array.isArray(data)) { 
      data = [data];
    }
    await this.___setData(data);
  }
  
}