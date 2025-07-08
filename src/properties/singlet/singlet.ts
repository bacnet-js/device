
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

  getData(ctx?: BDPropertyAccessContext): BACNetAppData<Tag, Type> {
    return this.#data;
  }
  
  getValue(ctx?: BDPropertyAccessContext): Type { 
    return this.getData().value;
  }
  
  async setData(data: BACNetAppData<Tag, Type>) {
    await this.___asyncEmitSeries(true, 'beforecov', this, data);
    this.#data = data;
    await this.___asyncEmitSeries(false, 'aftercov', this, data);
  }
  
  async setValue(value: Type): Promise<void> {
    await this.setData({ ...this.getData(), value });
  }

  /**
   * 
   * @internal
   */
  ___readData(index: number, ctx: BDPropertyAccessContext): BACNetAppData | BACNetAppData[] {
    return this.getData(ctx);
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
    await this.setData(data);
  }
  
}
