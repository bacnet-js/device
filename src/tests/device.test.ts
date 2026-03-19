import { it, describe, beforeEach, afterEach } from 'node:test';
import { deepStrictEqual } from 'node:assert';
import { BDDevice } from '../objects/device/device.js';
import { bsReadProperty } from './bacnet-stack-client.js';
import { BDAnalogValue } from '../objects/numeric/analogvalue.js';
import { BDBinaryValue } from '../objects/binaryvalue.js';
import { BDCharacterStringValue } from '../objects/characterstringvalue.js';
import { EngineeringUnits, ObjectType, PropertyIdentifier } from '@bacnet-js/client';

describe('Device', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
      description: 'A test BACnet device',
      vendorName: 'Test Vendor',
      modelName: 'Test Model',
      firmwareRevision: '1.2.3',
      applicationSoftwareVersion: '4.5.6',
      location: 'Test Location',
      serialNumber: 'SN-TEST-001',
      databaseRevision: 42,
    });
    device.on('error', console.error);
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read the device\'s Object_Name property', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Test Device"');
  });

  it('should read the device\'s Object_Type property', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.OBJECT_TYPE);
    deepStrictEqual(value.trim(), 'device');
  });

  it('should read the device\'s Object_Identifier property', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(value.trim(), '(device, 1)');
  });

  it('should read the device\'s Description property', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.DESCRIPTION);
    deepStrictEqual(value.trim(), '"A test BACnet device"');
  });

  it('should read the device\'s Vendor_Name property', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.VENDOR_NAME);
    deepStrictEqual(value.trim(), '"Test Vendor"');
  });

  it('should read the device\'s Vendor_Identifier property', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.VENDOR_IDENTIFIER);
    deepStrictEqual(parseInt(value), 0);
  });

  it('should read the device\'s Model_Name property', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.MODEL_NAME);
    deepStrictEqual(value.trim(), '"Test Model"');
  });

  it('should read the device\'s Firmware_Revision property', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.FIRMWARE_REVISION);
    deepStrictEqual(value.trim(), '"1.2.3"');
  });

  it('should read the device\'s Application_Software_Version property', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.APPLICATION_SOFTWARE_VERSION);
    deepStrictEqual(value.trim(), '"4.5.6"');
  });

  it('should read the device\'s System_Status property', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.SYSTEM_STATUS);
    deepStrictEqual(value.trim(), 'operational');
  });

  it('should read the device\'s Protocol_Version property', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.PROTOCOL_VERSION);
    deepStrictEqual(parseInt(value), 1);
  });

  it('should read the device\'s Protocol_Revision property', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.PROTOCOL_REVISION);
    deepStrictEqual(parseInt(value), 24);
  });

  it('should read the device\'s Database_Revision property', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.DATABASE_REVISION);
    deepStrictEqual(parseInt(value), 42);
  });

  it('should read the device\'s Location property', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.LOCATION);
    deepStrictEqual(value.trim(), '"Test Location"');
  });

  it('should read the device\'s Serial_Number property', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.SERIAL_NUMBER);
    deepStrictEqual(value.trim(), '"SN-TEST-001"');
  });

  it('should read the device\'s Max_APDU_Length_Accepted property', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.MAX_APDU_LENGTH_ACCEPTED);
    deepStrictEqual(parseInt(value), 1476);
  });

  it('should read the device\'s Segmentation_Supported property', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.SEGMENTATION_SUPPORTED);
    deepStrictEqual(value.trim(), 'segmented-both');
  });

  it('should read the device\'s Max_Segments_Accepted property', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.MAX_SEGMENTS_ACCEPTED);
    deepStrictEqual(parseInt(value), 16);
  });

  it('should read the device\'s APDU_Timeout property', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.APDU_TIMEOUT);
    deepStrictEqual(parseInt(value), 6000);
  });

  it('should read the device\'s Number_Of_APDU_Retries property', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.NUMBER_OF_APDU_RETRIES);
    deepStrictEqual(parseInt(value), 3);
  });

  it('should read the device\'s APDU_Segment_Timeout property', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.APDU_SEGMENT_TIMEOUT);
    deepStrictEqual(parseInt(value), 2000);
  });

  it('should read the device\'s Status_Flags property', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.STATUS_FLAGS);
    deepStrictEqual(value.trim(), '{false,false,false,false}');
  });

  it('should read the device\'s Event_State property', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.EVENT_STATE);
    deepStrictEqual(value.trim(), 'normal');
  });

  it('should read the device\'s Reliability property', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.RELIABILITY);
    deepStrictEqual(value.trim(), 'no-fault-detected');
  });

  it('should read the device\'s Out_Of_Service property', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.OUT_OF_SERVICE);
    deepStrictEqual(value.trim(), 'FALSE');
  });

});

describe('Device (default options)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Default Device',
    });
    device.on('error', console.error);
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should use default Vendor_Name', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.VENDOR_NAME);
    deepStrictEqual(value.trim(), '"@bacnet-js"');
  });

  it('should use default Model_Name', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.MODEL_NAME);
    deepStrictEqual(value.trim(), '"@bacnet-js/device"');
  });

  it('should use default Firmware_Revision', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.FIRMWARE_REVISION);
    deepStrictEqual(value.trim(), '"0.0.1"');
  });

  it('should use default Application_Software_Version', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.APPLICATION_SOFTWARE_VERSION);
    deepStrictEqual(value.trim(), '"0.0.1"');
  });

  it('should use default Database_Revision', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.DATABASE_REVISION);
    deepStrictEqual(parseInt(value), 1);
  });

  it('should use default empty Description', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.DESCRIPTION);
    deepStrictEqual(value.trim(), '""');
  });

});

describe('Device (custom instance number)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(999, {
      name: 'Device 999',
    });
    device.on('error', console.error);
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read the device\'s Object_Identifier with the custom instance number', async () => {
    const value = await bsReadProperty(999, ObjectType.DEVICE, 999, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(value.trim(), '(device, 999)');
  });

  it('should read the device\'s Object_Name', async () => {
    const value = await bsReadProperty(999, ObjectType.DEVICE, 999, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Device 999"');
  });

});

describe('Device (with child objects)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDAnalogValue({
      name: 'AV1',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      presentValue: 22.5,
    }));
    device.addObject(new BDBinaryValue({
      name: 'BV1',
      writable: false,
    }));
    device.addObject(new BDCharacterStringValue({
      name: 'CSV1',
      presentValue: 'test',
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should still read device properties with child objects present', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Test Device"');
  });

  it('should read a child AnalogValue Present_Value', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseFloat(value), 22.5);
  });

  it('should read a child BinaryValue Present_Value', async () => {
    const value = await bsReadProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), 'inactive');
  });

  it('should read a child CharacterStringValue Present_Value', async () => {
    const value = await bsReadProperty(1, ObjectType.CHARACTERSTRING_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), '"test"');
  });

});

describe('Device (custom vendor id)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Vendor Device',
      vendorId: 555,
      vendorName: 'ACME Corp',
    });
    device.on('error', console.error);
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read the custom Vendor_Identifier', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.VENDOR_IDENTIFIER);
    deepStrictEqual(parseInt(value), 555);
  });

  it('should read the custom Vendor_Name', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.VENDOR_NAME);
    deepStrictEqual(value.trim(), '"ACME Corp"');
  });

});