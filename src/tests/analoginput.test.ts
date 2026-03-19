import { it, describe, beforeEach, afterEach } from 'node:test';
import { deepStrictEqual } from 'node:assert';
import { BDDevice } from '../objects/device/device.js';
import { bsReadProperty } from './bacnet-stack-client.js';
import { BDAnalogInput } from '../objects/numeric/analoginput.js';
import { EngineeringUnits, ObjectType, PropertyIdentifier } from '@bacnet-js/client';

describe('AnalogInput', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDAnalogInput({
      name: 'Test AI',
      description: 'A test analog input',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      presentValue: 23.1,
      covIncrement: 0.5,
      minPresentValue: -40,
      maxPresentValue: 120,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read the object\'s Present_Value property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_INPUT, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseFloat(value), 23.1);
  });

  it('should read the object\'s Units property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_INPUT, 1, PropertyIdentifier.UNITS);
    deepStrictEqual(value.trim(), 'degrees-celsius');
  });

  it('should read the object\'s Object_Name property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_INPUT, 1, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Test AI"');
  });

  it('should read the object\'s Object_Type property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_INPUT, 1, PropertyIdentifier.OBJECT_TYPE);
    deepStrictEqual(value.trim(), 'analog-input');
  });

  it('should read the object\'s Description property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_INPUT, 1, PropertyIdentifier.DESCRIPTION);
    deepStrictEqual(value.trim(), '"A test analog input"');
  });

  it('should read the object\'s Status_Flags property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_INPUT, 1, PropertyIdentifier.STATUS_FLAGS);
    deepStrictEqual(value.trim(), '{false,false,false,false}');
  });

  it('should read the object\'s Event_State property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_INPUT, 1, PropertyIdentifier.EVENT_STATE);
    deepStrictEqual(value.trim(), 'normal');
  });

  it('should read the object\'s Out_Of_Service property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_INPUT, 1, PropertyIdentifier.OUT_OF_SERVICE);
    deepStrictEqual(value.trim(), 'FALSE');
  });

  it('should read the object\'s Reliability property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_INPUT, 1, PropertyIdentifier.RELIABILITY);
    deepStrictEqual(value.trim(), 'no-fault-detected');
  });

  it('should read the object\'s COV_Increment property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_INPUT, 1, PropertyIdentifier.COV_INCREMENT);
    deepStrictEqual(parseFloat(value), 0.5);
  });

  it('should read the object\'s Min_Pres_Value property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_INPUT, 1, PropertyIdentifier.MIN_PRES_VALUE);
    deepStrictEqual(parseFloat(value), -40);
  });

  it('should read the object\'s Max_Pres_Value property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_INPUT, 1, PropertyIdentifier.MAX_PRES_VALUE);
    deepStrictEqual(parseFloat(value), 120);
  });

  it('should read the object\'s Object_Identifier property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_INPUT, 1, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(value.trim(), '(analog-input, 1)');
  });

});

describe('AnalogInput (multiple objects)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDAnalogInput({
      name: 'Temperature Sensor',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      presentValue: 22.5,
    }));
    device.addObject(new BDAnalogInput({
      name: 'Pressure Sensor',
      unit: EngineeringUnits.PASCALS,
      presentValue: 101325,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read Present_Value from the first object', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_INPUT, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseFloat(value), 22.5);
  });

  it('should read Present_Value from the second object', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_INPUT, 2, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseFloat(value), 101325);
  });

  it('should read Object_Name from the first object', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_INPUT, 1, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Temperature Sensor"');
  });

  it('should read Object_Name from the second object', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_INPUT, 2, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Pressure Sensor"');
  });

  it('should read Units from the first object', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_INPUT, 1, PropertyIdentifier.UNITS);
    deepStrictEqual(value.trim(), 'degrees-celsius');
  });

  it('should read Units from the second object', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_INPUT, 2, PropertyIdentifier.UNITS);
    deepStrictEqual(value.trim(), 'pascals');
  });

});