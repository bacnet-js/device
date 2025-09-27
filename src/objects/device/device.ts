
import {
  BDError,
} from '../../errors.js';

import {
  BDObject,
} from '../generic/object.js';

import {
  type BACNetClientType,
  isDstInEffect,
} from '../../utils.js';

import {
  BDAbstractProperty,
  BDArrayProperty,
  BDPolledArrayProperty,
  BDPolledSingletProperty,
  BDSingletProperty,
} from '../../properties/index.js';

import bacnet, {
  type BACNetAppData,
  type BACNetObjectID,
  type BACNetReadAccess,
  type ListElementOperationPayload,
  type SubscribeCovPayload,
  type IAMResult,
  type BACNetEventInformation,
  ErrorCode,
  ErrorClass,
  ObjectType,
  ApplicationTag,
  PropertyIdentifier,
  Segmentation,
  DeviceStatus,
  ServicesSupported,
  ServicesSupportedBitString,
  ObjectTypesSupported,
  ObjectTypesSupportedBitString,
} from '@bacnet-js/client';

import {
  type BaseEventContent,
  type ReadPropertyContent,
  type ReadPropertyMultipleContent,
  type WritePropertyContent,
  type SubscribeCovContent,
} from '@bacnet-js/client/dist/lib/EventTypes.js';

import {
  type BDDeviceOpts,
  type BDDeviceEvents,
  type BDQueuedCov,
} from './types.js';

import {
  BDStructuredView,
} from '../structuredview.js';

import {
  sendConfirmedCovNotification,
  sendUnconfirmedCovNotification,
} from './utils.js'

import { device as debug } from '../../debug.js';

import fastq from 'fastq';
import { AsyncEventEmitter } from '../../events.js';
import { SubscriptionStore } from './subscriptionstore.js';
import { getObjectUID, getPropertyUID, type BDObjectUID } from '../../uids.js';
import { BDNumericObject } from '../numeric/numeric.js';
import { instanceManager } from '../instancemanager.js';

const { default: BACnetClient } = bacnet;


/**
 * Implements a BACnet Device object
 *
 * The Device object is a specialized BACnet object that represents the BACnet device itself.
 * It serves as a container for all other BACnet objects and provides device-level properties
 * and services. Each BACnet node hosts exactly one Device object.
 *
 * According to the BACnet specification, the Device object includes standard properties:
 * - Object_Identifier (automatically added by BACnetObject)
 * - Object_Name (automatically added by BACnetObject)
 * - Object_Type (automatically added by BACnetObject)
 * - System_Status
 * - Vendor_Name
 * - Vendor_Identifier
 * - Model_Name
 * - Firmware_Revision
 * - Application_Software_Version
 * - Protocol_Version
 * - Protocol_Revision
 * - Protocol_Services_Supported
 * - Protocol_Object_Types_Supported
 * - Object_List
 * - And other properties related to device capabilities and configuration
 *
 * @extends BDObject
 */
export class BDDevice extends BDObject implements AsyncEventEmitter<BDDeviceEvents> {

  /**
   * @see https://bacnet.org/assigned-vendor-ids/
   */
  readonly #vendorId: number;

  /** The underlying BACnet client from the bacnet library */
  readonly #client: BACNetClientType;

  /** Queue for processing COV notifications */
  readonly #covqueue: fastq.queueAsPromised<BDQueuedCov<any, any, any>>;

  /** Map of active subscriptions organized by object type and instance */
  readonly #subscriptions: SubscriptionStore;

  /**
   * Map of all objects in this device, organized by type and instance
   * @private
   */
  readonly #objects: Map<BDObjectUID, BDObject>;
  readonly #objectData: BACNetAppData<ApplicationTag.OBJECTIDENTIFIER>[];

  readonly #subordinates: Set<BDStructuredView>;
  readonly #subortinateData: BACNetAppData<ApplicationTag.OBJECTIDENTIFIER>[];

  readonly #knownDevices: Map<number, IAMResult>;

