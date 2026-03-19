import { it, describe, beforeEach, afterEach } from 'node:test';
import { deepStrictEqual, match } from 'node:assert';
import { BDDevice } from '../objects/device/device.js';
import { bsReadProperty, bsWriteProperty } from './bacnet-stack-client.js';
import { BDIntegerValue } from '../objects/numeric/integervalue.js';
import { ApplicationTag, EngineeringUnits, ObjectType, PropertyIdentifier } from '@bacnet-js/client';

describe('IntegerValue', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDIntegerValue({
      name: 'Test IV',
      description: 'A test integer value',
      unit: EngineeringUnits.NO_UNITS,
      presentValue: -42,
      covIncrement: 5,
      minPresentValue: -1000,
      maxPresentValue: 1000,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read the object\'s Present_Value property', async () => {
    const value = await bsReadProperty(1, ObjectType.INTEGER_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseInt(value), -42);
  });

  it('should read the object\'s Units property', async () => {
    const value = await bsReadProperty(1, ObjectType.INTEGER_VALUE, 1, PropertyIdentifier.UNITS);
    deepStrictEqual(value.trim(), 'no-units');
  });

  it('should read the object\'s Object_Name property', async () => {
    const value = await bsReadProperty(1, ObjectType.INTEGER_VALUE, 1, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Test IV"');
  });

  it('should read the object\'s Object_Type property', async () => {
    const value = await bsReadProperty(1, ObjectType.INTEGER_VALUE, 1, PropertyIdentifier.OBJECT_TYPE);
    deepStrictEqual(value.trim(), 'integer-value');
  });

  it('should read the object\'s Description property', async () => {
    const value = await bsReadProperty(1, ObjectType.INTEGER_VALUE, 1, PropertyIdentifier.DESCRIPTION);
    deepStrictEqual(value.trim(), '"A test integer value"');
  });

  it('should read the object\'s Status_Flags property', async () => {
    const value = await bsReadProperty(1, ObjectType.INTEGER_VALUE, 1, PropertyIdentifier.STATUS_FLAGS);
    deepStrictEqual(value.trim(), '{false,false,false,false}');
  });

  it('should read the object\'s Event_State property', async () => {
    const value = await bsReadProperty(1, ObjectType.INTEGER_VALUE, 1, PropertyIdentifier.EVENT_STATE);
    deepStrictEqual(value.trim(), 'normal');
  });

  it('should read the object\'s Out_Of_Service property', async () => {
    const value = await bsReadProperty(1, ObjectType.INTEGER_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE);
    deepStrictEqual(value.trim(), 'FALSE');
  });

  it('should read the object\'s Reliability property', async () => {
    const value = await bsReadProperty(1, ObjectType.INTEGER_VALUE, 1, PropertyIdentifier.RELIABILITY);
    deepStrictEqual(value.trim(), 'no-fault-detected');
  });

  it('should read the object\'s COV_Increment property', async () => {
    const value = await bsReadProperty(1, ObjectType.INTEGER_VALUE, 1, PropertyIdentifier.COV_INCREMENT);
    deepStrictEqual(parseInt(value), 5);
  });

  it('should read the object\'s Min_Pres_Value property', async () => {
    const value = await bsReadProperty(1, ObjectType.INTEGER_VALUE, 1, PropertyIdentifier.MIN_PRES_VALUE);
    deepStrictEqual(parseInt(value), -1000);
  });

  it('should read the object\'s Max_Pres_Value property', async () => {
    const value = await bsReadProperty(1, ObjectType.INTEGER_VALUE, 1, PropertyIdentifier.MAX_PRES_VALUE);
    deepStrictEqual(parseInt(value), 1000);
  });

  it('should read the object\'s Object_Identifier property', async () => {
    const value = await bsReadProperty(1, ObjectType.INTEGER_VALUE, 1, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(value.trim(), '(integer-value, 1)');
  });

});

describe('IntegerValue (writable)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDIntegerValue({
      name: 'Writable IV',
      unit: EngineeringUnits.NO_UNITS,
      presentValue: 0,
      writable: true,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should write and read back a positive Present_Value', async () => {
    await bsWriteProperty(1, ObjectType.INTEGER_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.SIGNED_INTEGER, 123);
    const value = await bsReadProperty(1, ObjectType.INTEGER_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseInt(value), 123);
  });

  it('should write and read back a negative Present_Value', async () => {
    await bsWriteProperty(1, ObjectType.INTEGER_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.SIGNED_INTEGER, -456);
    const value = await bsReadProperty(1, ObjectType.INTEGER_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseInt(value), -456);
  });

  it('should write and read back a zero Present_Value', async () => {
    await bsWriteProperty(1, ObjectType.INTEGER_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.SIGNED_INTEGER, 100);
    await bsWriteProperty(1, ObjectType.INTEGER_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.SIGNED_INTEGER, 0);
    const value = await bsReadProperty(1, ObjectType.INTEGER_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseInt(value), 0);
  });

});

describe('IntegerValue (multiple objects)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDIntegerValue({
      name: 'First IV',
      unit: EngineeringUnits.NO_UNITS,
      presentValue: -10,
    }));
    device.addObject(new BDIntegerValue({
      name: 'Second IV',
      unit: EngineeringUnits.NO_UNITS,
      presentValue: 20,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read Present_Value from the first object', async () => {
    const value = await bsReadProperty(1, ObjectType.INTEGER_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseInt(value), -10);
  });

  it('should read Present_Value from the second object', async () => {
    const value = await bsReadProperty(1, ObjectType.INTEGER_VALUE, 2, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseInt(value), 20);
  });

  it('should read Object_Name from the first object', async () => {
    const value = await bsReadProperty(1, ObjectType.INTEGER_VALUE, 1, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"First IV"');
  });

  it('should read Object_Name from the second object', async () => {
    const value = await bsReadProperty(1, ObjectType.INTEGER_VALUE, 2, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Second IV"');
  });

});