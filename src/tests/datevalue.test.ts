import { it, describe, beforeEach, afterEach } from 'node:test';
import { deepStrictEqual } from 'node:assert';
import { BDDevice } from '../objects/device/device.js';
import { bsReadProperty } from './bacnet-stack-client.js';
import { BDDateValue } from '../objects/temporal/datevalue.js';
import { ObjectType, PropertyIdentifier } from '@bacnet-js/client';

describe('DateValue', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDDateValue({
      name: 'Test DV',
      description: 'A test date value',
      presentValue: new Date('2025-06-15T14:30:45.000Z'),
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read the object\'s Present_Value property', async () => {
    const value = await bsReadProperty(1, ObjectType.DATE_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), 'Sunday, June 15, 2025');
  });

  it('should read the object\'s Object_Name property', async () => {
    const value = await bsReadProperty(1, ObjectType.DATE_VALUE, 1, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Test DV"');
  });

  it('should read the object\'s Object_Type property', async () => {
    const value = await bsReadProperty(1, ObjectType.DATE_VALUE, 1, PropertyIdentifier.OBJECT_TYPE);
    deepStrictEqual(value.trim(), 'date-value');
  });

  it('should read the object\'s Description property', async () => {
    const value = await bsReadProperty(1, ObjectType.DATE_VALUE, 1, PropertyIdentifier.DESCRIPTION);
    deepStrictEqual(value.trim(), '"A test date value"');
  });

  it('should read the object\'s Status_Flags property', async () => {
    const value = await bsReadProperty(1, ObjectType.DATE_VALUE, 1, PropertyIdentifier.STATUS_FLAGS);
    deepStrictEqual(value.trim(), '{false,false,false,false}');
  });

  it('should read the object\'s Event_State property', async () => {
    const value = await bsReadProperty(1, ObjectType.DATE_VALUE, 1, PropertyIdentifier.EVENT_STATE);
    deepStrictEqual(value.trim(), 'normal');
  });

  it('should read the object\'s Out_Of_Service property', async () => {
    const value = await bsReadProperty(1, ObjectType.DATE_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE);
    deepStrictEqual(value.trim(), 'FALSE');
  });

  it('should read the object\'s Reliability property', async () => {
    const value = await bsReadProperty(1, ObjectType.DATE_VALUE, 1, PropertyIdentifier.RELIABILITY);
    deepStrictEqual(value.trim(), 'no-fault-detected');
  });

  it('should read the object\'s Object_Identifier property', async () => {
    const value = await bsReadProperty(1, ObjectType.DATE_VALUE, 1, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(value.trim(), '(date-value, 1)');
  });

});

describe('DateValue (new year)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDDateValue({
      name: 'New Year DV',
      presentValue: new Date('2025-01-01T00:00:00.000Z'),
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read January 1st correctly', async () => {
    const value = await bsReadProperty(1, ObjectType.DATE_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), 'Wednesday, January 1, 2025');
  });

});

describe('DateValue (leap year)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDDateValue({
      name: 'Leap Day DV',
      presentValue: new Date('2024-02-29T12:00:00.000Z'),
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read February 29th on a leap year correctly', async () => {
    const value = await bsReadProperty(1, ObjectType.DATE_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), 'Thursday, February 29, 2024');
  });

});

describe('DateValue (end of year)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDDateValue({
      name: 'End of Year DV',
      presentValue: new Date('2025-12-31T23:59:59.000Z'),
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read December 31st correctly', async () => {
    const value = await bsReadProperty(1, ObjectType.DATE_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), 'Wednesday, December 31, 2025');
  });

});

describe('DateValue (multiple objects)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDDateValue({
      name: 'Start Date',
      presentValue: new Date('2025-03-01T00:00:00.000Z'),
    }));
    device.addObject(new BDDateValue({
      name: 'End Date',
      presentValue: new Date('2025-09-30T00:00:00.000Z'),
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read Present_Value from the first object', async () => {
    const value = await bsReadProperty(1, ObjectType.DATE_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), 'Saturday, March 1, 2025');
  });

  it('should read Present_Value from the second object', async () => {
    const value = await bsReadProperty(1, ObjectType.DATE_VALUE, 2, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), 'Tuesday, September 30, 2025');
  });

  it('should read Object_Name from the first object', async () => {
    const value = await bsReadProperty(1, ObjectType.DATE_VALUE, 1, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Start Date"');
  });

  it('should read Object_Name from the second object', async () => {
    const value = await bsReadProperty(1, ObjectType.DATE_VALUE, 2, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"End Date"');
  });

  it('should read Object_Identifier from both objects', async () => {
    const value1 = await bsReadProperty(1, ObjectType.DATE_VALUE, 1, PropertyIdentifier.OBJECT_IDENTIFIER);
    const value2 = await bsReadProperty(1, ObjectType.DATE_VALUE, 2, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(value1.trim(), '(date-value, 1)');
    deepStrictEqual(value2.trim(), '(date-value, 2)');
  });

});