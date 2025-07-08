
import { 
  type BACNetAppData,
  type ApplicationTag,
  type ApplicationTagValueTypeMap,
} from '@bacnet-js/client';

import { 
  type EventMap,
  AsyncEventEmitter,
} from '../events.js';

import { 
  type BDAbstractProperty,
} from './abstract.js';

/**
 * Maps the names of property events to the respective arrays of arguments.
 * Used to strongly type calls to `AsyncEventEmitter.prototype.on()`.
 * 
 * @see {@link AsyncEventEmitter}
 */
export interface BDPropertyEvents<
  Tag extends ApplicationTag, 
  Type extends ApplicationTagValueTypeMap[Tag], 
  Data extends BACNetAppData<Tag, Type> | BACNetAppData<Tag, Type>[],
> extends EventMap {   
  /** 
   * Emitted before a property value changes. Listeners can throw in order to
   * block the change from going through (useful for additional validation).
   */
  beforecov: [property: BDAbstractProperty<Tag, Type, Data>, raw: Data],
  /** 
   * Emitted after a property value has changed. Errors throws by listeners 
   * will be ignored. 
   */
  aftercov: [property: BDAbstractProperty<Tag, Type, Data>, raw: Data],
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