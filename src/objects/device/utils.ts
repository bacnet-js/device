
import { 
  type BACNetClientType,
  ensureArray,
} from '../../utils.js';

import { 
  type BDDevice,
} from './device.js';

import { 
  type BDSubscription,
  type BDQueuedCov,
} from './types.js';

/**
 * Sends a confirmed COV (Change of Value) notification to a subscriber
 * 
 * This function sends a notification that requires confirmation from the recipient,
 * which helps ensure reliable delivery of property value changes.
 * 
 * @param client - The BACnet client instance used to send the notification
 * @param emitter - The BACnet device sending the notification
 * @param subscription - The subscription information for the recipient
 * @param cov - The change of value data to send
 * @returns A promise that resolves when the notification is confirmed or rejects on error
 */
export const sendConfirmedCovNotification = async (client: BACNetClientType, emitter: BDDevice, subscription: BDSubscription<any, any, any>, cov: BDQueuedCov<any, any, any>) => {
  return new Promise<void>((resolve, reject) => {
    client.confirmedCOVNotification(
      { address: subscription.subscriber.address },
      cov.object.identifier,
      subscription.subscriptionProcessId,
      emitter.identifier.instance,
      Math.floor(Math.max(0, subscription.expiresAt - Date.now()) / 1000),
      [{ property: { id: cov.property.identifier }, value: ensureArray(cov.value) }],
      (err) => err ? reject(err) : resolve(),
    );
  });
};

/**
 * Sends an unconfirmed COV (Change of Value) notification to a subscriber
 * 
 * This function sends a notification without requiring confirmation from the recipient.
 * This is more efficient but less reliable than confirmed notifications.
 * 
 * @param client - The BACnet client instance used to send the notification
 * @param emitter - The BACnet device sending the notification
 * @param subscription - The subscription information for the recipient
 * @param cov - The change of value data to send
 * @returns A promise that resolves when the notification is sent
 */
export const sendUnconfirmedCovNotification = async (client: BACNetClientType, emitter: BDDevice, subscription: BDSubscription<any, any, any>, cov: BDQueuedCov<any, any, any>) => {
  client.unconfirmedCOVNotification(
    subscription.subscriber,
    subscription.subscriptionProcessId,
    emitter.identifier.instance,
    cov.object.identifier,
    Math.floor(Math.max(0, subscription.expiresAt - Date.now()) / 1000),
    [{ property: { id: cov.property.identifier }, value: ensureArray(cov.value) }],
  );
};
