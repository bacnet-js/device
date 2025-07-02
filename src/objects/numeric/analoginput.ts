
import { 
  type BDAnalogValueOpts,
  BDAnalogValue,
  } from './analogvalue.js';
  
import { 
  ObjectType,
} from '@bacnet-js/client';

export interface BDAnalogInputOpts extends BDAnalogValueOpts { 
}

/**
 * Implements a BACnet Analog Input object
 * 
 * The Analog Input object represents a physical or virtual analog input source such as a
 * temperature sensor, pressure sensor, or other analog measurement device. This object
 * type provides a standard way to represent analog inputs in BACnet systems.
 * 
 * Required properties according to the BACnet specification:
 * - Object_Identifier (automatically added by BACnetObject)
 * - Object_Name (automatically added by BACnetObject)
 * - Object_Type (automatically added by BACnetObject)
 * - Present_Value (read-only unless Out_Of_Service is true)
 * - Status_Flags
 * - Event_State
 * - Out_Of_Service
 * - Units
 * - Reliability (optional but commonly included)
 * 
 * @extends BDObject
 */
export class BDAnalogInput extends BDAnalogValue {
  
  /**
   * Creates a new BACnet Analog Input object
   */
  constructor(instance: number, opts: BDAnalogInputOpts) {
    super(instance, opts, ObjectType.ANALOG_INPUT);
  }
  
}