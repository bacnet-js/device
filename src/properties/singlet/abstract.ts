
import {
  type ApplicationTagValueTypeMap,
  type BACNetAppData,
  type PropertyIdentifier,
  ApplicationTag,
} from '@bacnet-js/client';

import { BDError } from '../../errors.js';
import { BDAbstractProperty } from '../abstract.js';
import { BDPropertyType, type BDPropertyAccessContext } from '../types.js';


export abstract class BDAbstractSingletProperty<
  Tag extends ApplicationTag, 
  Type extends ApplicationTagValueTypeMap[Tag]
> extends BDAbstractProperty<Tag, Type, BACNetAppData<Tag, Type>> { 
  
  declare readonly type: BDPropertyType.SINGLET;
  
  abstract getValue(ctx?: BDPropertyAccessContext): Promise<Type>;
  abstract setValue(value: Type): Promise<void>;

  constructor(identifier: PropertyIdentifier) {
    super(BDPropertyType.SINGLET, identifier);
    this.type = BDPropertyType.SINGLET;
  }
  
}