  readonly objectList: BDPolledArrayProperty<ApplicationTag.OBJECTIDENTIFIER>;
  readonly structuredObjectList: BDPolledArrayProperty<ApplicationTag.OBJECTIDENTIFIER>;
  readonly protocolVersion: BDSingletProperty<ApplicationTag.UNSIGNED_INTEGER>;
  readonly protocolRevision: BDSingletProperty<ApplicationTag.UNSIGNED_INTEGER>;
  readonly protocolServicesSupported: BDSingletProperty<ApplicationTag.BIT_STRING>;
  readonly protocolObjectTypesSupported: BDSingletProperty<ApplicationTag.BIT_STRING>;
  readonly activeCovSubscriptions: BDPolledArrayProperty<ApplicationTag.COV_SUBSCRIPTION>;
  readonly vendorIdentifier: BDSingletProperty<ApplicationTag.UNSIGNED_INTEGER>;
  readonly vendorName: BDSingletProperty<ApplicationTag.CHARACTER_STRING>;
  readonly modelName: BDSingletProperty<ApplicationTag.CHARACTER_STRING>;
  readonly firmwareRevision: BDSingletProperty<ApplicationTag.CHARACTER_STRING>;
  readonly applicationSoftwareVersion: BDSingletProperty<ApplicationTag.CHARACTER_STRING>;
  readonly databaseRevision: BDSingletProperty<ApplicationTag.UNSIGNED_INTEGER>;
  readonly deviceAddressBinding: BDArrayProperty<ApplicationTag.NULL>;
  readonly location: BDSingletProperty<ApplicationTag.CHARACTER_STRING>;
  readonly serialNumber: BDSingletProperty<ApplicationTag.CHARACTER_STRING>;
  readonly maxApduLengthAccepted: BDSingletProperty<ApplicationTag.UNSIGNED_INTEGER>;
  readonly apduTimeout: BDSingletProperty<ApplicationTag.UNSIGNED_INTEGER>;
  readonly numberOfApduRetries: BDSingletProperty<ApplicationTag.UNSIGNED_INTEGER>;
  readonly apduSegmentTimeout: BDSingletProperty<ApplicationTag.UNSIGNED_INTEGER>;
  readonly segmentationSupported: BDSingletProperty<ApplicationTag.ENUMERATED, Segmentation>;
  readonly maxSegmentsAccepted: BDSingletProperty<ApplicationTag.UNSIGNED_INTEGER>;
  readonly utcOffset: BDPolledSingletProperty<ApplicationTag.SIGNED_INTEGER>;
  readonly localDate: BDPolledSingletProperty<ApplicationTag.DATE>;
  readonly localTime: BDPolledSingletProperty<ApplicationTag.TIME>;
  readonly daylightSavingsStatus: BDPolledSingletProperty<ApplicationTag.BOOLEAN>;
  readonly systemStatus: BDSingletProperty<ApplicationTag.ENUMERATED, DeviceStatus>;


