
import {
  BDSingletProperty,
  BDArrayProperty,
} from '../../properties/index.js';

import {
  type BDAnalogValueOpts,
  BDAnalogValue,
  } from './analogvalue.js';

import {
  type BACNetAppData,
  ObjectType,
  ApplicationTag,
  PropertyIdentifier,
} from '@bacnet-js/client';

export interface BDAnalogOutputOpts extends BDAnalogValueOpts {

}

/**
 * Implements a BACnet Analog Output object
 *
 * The Analog Output object represents a physical or virtual analog output point such as a
 * control valve, damper actuator, or other output device. This object type provides a standard
 * way to represent and control analog outputs in BACnet systems.
 *
 * Required properties according to the BACnet specification:
 * - Object_Identifier (automatically added by BACnetObject)
 * - Object_Name (automatically added by BACnetObject)
 * - Object_Type (automatically added by BACnetObject)
 * - Present_Value (writable)
 * - Status_Flags
 * - Event_State
 * - Out_Of_Service
 * - Units
 * - Priority_Array
 * - Relinquish_Default
 *
 * @extends BDObject
 */
export class BDAnalogOutput extends BDAnalogValue {

  /**
   * Creates a new BACnet Analog Output object
   */
  constructor(opts: BDAnalogOutputOpts) {
    super(opts, ObjectType.ANALOG_OUTPUT);
  }

}
