import { it, describe, beforeEach, afterEach } from 'node:test';
import { deepStrictEqual, match } from 'node:assert';
import { BDDevice } from '../objects/device/device.js';
import { bsReadProperty } from './bacnet-stack-client.js';
import { BDTimeValue } from '../objects/temporal/timevalue.js';
import { ObjectType, PropertyIdentifier } from '@bacnet-js/client';

describe('TimeValue', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDTimeValue({
      name: 'Test TV',
      description: 'A test time value',
      presentValue: new Date('2025-06-15T14:30:45.000Z'),
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read the object\'s Present_Value property', async () => {
    const value = await bsReadProperty(1, ObjectType.TIME_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), '14:30:45.00');
  });

  it('should read the object\'s Object_Name property', async () => {
    const value = await bsReadProperty(1, ObjectType.TIME_VALUE, 1, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Test TV"');
  });

  it('should read the object\'s Object_Type property', async () => {
    const value = await bsReadProperty(1, ObjectType.TIME_VALUE, 1, PropertyIdentifier.OBJECT_TYPE);
    deepStrictEqual(value.trim(), 'time-value');
  });

  it('should read the object\'s Description property', async () => {
    const value = await bsReadProperty(1, ObjectType.TIME_VALUE, 1, PropertyIdentifier.DESCRIPTION);
    deepStrictEqual(value.trim(), '"A test time value"');
  });

  it('should read the object\'s Status_Flags property', async () => {
    const value = await bsReadProperty(1, ObjectType.TIME_VALUE, 1, PropertyIdentifier.STATUS_FLAGS);
    deepStrictEqual(value.trim(), '{false,false,false,false}');
  });

  it('should read the object\'s Event_State property', async () => {
    const value = await bsReadProperty(1, ObjectType.TIME_VALUE, 1, PropertyIdentifier.EVENT_STATE);
    deepStrictEqual(value.trim(), 'normal');
  });

  it('should read the object\'s Out_Of_Service property', async () => {
    const value = await bsReadProperty(1, ObjectType.TIME_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE);
    deepStrictEqual(value.trim(), 'FALSE');
  });

  it('should read the object\'s Reliability property', async () => {
    const value = await bsReadProperty(1, ObjectType.TIME_VALUE, 1, PropertyIdentifier.RELIABILITY);
    deepStrictEqual(value.trim(), 'no-fault-detected');
  });

  it('should read the object\'s Object_Identifier property', async () => {
    const value = await bsReadProperty(1, ObjectType.TIME_VALUE, 1, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(value.trim(), '(time-value, 1)');
  });

});

describe('TimeValue (midnight)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDTimeValue({
      name: 'Midnight TV',
      presentValue: new Date('2025-01-01T00:00:00.000Z'),
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read midnight as 00:00:00.00', async () => {
    const value = await bsReadProperty(1, ObjectType.TIME_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), '00:00:00.00');
  });

});

describe('TimeValue (end of day)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDTimeValue({
      name: 'Late TV',
      presentValue: new Date('2025-01-01T23:59:59.000Z'),
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read end-of-day time correctly', async () => {
    const value = await bsReadProperty(1, ObjectType.TIME_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), '23:59:59.00');
  });

});

describe('TimeValue (multiple objects)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDTimeValue({
      name: 'Start Time',
      presentValue: new Date('2025-06-15T08:00:00.000Z'),
    }));
    device.addObject(new BDTimeValue({
      name: 'End Time',
      presentValue: new Date('2025-06-15T17:30:00.000Z'),
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read Present_Value from the first object', async () => {
    const value = await bsReadProperty(1, ObjectType.TIME_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), '08:00:00.00');
  });

  it('should read Present_Value from the second object', async () => {
    const value = await bsReadProperty(1, ObjectType.TIME_VALUE, 2, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), '17:30:00.00');
  });

  it('should read Object_Name from the first object', async () => {
    const value = await bsReadProperty(1, ObjectType.TIME_VALUE, 1, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Start Time"');
  });

  it('should read Object_Name from the second object', async () => {
    const value = await bsReadProperty(1, ObjectType.TIME_VALUE, 2, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"End Time"');
  });

  it('should read Object_Identifier from both objects', async () => {
    const value1 = await bsReadProperty(1, ObjectType.TIME_VALUE, 1, PropertyIdentifier.OBJECT_IDENTIFIER);
    const value2 = await bsReadProperty(1, ObjectType.TIME_VALUE, 2, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(value1.trim(), '(time-value, 1)');
    deepStrictEqual(value2.trim(), '(time-value, 2)');
  });

});