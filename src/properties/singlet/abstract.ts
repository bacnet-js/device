
import {
  type ApplicationTagValueTypeMap,
  type BACNetAppData,
  type PropertyIdentifier,
  ApplicationTag,
} from '@bacnet-js/client';

import { BDAbstractProperty } from '../abstract.js';
import { BDPropertyType, type BDPropertyAccessContext } from '../types.js';

/**
 * Abstract base class for properties having a single item as their data.
 */
export abstract class BDAbstractSingletProperty<
  Tag extends ApplicationTag,
  Type extends ApplicationTagValueTypeMap[Tag]
> extends BDAbstractProperty<Tag, Type, BACNetAppData<Tag, Type>> {

  declare readonly type: BDPropertyType.SINGLET;

  /**
   * Commodity method to get the value of the property rather than the entire
   * data element.
   */
  abstract getValue(ctx?: BDPropertyAccessContext): Type;

  /**
   * Commodity method to set the value of the property rather than the entire
   * data element.
   */
  abstract setValue(value: Type, priority?: number): Promise<void>;

  /**
   * Commodity method to clear the value of the property at the given command
   * priority.
   */
  abstract clearValueAtPriority(priority: number): Promise<void>;

  /**
   * Consumer-facing method to clear property data at the given command
   * priority.
   */
  abstract clearDataAtPriority(priority: number): Promise<void>;

  constructor(identifier: PropertyIdentifier) {
    super(BDPropertyType.SINGLET, identifier);
    this.type = BDPropertyType.SINGLET;
  }

}
