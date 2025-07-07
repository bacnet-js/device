
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

  readonly type: BDPropertyType;
  
  readonly identifier: PropertyIdentifier;
  
  /**
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
   * Used by {@link BDObject} instances to set the task queue to their own.
   * @internal
   */
  ___setTaskQueue(queue: TaskQueue) {
    this.___queue = queue;
  }
  
  /**
   * Consumer-facing method to retrieve property data.
   * Implementations of this method should encapsulate 
   */
  abstract getData(ctx?: BDPropertyAccessContext): Promise<Data>;
  abstract setData(data: Data): Promise<void>;
  
  /**
   * 
   * @internal
   */
  abstract ___readData(index: number, ctx: BDPropertyAccessContext): BACNetAppData | BACNetAppData[];
  
  /**
   * 
   * @internal
   */
  abstract ___writeData(value: BACNetAppData<Tag, Type> | BACNetAppData<Tag, Type>[]): Promise<void>;
  
}