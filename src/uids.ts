
import {
  type BACNetObjectID,
  type PropertyIdentifier,
} from '@bacnet-js/client';

/**
 * Unique object identifier scoped to the current process.
 * This should be calculated as a number composed of two groups of four
 * digits each, encoding the object type and object instance respectively.
 */
export type BDObjectUID = number & { ___tag: 'objectid' };

export const getObjectUID = (object: BACNetObjectID): BDObjectUID => {
  return object.type * 1_000 + object.instance as BDObjectUID;
};

/**
 * Unique property identifier scoped to the current process.
 * This should be calculated as a number composed of three groups of four
 * digits each, encoding the object type, object instance and property
 * identifier respectively.
 */
export type BDPropertyUID = number & { ___tag: 'propertyid' };

export const getPropertyUID = (object: BACNetObjectID | BDObjectUID, property: PropertyIdentifier): BDPropertyUID => {
  return (typeof object === 'number' ? object : getObjectUID(object)) * 1000 + property as BDPropertyUID;
};