  /**
   * Creates a new BACnet Device object
   *
   * This constructor initializes a Device object with all required properties
   * according to the BACnet specification, including support for basic BACnet
   * services and object types.
   *
   * @param instance - Device instance number (0-4194303). Must be unique on the BACnet network.
   * @param opts - Configuration options for this device
   *
   * @see {@link https://kargs.net/BACnet/Foundations2012-BACnetDeviceID.pdf}
   */
  constructor(instance: number, opts: BDDeviceOpts) {
    super(ObjectType.DEVICE, opts.name, opts.description);

    this.#vendorId = opts.vendorId ?? 0;
    this.#knownDevices = new Map();

    this.#objects = new Map();
    this.#objectData = [];

    this.#subordinates = new Set();
    this.#subortinateData = [];

    this.#covqueue = fastq.promise(null, this.#covQueueWorker, 1);
    this.#subscriptions = new SubscriptionStore();

    this.#client = new BACnetClient(opts)
      .on('whoHas', this.#onBacnetWhoHas)
      .on('iAm', this.#onBacnetIAm)
      .on('iHave', this.#onBacnetIHave)
      .on('error', this.#onBacnetError)
      .on('readRange', this.#onBacnetReadRange)
      .on('deviceCommunicationControl', this.#onBacnetDeviceCommunicationControl)
      .on('listening', this.#onBacnetListening)
      .on('readProperty', this.#onBacnetReadProperty)
      .on('whoIs', this.#onBacnetWhoIs)
      .on('subscribeCov', this.#onBacnetSubscribeCov)
      .on('subscribeProperty', this.#onBacnetSubscribeProperty)
      .on('readPropertyMultiple', this.#onBacnetReadPropertyMultiple)
      .on('writeProperty', this.#onBacnetWriteProperty)
      .on('addListElement', this.#onBacnetAddListElement)
      .on('removeListElement', this.#onBacnetRemoveListElement)
      .on('getEventInformation', this.#onBacnetGetEventInformation)
      .on('unhandledEvent', this.#onBacnetUnhandledEvent);

    this.___setDevice(this);
    this.___setIdentifier(instance);

    this.#objects.set(getObjectUID(this.identifier.value), this);
    this.#objectData.push(this.identifier);

    this.on('aftercov', this.#onChildAfterCov);

    // ================== PROPERTIES RELATED TO CHILD OBJECTS =================

    this.objectList = this.addProperty(new BDPolledArrayProperty<ApplicationTag.OBJECTIDENTIFIER>(
      PropertyIdentifier.OBJECT_LIST, () => this.#objectData));

    this.structuredObjectList = this.addProperty(new BDPolledArrayProperty<ApplicationTag.OBJECTIDENTIFIER>(
      PropertyIdentifier.STRUCTURED_OBJECT_LIST, () => this.#subortinateData));

    // ====================== PROTOCOL-RELATED PROPERTIES =====================

    this.protocolVersion = this.addProperty(new BDSingletProperty(
      PropertyIdentifier.PROTOCOL_VERSION, ApplicationTag.UNSIGNED_INTEGER, false, 1));

    this.protocolRevision = this.addProperty(new BDSingletProperty(
      PropertyIdentifier.PROTOCOL_REVISION, ApplicationTag.UNSIGNED_INTEGER, false, 24));

    const supportedServicesBitString = new ServicesSupportedBitString(
      ServicesSupported.WHO_IS,
      ServicesSupported.I_AM,
      ServicesSupported.READ_PROPERTY,
      ServicesSupported.WRITE_PROPERTY,
      ServicesSupported.SUBSCRIBE_COV,
      ServicesSupported.CONFIRMED_COV_NOTIFICATION,
      ServicesSupported.UNCONFIRMED_COV_NOTIFICATION,
    );

    this.protocolServicesSupported = this.addProperty(new BDSingletProperty(
      PropertyIdentifier.PROTOCOL_SERVICES_SUPPORTED, ApplicationTag.BIT_STRING, false, supportedServicesBitString));

    const supportedObjectTypesBitString = new ObjectTypesSupportedBitString(
      ObjectTypesSupported.DEVICE,
      ObjectTypesSupported.BINARY_VALUE,
      ObjectTypesSupported.ANALOG_VALUE,
      ObjectTypesSupported.ANALOG_INPUT,
      ObjectTypesSupported.ANALOG_OUTPUT,
      ObjectTypesSupported.DATE_VALUE,
      ObjectTypesSupported.TIME_VALUE,
      ObjectTypesSupported.DATETIME_VALUE,
      ObjectTypesSupported.INTEGER_VALUE,
      ObjectTypesSupported.POSITIVE_INTEGER_VALUE,
      ObjectTypesSupported.MULTI_STATE_VALUE,
      ObjectTypesSupported.CHARACTERSTRING_VALUE,
    );

    this.protocolObjectTypesSupported = this.addProperty(new BDSingletProperty(
      PropertyIdentifier.PROTOCOL_OBJECT_TYPES_SUPPORTED, ApplicationTag.BIT_STRING, false, supportedObjectTypesBitString));

    // ==================== SUBSCRIPTION-RELATED PROPERTIES ===================

    this.activeCovSubscriptions = this.addProperty(new BDPolledArrayProperty<ApplicationTag.COV_SUBSCRIPTION>(
      PropertyIdentifier.ACTIVE_COV_SUBSCRIPTIONS, () => this.#subscriptions.getDeviceSubscriptionData()));

    // ========================== METADATA PROPERTIES =========================

    this.vendorIdentifier = this.addProperty(new BDSingletProperty(
      PropertyIdentifier.VENDOR_IDENTIFIER, ApplicationTag.UNSIGNED_INTEGER, false, this.#vendorId));

    this.vendorName = this.addProperty(new BDSingletProperty(
      PropertyIdentifier.VENDOR_NAME, ApplicationTag.CHARACTER_STRING, false, opts.vendorName ?? '@bacnet-js'));

    this.modelName = this.addProperty(new BDSingletProperty(
      PropertyIdentifier.MODEL_NAME, ApplicationTag.CHARACTER_STRING, false, opts.modelName ?? '@bacnet-js/device'));

    this.firmwareRevision = this.addProperty(new BDSingletProperty(
      PropertyIdentifier.FIRMWARE_REVISION, ApplicationTag.CHARACTER_STRING, false, opts.firmwareRevision ?? '0.0.1'));

    this.applicationSoftwareVersion = this.addProperty(new BDSingletProperty(
      PropertyIdentifier.APPLICATION_SOFTWARE_VERSION, ApplicationTag.CHARACTER_STRING, false, opts.applicationSoftwareVersion ?? '0.0.1'));

    this.databaseRevision = this.addProperty(new BDSingletProperty(
      PropertyIdentifier.DATABASE_REVISION, ApplicationTag.UNSIGNED_INTEGER, false, opts.databaseRevision ?? 1));

    // Bindings can be discovered via the "Who-Is" and "I-Am" services.
    // This property represents a list of static bindings and we can leave it empty.
    this.deviceAddressBinding = this.addProperty(new BDArrayProperty<ApplicationTag.NULL>(
      PropertyIdentifier.DEVICE_ADDRESS_BINDING, false, []));

    // In your device constructor
    this.location = this.addProperty(new BDSingletProperty(
      PropertyIdentifier.LOCATION, ApplicationTag.CHARACTER_STRING, false, opts.location ?? 'w'));

    this.serialNumber = this.addProperty(new BDSingletProperty(
      PropertyIdentifier.SERIAL_NUMBER, ApplicationTag.CHARACTER_STRING, false, opts.serialNumber ?? 'w'));

    // ======================== APDU-RELATED PROPERTIES =======================

    this.maxApduLengthAccepted = this.addProperty(new BDSingletProperty(
      PropertyIdentifier.MAX_APDU_LENGTH_ACCEPTED, ApplicationTag.UNSIGNED_INTEGER, false, opts.apduMaxLength ?? 1476));

    this.apduTimeout = this.addProperty(new BDSingletProperty(
      PropertyIdentifier.APDU_TIMEOUT, ApplicationTag.UNSIGNED_INTEGER, false, opts.apduTimeout ?? 6000));

    this.numberOfApduRetries = this.addProperty(new BDSingletProperty(
      PropertyIdentifier.NUMBER_OF_APDU_RETRIES, ApplicationTag.UNSIGNED_INTEGER, false, opts.apduRetries ?? 3));

    this.apduSegmentTimeout = this.addProperty(new BDSingletProperty(
      PropertyIdentifier.APDU_SEGMENT_TIMEOUT, ApplicationTag.UNSIGNED_INTEGER, false, opts.apduSegmentTimeout ?? 2000));

    // ======================== SEGMENTATION PROPERTIES =======================

    this.segmentationSupported = this.addProperty(new BDSingletProperty<ApplicationTag.ENUMERATED, Segmentation>(
      PropertyIdentifier.SEGMENTATION_SUPPORTED, ApplicationTag.ENUMERATED, false, Segmentation.SEGMENTED_BOTH));

    // Accepter values: 2, 4, 8, 16, 32, 64 and 0 for "unspecified"
    this.maxSegmentsAccepted = this.addProperty(new BDSingletProperty(
      PropertyIdentifier.MAX_SEGMENTS_ACCEPTED, ApplicationTag.UNSIGNED_INTEGER, false, 16));

    // ======================== TIME-RELATED PROPERTIES =======================

    this.utcOffset = this.addProperty(new BDPolledSingletProperty(
      PropertyIdentifier.UTC_OFFSET, ApplicationTag.SIGNED_INTEGER, (ctx) => ctx.date.getTimezoneOffset() * -1));

    this.localDate = this.addProperty(new BDPolledSingletProperty(
      PropertyIdentifier.LOCAL_DATE, ApplicationTag.DATE, (ctx) => ctx.date));

    this.localTime = this.addProperty(new BDPolledSingletProperty(
      PropertyIdentifier.LOCAL_TIME, ApplicationTag.TIME, (ctx) => ctx.date));

    this.daylightSavingsStatus = this.addProperty(new BDPolledSingletProperty(
      PropertyIdentifier.DAYLIGHT_SAVINGS_STATUS, ApplicationTag.BOOLEAN, (ctx) => isDstInEffect(ctx.date)));

    // ======================= STATUS-RELATED PROPERTIES ======================

    this.systemStatus = this.addProperty(new BDSingletProperty<ApplicationTag.ENUMERATED, DeviceStatus>(
      PropertyIdentifier.SYSTEM_STATUS, ApplicationTag.ENUMERATED, false, DeviceStatus.OPERATIONAL));

  }

  // ==========================================================================
  //                               PUBLIC METHODS
  // ==========================================================================

  /**
   * Adds a BACnet object to this device
   *
   * This method registers a new BACnet object with the device and adds it to the
   * device's object list. The object must have a unique identifier (type and instance).
   *
   * @param object - The BACnet object to add to this device
   * @returns The added object
   * @throws Error if an object with the same identifier already exists
   * @typeParam T - The specific BACnet object type
   */
  addObject<T extends BDObject>(object: T): T {
    object.___setDevice(this);
    object.___setIdentifier(instanceManager.next(this, object.objectType.getValue()));
    this.#objects.set(getObjectUID(object.identifier.value), object);
    this.#objectData.push(object.identifier);
    object.on('aftercov', this.#onChildAfterCov);
    return object;
  }

  /**
   * Adds a subordinate BACnet object to this device
   *
   * This method registers a new BACnet object with the device and adds it to
   * the device's object list, just as {@link this.___addObject}. Additionally,
   * however, this method also registers the object as a subordinate object of
   * this device, adding it to the device's structured representation. The
   * subordinate object *must* be a Structured View object.
   *
   * @param subordinate - The Structured View object to add as a new child of
   *                      this Device object
   */
  addSubordinate(subordinate: BDStructuredView): BDStructuredView {
    subordinate = this.addObject(subordinate);
    if (!this.#subordinates.has(subordinate)) {
      this.#subordinates.add(subordinate);
      this.#subortinateData.push(subordinate.identifier);
    }
    return subordinate;
  }

  // ==========================================================================
  //                        INTERNAL HELPER METHODS
  // ==========================================================================

  async #wrapReqHandler<T extends BaseEventContent, O>(req: T, handler: () => Promise<any>) {
    const { header, service, invokeId } = req;
    await this.transaction(handler).catch((err) => {
      if (err instanceof BDError) {
        if (header?.expectingReply) {
          debug('error while handling request: %s', err.stack ?? err.message);
          this.#client.errorResponse(header.sender, service!, invokeId!, err.class, err.code);
        }
      } else {
        if (header?.expectingReply) {
          debug('unexpected error while handling request: %s', err.stack ?? err.message);
          this.#client.errorResponse(header.sender, service!, invokeId!, ErrorClass.DEVICE, ErrorCode.INTERNAL_ERROR);
        }
      }
    });
  }

  #getObjectByIdOrThrow(objectId: BACNetObjectID): BDObject {
    const object = this.#objects.get(getObjectUID(objectId));
    if (object) {
      return object;
    }
    throw new BDError('unknown object', ErrorCode.UNKNOWN_OBJECT, ErrorClass.OBJECT);
  }


  /**
   * Worker function for processing the COV notification queue
   *
   * This method processes each COV notification and sends it to all
   * applicable subscribers.
   *
   * @param cov - The change of value data to process
   * @private
   */
  #covQueueWorker = async (cov: BDQueuedCov<any, any, any>) => {
    const propertyUid = getPropertyUID(cov.object.identifier.value, cov.property.identifier);
    for (const subscription of this.#subscriptions.getPropertySubscriptions(propertyUid)) {
      if (cov.property.identifier === PropertyIdentifier.PRESENT_VALUE
        && cov.property === subscription.property
        && subscription.object instanceof BDNumericObject
        && subscription.lastDataSent
        && Math.abs((cov.value as BACNetAppData<any, number>).value - (subscription.lastDataSent as BACNetAppData<any, number>).value) < subscription.object.covIncrement.getData().value
      ) {
        continue;
      }
      subscription.lastDataSent = cov.value;
      if (subscription.issueConfirmedNotifications) {
        await sendConfirmedCovNotification(this.#client, this, subscription, cov);
        subscription.covIncrement += 1;
      } else {
        subscription.covIncrement += 1;
        await sendUnconfirmedCovNotification(this.#client, this, subscription, cov);
      }
    }
  };

  // ==========================================================================
  //                     LISTENERS FOR CHILD OBJECT EVENTS
  // ==========================================================================

  /**
   * Handles 'aftercov' events from child BACnet objects
   *
   * This method propagates Change of Value (COV) events from contained objects
   * to the device's subscribers, allowing for device-wide COV monitoring.
   *
   * @param object - The object that changed
   * @param property - The property that changed
   * @param value - The new value
   * @private
   */
  #onChildAfterCov = async (object: BDObject, property: BDAbstractProperty<any, any, any>, value: BACNetAppData | BACNetAppData[]) => {
    // We do not `await` the promise as we do not want slow consumers of
    // confirmed CoV notifications in the BACnet network to indirectly block
    // further operations on this object.
    this.#covqueue.push({ object, property, value });
  }


  // ==========================================================================
  //                   LISTENERS FOR BACNET SERVICE EVENTS
  // ==========================================================================


  /**
   * Handles ReadProperty requests from other BACnet devices
   *
   * This method processes ReadProperty requests and returns the requested
   * property value or an appropriate error.
   *
   * @param req - The ReadProperty request content
   * @private
   */
  #onBacnetReadProperty = (req: ReadPropertyContent) => {
    this.#wrapReqHandler(req, async () => {
      const { payload: { objectId, property }, address, header, service, invokeId } = req;
      debug('req #%s: readProperty, object %s %s, property %s', invokeId, ObjectType[objectId.type], objectId.instance, PropertyIdentifier[property.id]);
      const data = await this.#getObjectByIdOrThrow(objectId).___readProperty(property);
      this.#client.readPropertyResponse(header!.sender, invokeId!, objectId, property, data);
    });
  }

  /**
   * Handles SubscribeCOV requests from other BACnet devices
   *
   * This method processes subscription requests for COV notifications
   * and either creates a new subscription or updates an existing one.
   *
   * @param req - The SubscribeCOV request content
   * @private
   */
  #onBacnetSubscribeCov = (req: SubscribeCovContent) => {
    this.#wrapReqHandler(req, async () => {
      const { payload: { subscriberProcessId, monitoredObjectId, issueConfirmedNotifications, lifetime }, header, service, invokeId } = req;
      const object = this.#getObjectByIdOrThrow(monitoredObjectId);
      const property = object.___getPropertyOrThrow(PropertyIdentifier.PRESENT_VALUE);
      debug('new subscription: object %s %s', ObjectType[monitoredObjectId.type], monitoredObjectId.instance);
      const sub = {
        subscriptionProcessId: subscriberProcessId,
        issueConfirmedNotifications,
        expiresAt: Date.now() + (lifetime * 1000),
        // TODO: handle value-specific subscriptions when index > 0
        monitoredProperty: { id: PropertyIdentifier.PRESENT_VALUE, index: 0 },
        monitoredObjectId,
        subscriber: header!.sender,
        covIncrement: 0,
        timeRemaining: lifetime,
        recipient: { address: [0], network: 0 },
        lastDataSent: null,
        property,
        object,
      };
      this.#subscriptions.add(sub);
      this.#client.simpleAckResponse(header!.sender, service!, invokeId!);
    });
  };

  /**
   * Handles SubscribeCOVProperty requests from other BACnet devices
   *
   * This method is not fully implemented yet as it requires additional
   * support from the underlying BACnet library.
   *
   * Implementing onSubscribeCovProperty requires the underlying
   * @bacnet-js/client library to add support for the
   * full payload of this kind of event, which includes - in addition
   * to the properties of the standard onSubscribeCov event - the
   * following:
   * - monitored property: reference to the specific property being monitored
   * - covIncrement: (optional) minimum value change required to send cov
   *
   * @param req - The SubscribeCOVProperty request content
   * @private
   */
  #onBacnetSubscribeProperty = (req: Omit<BaseEventContent, 'payload'> & { payload: SubscribeCovPayload }) => {
    debug('new request: subscribeProperty');
    this.#onBacnetUnsupportedService(req);
    // const { payload: { subscriberProcessId, monitoredObjectId, issueConfirmedNotifications, lifetime }, header, service, invokeId } = req;
  };

  /**
   * Handles WhoIs requests from other BACnet devices
   *
   * This method responds with an IAm message identifying this device.
   *
   * @param req - The WhoIs request content
   * @private
   */
  #onBacnetWhoIs = (req: BaseEventContent) => {
    this.#wrapReqHandler(req, async () => {
      debug('new request: whoIs');
      const { header } = req;
      if (!header) return;
      this.#client.iAmResponse(header.sender, this.identifier.value.instance, Segmentation.NO_SEGMENTATION, this.#vendorId);
    });
  }

  /**
   * Handles WhoHas requests from other BACnet devices
   *
   * Currently not fully implemented, returns an error response.
   *
   * @param req - The WhoHas request content
   * @private
   */
  #onBacnetWhoHas = (req: BaseEventContent) => {
    debug('new request: whoHas');
    this.#onBacnetUnsupportedService(req);
  };

  /**
   * Handles IAm notifications from other BACnet devices
   *
   * Currently not fully implemented, returns an error response.
   *
   * @param req - The IAm notification content
   * @private
   */
  #onBacnetIAm = (req: Omit<BaseEventContent, 'payload'> & { payload: IAMResult }) => {
    debug('new request: iAm');
    this.#wrapReqHandler(req, async () => {
      const { payload } = req;
      const { deviceId } = payload;
      // TODO: handle duplicate deviceId(s)
      this.#knownDevices.set(deviceId, payload);
    });
  };

  /**
   * Handles IHave notifications from other BACnet devices
   *
   * Currently not fully implemented, returns an error response.
   *
   * @param req - The IHave notification content
   * @private
   */
  #onBacnetIHave = (req: BaseEventContent) => {
    debug('new request: iHave');
    this.#onBacnetUnsupportedService(req);
    // const { header, service, invokeId } = req;
    // TODO: implement
  };

  /**
   * Handles ReadRange requests from other BACnet devices
   *
   * Currently not fully implemented, returns an error response.
   *
   * @param req - The ReadRange request content
   * @private
   */
  #onBacnetReadRange = (req: BaseEventContent) => {
    debug('new request: readRange');
    this.#onBacnetUnsupportedService(req);
  };

  /**
   * Handles DeviceCommunicationControl requests from other BACnet devices
   *
   * Currently not fully implemented, returns an error response.
   *
   * @param req - The DeviceCommunicationControl request content
   * @private
   */
  #onBacnetDeviceCommunicationControl = (req: BaseEventContent) => {
    debug('new request: deviceCommunicationControl');
    this.#onBacnetUnsupportedService(req);
  };

  /**
   * Handles ReadPropertyMultiple requests from other BACnet devices
   *
   * This method processes requests to read multiple properties and
   * returns all the requested property values in a single response.
   *
   * @param req - The ReadPropertyMultiple request content
   * @private
   */
  #onBacnetReadPropertyMultiple = (req: ReadPropertyMultipleContent) => {
    debug('new request: readPropertyMultiple');
    this.#wrapReqHandler(req, async () => {
      const { header, invokeId, payload: { properties } } = req;
      if (!header) return;
      const values: BACNetReadAccess[] = [];
      for (const { objectId, properties: objProperties } of properties) {
        const object = this.#objects.get(getObjectUID(objectId));
        if (object) {
          values.push(await object.___readPropertyMultiple(objProperties));
        }
      }
      this.#client.readPropertyMultipleResponse(header.sender, invokeId!, values);
    });
  };

  /**
   * Handles WriteProperty requests from other BACnet devices
   *
   * This method processes requests to write values to properties.
   *
   * @param req - The WriteProperty request content
   * @private
   */
  #onBacnetWriteProperty = (req: WritePropertyContent) => {
    debug('req #%s: writeProperty');
    this.#wrapReqHandler(req, async () => {
      const { header, service, invokeId, payload: { objectId, property, value } } = req;
      const _value = value?.value;
      const _property = value?.property ?? property;
      if (!_value || !_property) {
        throw new BDError('inconsistent parameters', ErrorCode.INCONSISTENT_PARAMETERS, ErrorClass.SERVICES);
      }
      await this.#getObjectByIdOrThrow(objectId).___writeProperty(_property, _value);
      this.#client.simpleAckResponse(header!.sender, service!, invokeId!);
    });
  };

  /**
   * Handles AddListElement requests from other BACnet devices
   *
   * This method processes requests to add elements to list properties.
   * Not fully implemented yet.
   *
   * @param req - The AddListElement request content
   * @private
   */
  #onBacnetAddListElement = (req: Omit<BaseEventContent, 'payload'> & { payload: ListElementOperationPayload }) => {
    this.#onBacnetUnsupportedService(req);
  };

  /**
   * Handles RemoveListElement requests from other BACnet devices
   *
   * This method processes requests to remove elements from list properties.
   * Not fully implemented yet.
   *
   * @param req - The RemoveListElement request content
   * @private
   */
  #onBacnetRemoveListElement = (req: Omit<BaseEventContent, 'payload'> & { payload: ListElementOperationPayload }) => {
    this.#onBacnetUnsupportedService(req);
  };

