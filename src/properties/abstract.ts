
import { EventEmitter } from 'node:events';

import {
  type BACNetAppData,
  type ApplicationTag,
  type PropertyIdentifier,
  type ApplicationTagValueTypeMap,
} from '@bacnet-js/client';

import {
  type BDPropertyEvents,
  type BDPropertyType,
  type BDPropertyAccessContext,
  type BDPropertyValidatorFn,
  type BDPropertyCoVListener,
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
> extends EventEmitter<BDPropertyEvents<Tag, Type, Data>> {

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

  /**
   * The validators for this property.
   *
   * @internal
   */
  ___validators: BDPropertyValidatorFn<Tag, Type, Data>[];

  /**
   * The change-of-value listeners for this property.
   *
   * @internal
   */
  ___cov_listeners: BDPropertyCoVListener<Tag, Type, Data>[];

  constructor(type: BDPropertyType, identifier: PropertyIdentifier) {
    super();
    this.type = type;
    this.identifier = identifier;
    this.___queue = defaultTaskQueue;
    this.___validators = [];
    this.___cov_listeners = [];
  }

  /**
   * Consumer-facing method to retrieve property data.
   * Implementations of this method should encapsulate retrieval logic as a
   * task that is executed via this property's task queue.
   */
  abstract getData(ctx?: BDPropertyAccessContext): Data;

  /**
   * Consumer-facing method to set property data.
   * Implementations of this method should encapsulate retrieval logic as a
   * task that is executed via this property's task queue.
   */
  abstract setData(data: Data, priority?: number): Promise<void>;

  /**
   * Adds a validator function to the property's list of validators.
   */
  addValidator(validator: (data: Data) => void): void {
    this.___validators.push(validator);
  }

  /**
   * Removes a validator function from the property's list of validators.
   */
  removeValidator(validator: (data: Data) => void): void {
    this.___validators = this.___validators.filter(v => v !== validator);
  }

  /**
   * Adds a validator function to the property's list of validators.
   */
  addCoVListener(listener: BDPropertyCoVListener<Tag, Type, Data>): void {
    this.___cov_listeners.push(listener);
  }

  /**
   * Removes a CoV listener function from the property's list of CoV listeners.
   */
  removeCoVListener(listener: BDPropertyCoVListener<Tag, Type, Data>): void {
    this.___cov_listeners = this.___cov_listeners.filter(l => l !== listener);
  }

  /**
   * @internal
   */
  async ___fireCoVListeners(data: Data): Promise<void> {
    for (const listener of this.___cov_listeners) {
      await listener(data, this);
    }
  }

  /**
   * @internal
   */
  ___validateData(data: Data): void {
    for (const validator of this.___validators) {
      validator(data);
    }
  }

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
  abstract ___writeData(value: BACNetAppData<Tag, Type> | BACNetAppData<Tag, Type>[], priority: number): Promise<void>;

  /**
   * Returns an array of related properties to be registered alongside this
   * one. This method may be overridden by extending classes to inform the
   * object layer of their related properties.
   *
   * @internal
   */
  ___getRelatedProperties(): BDAbstractProperty<any, any, any>[] {
    return [];
  }
}
