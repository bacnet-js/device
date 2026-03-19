import { it, describe, beforeEach, afterEach } from 'node:test';
import { deepStrictEqual, match, ok } from 'node:assert';
import { BDDevice } from '../objects/device/device.js';
import { bsReadProperty, bsWriteProperty } from './bacnet-stack-client.js';
import { BDAnalogValue } from '../objects/numeric/analogvalue.js';
import { ApplicationTag, EngineeringUnits, ObjectType, PropertyIdentifier } from '@bacnet-js/client';

describe('AnalogValue', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDAnalogValue({
      name: 'Test Value',
      description: 'A test analog value',
      unit: EngineeringUnits.AMPERES,
      presentValue: 42.5,
      covIncrement: 1.5,
      minPresentValue: -100,
      maxPresentValue: 100,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read the object\'s Present_Value property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseFloat(value), 42.5);
  });

  it('should read the object\'s Units property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.UNITS);
    deepStrictEqual(value.trim(), 'amperes');
  });

  it('should read the object\'s Object_Name property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Test Value"');
  });

  it('should read the object\'s Object_Type property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OBJECT_TYPE);
    deepStrictEqual(value.trim(), 'analog-value');
  });

  it('should read the object\'s Description property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.DESCRIPTION);
    deepStrictEqual(value.trim(), '"A test analog value"');
  });

  it('should read the object\'s Status_Flags property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.STATUS_FLAGS);
    deepStrictEqual(value.trim(), '{false,false,false,false}');
  });

  it('should read the object\'s Event_State property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.EVENT_STATE);
    deepStrictEqual(value.trim(), 'normal');
  });

  it('should read the object\'s Out_Of_Service property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE);
    deepStrictEqual(value.trim(), 'FALSE');
  });

  it('should read the object\'s Reliability property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.RELIABILITY);
    deepStrictEqual(value.trim(), 'no-fault-detected');
  });

  it('should read the object\'s COV_Increment property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.COV_INCREMENT);
    deepStrictEqual(parseFloat(value), 1.5);
  });

  it('should read the object\'s Min_Pres_Value property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.MIN_PRES_VALUE);
    deepStrictEqual(parseFloat(value), -100);
  });

  it('should read the object\'s Max_Pres_Value property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.MAX_PRES_VALUE);
    deepStrictEqual(parseFloat(value), 100);
  });

  it('should read the object\'s Object_Identifier property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(value.trim(), '(analog-value, 1)');
  });

});

describe('AnalogValue (writable)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDAnalogValue({
      name: 'Writable AV',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      presentValue: 0,
      writable: true,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should write and read back a new Present_Value', async () => {
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.REAL, 99.9);
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    match(value, /99\.9/);
  });

  it('should write and read back a negative Present_Value', async () => {
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.REAL, -25.3);
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    ok(Math.abs(parseFloat(value) - (-25.3)) < 0.01, `Expected approximately -25.3, got ${value.trim()}`);
  });

  it('should write and read back a zero Present_Value', async () => {
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.REAL, 50);
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.REAL, 0);
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseFloat(value), 0);
  });

});

describe('AnalogValue (multiple objects)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDAnalogValue({
      name: 'First AV',
      unit: EngineeringUnits.AMPERES,
      presentValue: 10,
    }));
    device.addObject(new BDAnalogValue({
      name: 'Second AV',
      unit: EngineeringUnits.VOLTS,
      presentValue: 20,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read Present_Value from the first object', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseFloat(value), 10);
  });

  it('should read Present_Value from the second object', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 2, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseFloat(value), 20);
  });

  it('should read Object_Name from the first object', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"First AV"');
  });

  it('should read Object_Name from the second object', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 2, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Second AV"');
  });

  it('should read Units from the first object', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.UNITS);
    deepStrictEqual(value.trim(), 'amperes');
  });

  it('should read Units from the second object', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 2, PropertyIdentifier.UNITS);
    deepStrictEqual(value.trim(), 'volts');
  });

});