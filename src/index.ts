
/**
 * BACnet Device Library
 * 
 * A TypeScript library for implementing BACnet IP devices in Node.js.
 * This module provides all the necessary types and classes for creating
 * and managing BACnet devices, objects, and properties.
 * 
 * @packageDocumentation
 */

export { BDError } from './errors.js';

export { TaskQueue } from './taskqueue.js';

export {
  type BDObjectUID,
  type BDPropertyUID,
} from './uids.js';

export { 
  type EventMap,
  type EventKey,
  type EventArgs,
  type EventListener,
  AsyncEventEmitter, 
} from './events.js';

export {
  type BDPropertyEvents,
  type BDPropertyValueGetter,
  type BDPropertyAccessContext,
  BDPropertyType,
  BDAbstractProperty,
  BDArrayProperty, 
  BDSingletProperty,
} from './properties/index.js';

export { 
  type BDObjectEvents,
  BDObject,
} from './objects/generic/object.js';

export { BDDevice } from './objects/device/device.js';

export { 
  type BDDeviceOpts, 
  type BDSubscription,
  type BDDeviceEvents,
} from './objects/device/types.js';

export * from './objects/numeric/analogoutput.js';
export * from './objects/numeric/analoginput.js';
export * from './objects/numeric/analogvalue.js';
export * from './objects/numeric/integervalue.js';
export * from './objects/numeric/positiveintegervalue.js';

export * from './objects/binaryvalue.js';

export * from './objects/temporal/timevalue.js';
export * from './objects/temporal/datevalue.js';
export * from './objects/temporal/datetimevalue.js';

export * from './objects/multistatevalue.js';

export * from './objects/characterstringvalue.js';
