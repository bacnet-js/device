
import {
  BDSingletProperty,
  BDPolledArrayProperty,
} from '../properties/index.js';

import { BDObject } from './generic/object.js';

import {
  ObjectType,
  ApplicationTag,
  PropertyIdentifier,
  NodeType,
  type BACNetAppData,
} from '@bacnet-js/client';

import {
  type BDDevice,
} from './device/device.js';

export interface BDStructuredViewOpts {
  name: string,
  description?: string,
  nodeType?: NodeType,
}

/**
 * The Structured View object type defines a standardized object that provides
 * a container to hold references to subordinate objects, which may include
 * other Structured View objects, thereby allowing multilevel hierarchies to be
 * created. The hierarchies are intended to convey a structure or organization.
 */
export class BDStructuredView extends BDObject {

  readonly nodeType: BDSingletProperty<ApplicationTag.ENUMERATED, NodeType>;
  readonly subordinateList: BDPolledArrayProperty<ApplicationTag.OBJECTIDENTIFIER>;

  readonly #subordinates: Set<BDObject>;
  readonly #subortinateData: BACNetAppData<ApplicationTag.OBJECTIDENTIFIER>[];

  #device?: BDDevice;

  constructor(instance: number, opts: BDStructuredViewOpts) {

    super({ type: ObjectType.STRUCTURED_VIEW, instance }, opts.name, opts.description);

    this.#subordinates = new Set();
    this.#subortinateData = [];

    this.nodeType = this.addProperty(new BDSingletProperty<ApplicationTag.ENUMERATED, NodeType>(
      PropertyIdentifier.NODE_TYPE, ApplicationTag.ENUMERATED, false, opts.nodeType ?? NodeType.UNKNOWN));

    this.subordinateList = this.addProperty(new BDPolledArrayProperty<ApplicationTag.OBJECTIDENTIFIER>(
      PropertyIdentifier.SUBORDINATE_LIST, () => this.#subortinateData));

  }


  /** @internal */
  ___setDevice(device: BDDevice) {
    if (this.#device) {
      throw new Error('Cannot set object device: already set');
    }
    this.#device = device;
  }

  /**
   * Adds a subordinate object to this structured view.
   *
   * @param child - The BACnet object to add as a new child of this Structured View object
   */
  addSubordinate<T extends BDObject>(subordinate: T): T {
    if (subordinate as any === this) {
      throw new Error('Cannot add subordinate: a structured view object cannot have itself as one of its own subordinates');
    }
    if (!this.#device) {
      throw new Error('Cannot add subordinate: this structured view object has not been added to a device or another structured view object');
    }
    this.#device.addObject(subordinate);
    if (!this.#subordinates.has(subordinate)) {
      this.#subordinates.add(subordinate);
      this.#subortinateData.push({ type: ApplicationTag.OBJECTIDENTIFIER, value: subordinate.identifier })
    }
    return subordinate;
  }



}
