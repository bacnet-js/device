
import {
  type BDObject,
  type BDObjectEvents,
} from '../generic/object.js';

import {
  type BDAbstractProperty,
} from '../../properties/index.js';

import {
  type BACNetObjectID,
  type BACnetMessageHeader,
  type ClientOptions,
  type BACNetPropertyID,
  type BACNetCovSubscription,
  type BACNetAppData,
  ApplicationTag,
  type ApplicationTagValueTypeMap,
} from '@bacnet-js/client';
/**
 * Represents a subscription to COV (Change of Value) notifications
 *
 * This interface defines the details of a COV subscription from another
 * BACnet device.
 */
export interface BDSubscription<Tag extends ApplicationTag, Type extends ApplicationTagValueTypeMap[Tag], Data extends BACNetAppData<Tag, Type> | BACNetAppData<Tag, Type>[]> extends BACNetCovSubscription {

  recipient: {
    network: number;
    address: number[];
  };

  /** Process ID of the subscribing device */
  subscriptionProcessId: number;

  /** Object ID being monitored for changes */
  monitoredObjectId: BACNetObjectID;

  /** Property ID being monitored for changes */
  monitoredProperty: BACNetPropertyID;

  /** Whether to send confirmed notifications */
  issueConfirmedNotifications: boolean;

  /** Expiration time in milliseconds since unix epoch */
  expiresAt: number;

  /** Network address information of the subscriber */
  subscriber: BACnetMessageHeader['sender'];

  /** Counter of COV notifications sent through this subscription  */
  covIncrement: number;

  lastDataSent: Data | null;

  object: BDObject;

  property: BDAbstractProperty<Tag, Type, Data>;

}

export interface BDSubscriptionAppData extends BACNetAppData<ApplicationTag.COV_SUBSCRIPTION> {
  type: ApplicationTag.COV_SUBSCRIPTION;
  value: BDSubscription<any, any, any>;
}

/**
 * Represents a queued Change of Value notification
 *
 * This interface defines the data needed to send a COV notification
 * to subscribed devices.
 */
export interface BDQueuedCov<Tag extends ApplicationTag, Type extends ApplicationTagValueTypeMap[Tag], Data extends BACNetAppData<Tag, Type> | BACNetAppData<Tag, Type>[]> {
  /** The BACnet object that changed */
  object: BDObject;

  /** The property within the object that changed */
  property: BDAbstractProperty<Tag, Type, Data>;

  /** The new value of the property */
  value: Data;
}

/**
 * Events that can be emitted by a BACnet node
 */
export interface BDDeviceEvents extends BDObjectEvents {
  /** Emitted when an error occurs in the BACnet node */
  error: [err: Error];

  /** Emitted when the BACnet node starts listening on the network */
  listening: [];
}

/**
 * Configuration options for creating a BACnet Device object
 *
 * This interface defines the parameters required to initialize a BACnet Device,
 * including identification, vendor information, and protocol configuration.
 */
export interface BDDeviceOpts extends ClientOptions {

  /**
   * The device's name (Object_Name property)
   */
  name: string;

  /**
   * The device's description (Description property)
   */
  description?: string;

  /**
   * Vendor identifier assigned by ASHRAE
   * @see https://bacnet.org/assigned-vendor-ids/
   */
  vendorId?: number;

  /**
   * The name of the device's vendor
   */
  vendorName?: string;

  /**
   * The device's model name
   */
  modelName?: string;

  /**
   * The device's firmware revision string
   */
  firmwareRevision?: string;

  /**
   * The device's application software version
   */
  applicationSoftwareVersion?: string;

  /**
   * Maximum APDU length this device can accept
   */
  apduMaxLength?: number;

  /**
   * APDU timeout in milliseconds
   */
  apduTimeout?: number;

  /**
   * Number of APDU retries
   */
  apduRetries?: number;

  apduSegmentTimeout?: number;

  /**
   * Current database revision number
   */
  databaseRevision?: number;

  /**
   * General description of the device's physical location
   * e.g. "Room 101, Building A, Campus X"
   */
  location?: string;

  /**
   * Serial number of the device
   * e.g. "SN-12345-6789"
   */
  serialNumber?: string;
}
