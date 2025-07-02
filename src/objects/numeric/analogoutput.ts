
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
   * The default value for the present value when all priority array slots are NULL
   * 
   * This property represents the value to be used for the Present_Value property
   * when all entries in the Priority_Array property are NULL.
   */
  readonly relinquishDefault: BDSingletProperty<ApplicationTag.REAL>;
  
  /**
   * The priority array for command arbitration
   * 
   * This property represents the 16-level priority array used for command arbitration.
   * BACnet devices use this mechanism to determine which command source has control
   * over the output value at any given time.
   */
  readonly priorityArray: BDArrayProperty<ApplicationTag.REAL | ApplicationTag.NULL>;
  
  /**
   * The current command priority that is controlling the Present_Value
   * 
   * This property indicates which priority level in the priority array currently
   * has control of the Present_Value property, or NULL if the Relinquish_Default
   * is being used.
   */
  readonly currentCommandPriority: BDSingletProperty<ApplicationTag.UNSIGNED_INTEGER>;
  
  /**
   * Creates a new BACnet Analog Output object
   */
  constructor(instance: number, opts: BDAnalogOutputOpts) {
    super(instance, opts, ObjectType.ANALOG_OUTPUT);
    
    this.relinquishDefault = this.addProperty(new BDSingletProperty(
      PropertyIdentifier.RELINQUISH_DEFAULT, ApplicationTag.REAL, false, 0));
    
    this.priorityArray = this.addProperty(new BDArrayProperty<ApplicationTag.REAL | ApplicationTag.NULL>(
      PropertyIdentifier.PRIORITY_ARRAY, false, new Array(16).fill({ type: ApplicationTag.NULL, value: null } as BACNetAppData<ApplicationTag.REAL | ApplicationTag.NULL>)));
    
    this.currentCommandPriority = this.addProperty(new BDSingletProperty(
      PropertyIdentifier.CURRENT_COMMAND_PRIORITY, ApplicationTag.UNSIGNED_INTEGER, false, 16));
    
  }
  
}