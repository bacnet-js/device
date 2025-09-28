
import {
  ApplicationTag,
} from '@bacnet-js/client';

import {
    getPropertyUID,
  type BDPropertyUID,
} from '../../uids.js';

import  {
  type BDSubscription,
  type BDSubscriptionAppData,
} from './types.js';

import { EMPTY_ARRAY } from '../../constants.js';

/**
 * Comparator for sorting subscriptions by expiration date in ascending order.
 */
const subscriptionArraySortingFn = (a: BDSubscription<any, any, any>, b: BDSubscription<any, any, any>) => {
  return a.expiresAt - b.expiresAt;
};

/**
 * Comparator for sorting subscriptions data instances by expiration date in ascending order.
 */
const subscriptionDataArraySortingFn = (a: BDSubscriptionAppData, b: BDSubscriptionAppData) => {
  return subscriptionArraySortingFn(a.value, b.value);
};

/**
 * Like Array.prototype.findIndex, but returns the length of the array if no element satisfies the predicate.
 */
const findIndexOrLength = <T>(arr: T[], predicate: (item: T) => boolean): number => {
  const idx = arr.findIndex(predicate);
  return idx === -1 ? arr.length : idx;
};

/**
 * Helper class to keep track of active subscriptions.
 */
export class SubscriptionStore {

  /** Array of subscriptions sorted by expiration date in ascending order. */
  #deviceSubData: BDSubscriptionAppData[];

  /** Maps each property (through its UID) to the array of subscriptions for
   * that property, sorted by expiration date in ascending order. */
  #propertySubs: Map<BDPropertyUID, BDSubscription<any, any, any>[]>;

  /** Timeout ID for clearing expired subscriptions. */
  #clearTimeoutId: NodeJS.Timeout | null;

  constructor() {
    this.#deviceSubData = [];
    this.#propertySubs = new Map();
    this.#clearTimeoutId = null;
  }

  #setClearTimeout() {
    if (this.#clearTimeoutId === null && this.#deviceSubData.length > 0) {
      this.#clearTimeoutId = setTimeout(this.#onClearTimeout, this.#deviceSubData[0].value.expiresAt - Date.now());
    }
  }

  #onClearTimeout = () => {
    const now = Date.now();
    this.#deviceSubData = this.#deviceSubData.slice(findIndexOrLength(this.#deviceSubData, sub => sub.value.expiresAt > now));
    for (const [propertyUid, propertySubs] of this.#propertySubs.entries()) {
      this.#propertySubs.set(propertyUid, propertySubs.slice(findIndexOrLength(propertySubs, item => item.expiresAt > now)));
    }
    this.#clearTimeoutId = null;
    this.#setClearTimeout();
  }

  add(subscription: BDSubscription<any, any, any>) {
    const propertyUid = getPropertyUID(subscription.object.identifier.value, subscription.property.identifier);
    let propertySubscriptions = this.#propertySubs.get(propertyUid);
    if (!propertySubscriptions) {
      propertySubscriptions = [];
      this.#propertySubs.set(propertyUid, propertySubscriptions);
    }
    const previousSub = propertySubscriptions.find((existingSub) => {
      return existingSub.subscriber.address === subscription.subscriber.address
        && existingSub.subscriptionProcessId === subscription.subscriptionProcessId;
    });
    if (previousSub) {
      previousSub.expiresAt = subscription.expiresAt;
    } else {
      propertySubscriptions.push(subscription);
      this.#deviceSubData.push({ type: ApplicationTag.COV_SUBSCRIPTION, value: subscription });
    }
    propertySubscriptions.sort(subscriptionArraySortingFn);
    this.#deviceSubData.sort(subscriptionDataArraySortingFn);
    this.#setClearTimeout();
  }

  getPropertySubscriptions(propertyUid: BDPropertyUID): BDSubscription<any, any, any>[] {
    return this.#propertySubs.get(propertyUid) ?? EMPTY_ARRAY;
  }

  getDeviceSubscriptionData(): BDSubscriptionAppData[] {
    const now = Date.now();
    for (const subscription of this.#deviceSubData) {
      subscription.value.timeRemaining = Math.floor((subscription.value.expiresAt - now) / 1000);
    }
    return this.#deviceSubData;
  }

}