  #onBacnetGetEventInformation = (req:  Omit<BaseEventContent, 'payload'> & { payload: BACNetEventInformation[];}) => {
    this.#onBacnetUnsupportedService(req);
  };

  #onBacnetUnhandledEvent = (req: Omit<BaseEventContent, 'payload'>) => {
    this.#onBacnetUnsupportedService(req);
  };

  #onBacnetUnsupportedService = (req: Omit<BaseEventContent, 'payload'>) => {
    const { header, invokeId, service } = req;
    debug('req #%s: %s (not supported)', invokeId, service ? ServicesSupported[service] : 'unknown');
    if (!header || !invokeId || typeof service !== 'number') {
      return;
    }
    if (header.expectingReply) {
      this.#client.errorResponse(header.sender, service, invokeId, ErrorClass.SERVICES, ErrorCode.SERVICE_REQUEST_DENIED);
    }
  };

  /**
   * Handles errors from the BACnet client
   *
   * This method emits errors to allow the application to handle them.
   *
   * @param err - The error that occurred
   * @private
   */
  #onBacnetError = (err: Error) => {
    debug('server error', err);
    this.___emit('error', err);
  };

  /**
   * Handles the listening event from the BACnet client
   *
   * This method emits a listening event when the BACnet node
   * starts listening on the network.
   *
   * @private
   */
  #onBacnetListening = () => {
    debug('server is listening');
    this.___emit('listening');
  };


}
