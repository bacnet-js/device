
/**
 * BACnet property implementations module
 * 
 * This module provides the core property implementations for BACnet objects.
 * Properties are the data elements that make up BACnet objects, and this module
 * defines the base types and interfaces for them.
 * 
 * @module
 */

export { BDAbstractProperty } from './abstract.js';

export {  
  BDSingletProperty,
  BDPolledSingletProperty,
} from './singlet.js';

export {  
  BDArrayProperty,
  BDPolledArrayProperty,
} from './array.js';

export {
  type BDPropertyEvents,
  type BDPropertyAccessContext,
  BDPropertyType,
} from './types.js';
