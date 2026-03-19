import { it, describe, beforeEach, afterEach } from 'node:test';
import { deepStrictEqual } from 'node:assert';
import { BDDevice } from '../objects/device/device.js';
import { bsReadProperty, bsWriteProperty } from './bacnet-stack-client.js';
import { BDPositiveIntegerValue } from '../objects/numeric/positiveintegervalue.js';
import { ApplicationTag, EngineeringUnits, ObjectType, PropertyIdentifier } from '@bacnet-js/client';

describe('PositiveIntegerValue', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDPositiveIntegerValue({
      name: 'Test PIV',
      description: 'A test positive integer value',
      unit: EngineeringUnits.NO_UNITS,
      presentValue: 99,
      covIncrement: 10,
      minPresentValue: 0,
      maxPresentValue: 500,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read the object\'s Present_Value property', async () => {
    const value = await bsReadProperty(1, ObjectType.POSITIVE_INTEGER_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseInt(value), 99);
  });

  it('should read the object\'s Units property', async () => {
    const value = await bsReadProperty(1, ObjectType.POSITIVE_INTEGER_VALUE, 1, PropertyIdentifier.UNITS);
    deepStrictEqual(value.trim(), 'no-units');
  });

  it('should read the object\'s Object_Name property', async () => {
    const value = await bsReadProperty(1, ObjectType.POSITIVE_INTEGER_VALUE, 1, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Test PIV"');
  });

  it('should read the object\'s Object_Type property', async () => {
    const value = await bsReadProperty(1, ObjectType.POSITIVE_INTEGER_VALUE, 1, PropertyIdentifier.OBJECT_TYPE);
    deepStrictEqual(value.trim(), 'positive-integer-value');
  });

  it('should read the object\'s Description property', async () => {
    const value = await bsReadProperty(1, ObjectType.POSITIVE_INTEGER_VALUE, 1, PropertyIdentifier.DESCRIPTION);
    deepStrictEqual(value.trim(), '"A test positive integer value"');
  });

  it('should read the object\'s Status_Flags property', async () => {
    const value = await bsReadProperty(1, ObjectType.POSITIVE_INTEGER_VALUE, 1, PropertyIdentifier.STATUS_FLAGS);
    deepStrictEqual(value.trim(), '{false,false,false,false}');
  });

  it('should read the object\'s Event_State property', async () => {
    const value = await bsReadProperty(1, ObjectType.POSITIVE_INTEGER_VALUE, 1, PropertyIdentifier.EVENT_STATE);
    deepStrictEqual(value.trim(), 'normal');
  });

  it('should read the object\'s Out_Of_Service property', async () => {
    const value = await bsReadProperty(1, ObjectType.POSITIVE_INTEGER_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE);
    deepStrictEqual(value.trim(), 'FALSE');
  });

  it('should read the object\'s Reliability property', async () => {
    const value = await bsReadProperty(1, ObjectType.POSITIVE_INTEGER_VALUE, 1, PropertyIdentifier.RELIABILITY);
    deepStrictEqual(value.trim(), 'no-fault-detected');
  });

  it('should read the object\'s COV_Increment property', async () => {
    const value = await bsReadProperty(1, ObjectType.POSITIVE_INTEGER_VALUE, 1, PropertyIdentifier.COV_INCREMENT);
    deepStrictEqual(parseInt(value), 10);
  });

  it('should read the object\'s Min_Pres_Value property', async () => {
    const value = await bsReadProperty(1, ObjectType.POSITIVE_INTEGER_VALUE, 1, PropertyIdentifier.MIN_PRES_VALUE);
    deepStrictEqual(parseInt(value), 0);
  });

  it('should read the object\'s Max_Pres_Value property', async () => {
    const value = await bsReadProperty(1, ObjectType.POSITIVE_INTEGER_VALUE, 1, PropertyIdentifier.MAX_PRES_VALUE);
    deepStrictEqual(parseInt(value), 500);
  });

  it('should read the object\'s Object_Identifier property', async () => {
    const value = await bsReadProperty(1, ObjectType.POSITIVE_INTEGER_VALUE, 1, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(value.trim(), '(positive-integer-value, 1)');
  });

});

describe('PositiveIntegerValue (writable)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDPositiveIntegerValue({
      name: 'Writable PIV',
      unit: EngineeringUnits.NO_UNITS,
      presentValue: 0,
      writable: true,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should write and read back a Present_Value', async () => {
    await bsWriteProperty(1, ObjectType.POSITIVE_INTEGER_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.UNSIGNED_INTEGER, 250);
    const value = await bsReadProperty(1, ObjectType.POSITIVE_INTEGER_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseInt(value), 250);
  });

  it('should write and read back a zero Present_Value', async () => {
    await bsWriteProperty(1, ObjectType.POSITIVE_INTEGER_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.UNSIGNED_INTEGER, 100);
    await bsWriteProperty(1, ObjectType.POSITIVE_INTEGER_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.UNSIGNED_INTEGER, 0);
    const value = await bsReadProperty(1, ObjectType.POSITIVE_INTEGER_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseInt(value), 0);
  });

  it('should write and read back a large Present_Value', async () => {
    await bsWriteProperty(1, ObjectType.POSITIVE_INTEGER_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.UNSIGNED_INTEGER, 1000000);
    const value = await bsReadProperty(1, ObjectType.POSITIVE_INTEGER_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseInt(value), 1000000);
  });

});

describe('PositiveIntegerValue (multiple objects)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDPositiveIntegerValue({
      name: 'First PIV',
      unit: EngineeringUnits.NO_UNITS,
      presentValue: 10,
    }));
    device.addObject(new BDPositiveIntegerValue({
      name: 'Second PIV',
      unit: EngineeringUnits.NO_UNITS,
      presentValue: 200,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read Present_Value from the first object', async () => {
    const value = await bsReadProperty(1, ObjectType.POSITIVE_INTEGER_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseInt(value), 10);
  });

  it('should read Present_Value from the second object', async () => {
    const value = await bsReadProperty(1, ObjectType.POSITIVE_INTEGER_VALUE, 2, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseInt(value), 200);
  });

  it('should read Object_Name from the first object', async () => {
    const value = await bsReadProperty(1, ObjectType.POSITIVE_INTEGER_VALUE, 1, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"First PIV"');
  });

  it('should read Object_Name from the second object', async () => {
    const value = await bsReadProperty(1, ObjectType.POSITIVE_INTEGER_VALUE, 2, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Second PIV"');
  });

});