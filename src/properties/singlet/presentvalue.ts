import {
  type ApplicationTagValueTypeMap,
  type BACNetAppData,
  type CharacterStringEncoding,
  ApplicationTag,
  PropertyIdentifier,
} from '@bacnet-js/client';

import { BDSingletProperty } from './singlet.js';
import { BDPolledSingletProperty } from './polled.js';
import assert from 'node:assert';
import { BDPolledArrayProperty } from '../array/polled.js';
import { APPDATA_NULL } from '../../utils.js';
import type { BDAbstractProperty } from '../abstract.js';

const ensurePriority = (priority: number) => {
  assert(priority >= 1 && priority <= 16, 'priority must be between 1 and 16');
};

export class BDPresentValueSingletProperty<
  Tag extends ApplicationTag,
  Type extends ApplicationTagValueTypeMap[Tag] = ApplicationTagValueTypeMap[Tag],
> extends BDSingletProperty<Tag, Type> {

  #prio: number;
  #data: BACNetAppData<Tag, Type>[];

  #priorityArray: BDPolledArrayProperty<Tag, Type>;
  #relinquishDefault: BDSingletProperty<Tag, Type>;
  #currentCommandPriority: BDPolledSingletProperty<ApplicationTag.UNSIGNED_INTEGER>;

  constructor(identifier: PropertyIdentifier, type: Tag, writable: boolean, value: Type, encoding?: CharacterStringEncoding) {

    super(identifier, type, writable, value, encoding);

    this.#data = new Array(16).fill(true)
      .map(_ => APPDATA_NULL) as BACNetAppData<Tag, Type>[];

    this.#prio = 16;

    this.#priorityArray = new BDPolledArrayProperty<Tag, Type>(
      PropertyIdentifier.PRIORITY_ARRAY,
      () => this.#data,
    );

    this.#relinquishDefault = new BDSingletProperty<Tag, Type>(
      PropertyIdentifier.RELINQUISH_DEFAULT,
      type,
      writable,
      value,
      encoding,
    );

    this.#currentCommandPriority = new BDPolledSingletProperty<ApplicationTag.UNSIGNED_INTEGER>(
      PropertyIdentifier.CURRENT_COMMAND_PRIORITY,
      ApplicationTag.UNSIGNED_INTEGER,
      () => this.#prio,
    );

  }

  override ___getRelatedProperties(): BDAbstractProperty<any, any, any>[] {
    return [
      this.#priorityArray,
      this.#relinquishDefault,
      this.#currentCommandPriority,
    ];
  }

  override async setData(data: BACNetAppData<Tag, Type>, priority: number = 16): Promise<void> {
    ensurePriority(priority);
    this.___validateData(data);
    this.#data[priority - 1] = data;
    for (let i = 1; i <= 16; i += 1) {
      if (this.#data[i - 1].type !== ApplicationTag.NULL) {
        this.#prio = i;
        await super.setData(this.#data[i - 1]);
        return;
      }
    }
    this.#prio = 16;
    await super.setData(this.#relinquishDefault.getData());
  }

  override async clearDataAtPriority(priority: number): Promise<void> {
    await this.setData(APPDATA_NULL as BACNetAppData<Tag, Type>, priority);
  }

  override async clearValueAtPriority(priority: number): Promise<void> {
    return this.clearDataAtPriority(priority);
  }

}
