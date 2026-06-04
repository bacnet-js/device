
import {
  type BACNetAppData,
  type ApplicationTag,
  type ApplicationTagValueTypeMap,
} from '@bacnet-js/client';

import {
  type BDAbstractProperty,
} from './abstract.js';

/**
 * Maps the names of property events to the respective arrays of arguments.
 * Used to strongly type calls to `AsyncEventEmitter.prototype.on()`.
 */
export interface BDPropertyEvents<
  Tag extends ApplicationTag,
  Type extends ApplicationTagValueTypeMap[Tag],
  Data extends BACNetAppData<Tag, Type> | BACNetAppData<Tag, Type>[],
> extends Record<string, any[]> {

  /**
   * Emitted after a property value has changed. Errors throws by listeners
   * will be ignored.
   */
  aftercov: [raw: Data, property: BDAbstractProperty<Tag, Type, Data>],
}

/**
 * Enumerates the types of properties that can be defined.
 */
export enum BDPropertyType {
  /** A property whose data consists of a single value. */
  SINGLET = 0,
  /** A property whose data consists of an array of values. */
  ARRAY = 1,
}

/**
 * Dictionary of items available while accessing a property's data,
 * usually via a `context` or `ctx` argument.
 */
export interface BDPropertyAccessContext {
  /** The date and time at which the property is being accessed. */
  date: Date;
}

export type BDPropertyValidatorFn<
  Tag extends ApplicationTag,
  Type extends ApplicationTagValueTypeMap[Tag],
  Data extends BACNetAppData<Tag, Type> | BACNetAppData<Tag, Type>[],
  > = (data: Data) => void;

export type BDPropertyCoVListener<
  Tag extends ApplicationTag,
  Type extends ApplicationTagValueTypeMap[Tag],
  Data extends BACNetAppData<Tag, Type> | BACNetAppData<Tag, Type>[],
> = (data: Data, property: BDAbstractProperty<Tag, Type, Data>) => Promise<void>;
