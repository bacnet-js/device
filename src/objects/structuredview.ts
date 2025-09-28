
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

  constructor(opts: BDStructuredViewOpts) {

    super(ObjectType.STRUCTURED_VIEW, opts.name, opts.description);

    this.#subordinates = new Set();
    this.#subortinateData = [];

    this.nodeType = this.addProperty(new BDSingletProperty<ApplicationTag.ENUMERATED, NodeType>(
      PropertyIdentifier.NODE_TYPE, ApplicationTag.ENUMERATED, false, opts.nodeType ?? NodeType.UNKNOWN));

    this.subordinateList = this.addProperty(new BDPolledArrayProperty<ApplicationTag.OBJECTIDENTIFIER>(
      PropertyIdentifier.SUBORDINATE_LIST, () => this.#subortinateData));

  }

  /**
   * Adds a subordinate object to this structured view.
   *
   * @param subordinate - The BACnet object to add as a new child of this Structured View object
   */
  addSubordinate<T extends BDObject>(subordinate: T): T {
    if (subordinate as any === this) {
      throw new Error('Cannot add subordinate: a structured view object cannot have itself as one of its own subordinates');
    }
    this.device.addObject(subordinate);
    if (!this.#subordinates.has(subordinate)) {
      this.#subordinates.add(subordinate);
      this.#subortinateData.push(subordinate.identifier);
    }
    return subordinate;
  }

  override destroy() {
    super.destroy();
    this.#subordinates.clear();
    this.#subortinateData.splice(0, this.#subortinateData.length);
  }



}
