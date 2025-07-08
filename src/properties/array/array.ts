
import {
  type ApplicationTagValueTypeMap,
  type BACNetAppData,
  ErrorCode,
  ErrorClass,
  ApplicationTag,
  PropertyIdentifier,
} from '@bacnet-js/client';
 
import { BDError } from '../../errors.js';
import { type BDPropertyAccessContext } from './../types.js';

import { BDAbstractArrayProperty } from './abstract.js';

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

  getData(ctx?: BDPropertyAccessContext) {
    return this.#data;
  }

  async setData(data: BACNetAppData<Tag, Type>[]) { 
    await this.___asyncEmitSeries(true, 'beforecov', this, data);
    this.#data = data;
    await this.___asyncEmitSeries(false, 'aftercov', this, data);
  }

  /**
   * 
   * @internal
   */
  async ___writeData(data: BACNetAppData<Tag, Type> | BACNetAppData<Tag, Type>[]) { 
    if (!this.#writable) { 
      throw new BDError('not writable', ErrorCode.WRITE_ACCESS_DENIED, ErrorClass.PROPERTY);
    }
    if (!Array.isArray(data)) { 
      data = [data];
    }
    await this.setData(data);
  }
  
}