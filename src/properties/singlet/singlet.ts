
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
    return this.___queue.run(async () => this.___getData(ctx).value);
  }
  
  ___getData(ctx?: BDPropertyAccessContext) {
    return this.#data;
  }

  /**
   * 
   * @internal
   */
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

  /**
   * 
   * @internal
   */
  ___readData(index: number, ctx: BDPropertyAccessContext): BACNetAppData | BACNetAppData[] {
    return this.___getData(ctx);
  }

  /**
   * 
   * @internal
   */
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
    await this.___setData(data);
  }
  
}
