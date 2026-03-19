import { it, describe, beforeEach, afterEach } from 'node:test';
import { deepStrictEqual } from 'node:assert';
import { BDDevice } from '../objects/device/device.js';
import { bsReadProperty } from './bacnet-stack-client.js';
import { BDDateTimeValue } from '../objects/temporal/datetimevalue.js';
import { ObjectType, PropertyIdentifier } from '@bacnet-js/client';

describe('DateTimeValue', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDDateTimeValue({
      name: 'Test DTV',
      description: 'A test datetime value',
      presentValue: new Date('2025-06-15T14:30:45.000Z'),
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read the object\'s Present_Value property', async () => {
    const value = await bsReadProperty(1, ObjectType.DATETIME_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), '{Sunday, June 15, 2025-14:30:45.00}');
  });

  it('should read the object\'s Object_Name property', async () => {
    const value = await bsReadProperty(1, ObjectType.DATETIME_VALUE, 1, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Test DTV"');
  });

  it('should read the object\'s Object_Type property', async () => {
    const value = await bsReadProperty(1, ObjectType.DATETIME_VALUE, 1, PropertyIdentifier.OBJECT_TYPE);
    deepStrictEqual(value.trim(), 'datetime-value');
  });

  it('should read the object\'s Description property', async () => {
    const value = await bsReadProperty(1, ObjectType.DATETIME_VALUE, 1, PropertyIdentifier.DESCRIPTION);
    deepStrictEqual(value.trim(), '"A test datetime value"');
  });

  it('should read the object\'s Status_Flags property', async () => {
    const value = await bsReadProperty(1, ObjectType.DATETIME_VALUE, 1, PropertyIdentifier.STATUS_FLAGS);
    deepStrictEqual(value.trim(), '{false,false,false,false}');
  });

  it('should read the object\'s Event_State property', async () => {
    const value = await bsReadProperty(1, ObjectType.DATETIME_VALUE, 1, PropertyIdentifier.EVENT_STATE);
    deepStrictEqual(value.trim(), 'normal');
  });

  it('should read the object\'s Out_Of_Service property', async () => {
    const value = await bsReadProperty(1, ObjectType.DATETIME_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE);
    deepStrictEqual(value.trim(), 'FALSE');
  });

  it('should read the object\'s Reliability property', async () => {
    const value = await bsReadProperty(1, ObjectType.DATETIME_VALUE, 1, PropertyIdentifier.RELIABILITY);
    deepStrictEqual(value.trim(), 'no-fault-detected');
  });

  it('should read the object\'s Object_Identifier property', async () => {
    const value = await bsReadProperty(1, ObjectType.DATETIME_VALUE, 1, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(value.trim(), '(datetime-value, 1)');
  });

});

describe('DateTimeValue (midnight new year)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDDateTimeValue({
      name: 'New Year DTV',
      presentValue: new Date('2025-01-01T00:00:00.000Z'),
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read midnight on January 1st correctly', async () => {
    const value = await bsReadProperty(1, ObjectType.DATETIME_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), '{Wednesday, January 1, 2025-00:00:00.00}');
  });

});

describe('DateTimeValue (end of day)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDDateTimeValue({
      name: 'End of Day DTV',
      presentValue: new Date('2025-12-31T23:59:59.000Z'),
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read end of day on December 31st correctly', async () => {
    const value = await bsReadProperty(1, ObjectType.DATETIME_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), '{Wednesday, December 31, 2025-23:59:59.00}');
  });

});

describe('DateTimeValue (leap year)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDDateTimeValue({
      name: 'Leap Day DTV',
      presentValue: new Date('2024-02-29T12:15:30.000Z'),
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read February 29th on a leap year correctly', async () => {
    const value = await bsReadProperty(1, ObjectType.DATETIME_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), '{Thursday, February 29, 2024-12:15:30.00}');
  });

});

describe('DateTimeValue (multiple objects)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDDateTimeValue({
      name: 'Event Start',
      presentValue: new Date('2025-03-15T09:00:00.000Z'),
    }));
    device.addObject(new BDDateTimeValue({
      name: 'Event End',
      presentValue: new Date('2025-03-15T17:45:30.000Z'),
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read Present_Value from the first object', async () => {
    const value = await bsReadProperty(1, ObjectType.DATETIME_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), '{Saturday, March 15, 2025-09:00:00.00}');
  });

  it('should read Present_Value from the second object', async () => {
    const value = await bsReadProperty(1, ObjectType.DATETIME_VALUE, 2, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), '{Saturday, March 15, 2025-17:45:30.00}');
  });

  it('should read Object_Name from the first object', async () => {
    const value = await bsReadProperty(1, ObjectType.DATETIME_VALUE, 1, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Event Start"');
  });

  it('should read Object_Name from the second object', async () => {
    const value = await bsReadProperty(1, ObjectType.DATETIME_VALUE, 2, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Event End"');
  });

  it('should read Object_Identifier from both objects', async () => {
    const value1 = await bsReadProperty(1, ObjectType.DATETIME_VALUE, 1, PropertyIdentifier.OBJECT_IDENTIFIER);
    const value2 = await bsReadProperty(1, ObjectType.DATETIME_VALUE, 2, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(value1.trim(), '(datetime-value, 1)');
    deepStrictEqual(value2.trim(), '(datetime-value, 2)');
  });

});