
import { 
  type BACNetAppData,
  type ApplicationTag,
  type PropertyIdentifier,
  type ApplicationTagValueTypeMap,
} from '@bacnet-js/client';

import { 
  AsyncEventEmitter,
} from '../events.js';

import {
  type BDPropertyEvents,
  type BDPropertyType,
  type BDPropertyAccessContext,
} from './types.js';

import { 
  TaskQueue,
} from '../taskqueue.js';

const defaultTaskQueue = new TaskQueue();

/**
 * Abstract base class for all types of properties.
 */
export abstract class BDAbstractProperty<
  Tag extends ApplicationTag, 
  Type extends ApplicationTagValueTypeMap[Tag],
  Data extends BACNetAppData<Tag, Type> | BACNetAppData<Tag, Type>[],
> extends AsyncEventEmitter<BDPropertyEvents<Tag, Type, Data>> { 

  /**
   * Whether the property representes a single value or an array (or list) of
   * values.
   * 
   * @see {@link BDPropertyType}
   */
  readonly type: BDPropertyType;
  
  /**
   * The BACnet identifier for this property. Must be unique within the
   * properties added to the same object.
   */
  readonly identifier: PropertyIdentifier;
  
  /**
   * The task queue that consumer-facing methods use to execute tasks.
   * This is set via {@link this.___setTaskQueue} by object instances.
   * 
   * @internal
   */
  ___queue: TaskQueue;
  
  constructor(type: BDPropertyType, identifier: PropertyIdentifier) {
    super();
    this.type = type;
    this.identifier = identifier;
    this.___queue = defaultTaskQueue;
  }
  
  /**
   * Used by {@link BDObject} instances to set the task queue of this property
   * to their own queue. 
   * 
   * @internal
   */
  ___setTaskQueue(queue: TaskQueue) {
    this.___queue = queue;
  }
  
  /**
   * Consumer-facing method to retrieve property data.
   * Implementations of this method should encapsulate retrieval logic as a
   * task that is executed via this property's task queue.
   */
  abstract getData(ctx?: BDPropertyAccessContext): Promise<Data>;
  
  /**
   * Consumer-facing method to set property data.
   * Implementations of this method should encapsulate retrieval logic as a
   * task that is executed via this property's task queue.
   */
  abstract setData(data: Data): Promise<void>;
  
  /**
   * Network facing method used during handling of service requests that
   * require reading the property's data. Implementations of this method
   * SHOULD NOT encapsulate retrieval logic via the property's task queue.
   * 
   * @internal
   */
  abstract ___readData(index: number, ctx: BDPropertyAccessContext): BACNetAppData | BACNetAppData[];
  
  /**
   * Network facing method used during handling of service requests that
   * require writing the property's data. Implementations of this method
   * SHOULD NOT encapsulate retrieval logic via the property's task queue.
   * 
   * @internal
   */
  abstract ___writeData(value: BACNetAppData<Tag, Type> | BACNetAppData<Tag, Type>[]): Promise<void>;
  
}