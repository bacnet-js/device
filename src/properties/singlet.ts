
/**
 * BACnet singlet property implementation module
 * 
 * This module provides the implementation for BACnet properties
 * that contain a single value (as opposed to array properties).
 * 
 * @module
 */

import {
  type ApplicationTagValueTypeMap,
  type BACNetAppData,
  type PropertyIdentifier,
  type CharacterStringEncoding,
  ErrorCode,
  ErrorClass,
  ApplicationTag,
} from '@bacnet-js/client';

import { BDError } from '../errors.js';
import { BDAbstractProperty } from './abstract.js';
import { BDPropertyType, type BDPropertyAccessContext } from './types.js';


export abstract class BDAbstractSingletProperty<
  Tag extends ApplicationTag, 
  Type extends ApplicationTagValueTypeMap[Tag]
> extends BDAbstractProperty<Tag, Type, BACNetAppData<Tag, Type>> { 
  
  declare readonly type: BDPropertyType.SINGLET;
  
  abstract getValue(ctx?: BDPropertyAccessContext): Promise<Type>;
  abstract setValue(value: Type): Promise<void>;
  
  abstract ___getData(ctx: BDPropertyAccessContext): BACNetAppData<Tag, Type>;
  abstract ___setData(data: BACNetAppData<Tag, Type>): Promise<void>;

  constructor(identifier: PropertyIdentifier) {
    super(BDPropertyType.SINGLET, identifier);
    this.type = BDPropertyType.SINGLET;
  }
  
}



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
    return this.___queue.run(async () => this.___getData(ctx))
  }
  
  async getValue(ctx?: BDPropertyAccessContext): Promise<Type> {
    return (await this.getData()).value;
  }
  
  ___getData(ctx?: BDPropertyAccessContext): BACNetAppData<Tag, Type> {
    this.#data.value = this.#poll(ctx ?? { date: new Date() });
    return this.#data;
  }

  ___readData(index: number, ctx: BDPropertyAccessContext): BACNetAppData | BACNetAppData[] {
    return this.___getData(ctx);
  }
  
  async setData() {
    throw new BDError('Cannot set data of polled property', ErrorCode.WRITE_ACCESS_DENIED, ErrorClass.PROPERTY);
  }
  
  async setValue() {
    throw new BDError('Cannot set value of polled property', ErrorCode.WRITE_ACCESS_DENIED, ErrorClass.PROPERTY);
  }
  
  async ___setData() {
    throw new BDError('Cannot set data of polled property', ErrorCode.WRITE_ACCESS_DENIED, ErrorClass.PROPERTY);
  }
  
  async ___writeData() {
    throw new BDError('Cannot write data of polled property', ErrorCode.WRITE_ACCESS_DENIED, ErrorClass.PROPERTY);
  }
  
}

export class BDSingletProperty<
  Tag extends ApplicationTag, 
  Type extends ApplicationTagValueTypeMap[Tag] = ApplicationTagValueTypeMap[Tag],
> extends BDAbstractSingletProperty<Tag, Type> { 
  
  #writable: boolean;
  #data: BACNetAppData<Tag, Type>;
  
  constructor(identifier: PropertyIdentifier, type: Tag, writable: boolean, value: Type, encoding?: CharacterStringEncoding) {
    super(identifier);
    this.#data = { type, value, encoding };
    this.#writable = writable;
  }

  async getData(ctx?: BDPropertyAccessContext): Promise<BACNetAppData<Tag, Type>> {
    return this.___queue.run(async () => this.___getData(ctx));
  }
  
  async getValue(ctx?: BDPropertyAccessContext): Promise<Type> { 
    return (await this.getData()).value;
  }
  
  ___getData(ctx?: BDPropertyAccessContext) {
    return this.#data;
  }
  
  async ___setData(data: BACNetAppData<Tag, Type>): Promise<void> {
    await this.___asyncEmitSeries(true, 'beforecov', this, data);
    this.#data = data;
    await this.___asyncEmitSeries(false, 'aftercov', this, data);
  }
  
  async setData(data: BACNetAppData<Tag, Type>) {
    return this.___queue.run(() => this.___setData(data));
  }
  
  async setValue(value: Type): Promise<void> {
    return this.___queue.run(() => this.___setData({ ...this.___getData(), value }));
  }
  
  ___readData(index: number, ctx: BDPropertyAccessContext): BACNetAppData | BACNetAppData[] {
    return this.___getData(ctx);
  }
  
  async ___writeData(data: BACNetAppData<Tag, Type> | BACNetAppData<Tag, Type>[]) { 
    if (!this.#writable) { 
      throw new BDError('not writable', ErrorCode.WRITE_ACCESS_DENIED, ErrorClass.PROPERTY);
    }
    if (Array.isArray(data)) { 
      if (data.length !== 1) { 
        throw new BDError('property is not an array or list', ErrorCode.WRITE_ACCESS_DENIED, ErrorClass.PROPERTY);
      } else {
        data = data[0];
      }
    }
    await this.setData(data);
  }
  
}
