
import {
  type ApplicationTagValueTypeMap,
  type BACNetAppData,
  ErrorCode,
  ErrorClass,
  ApplicationTag,
  PropertyIdentifier,
} from '@bacnet-js/client';
 
import { BDError } from '../../errors.js';
import { BDAbstractProperty } from './../abstract.js';
import { BDPropertyType, type BDPropertyAccessContext } from './../types.js';

import { MAX_ARRAY_INDEX } from '../../constants.js';


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
