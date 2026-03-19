import { it, describe, beforeEach, afterEach } from 'node:test';
import { deepStrictEqual, match } from 'node:assert';
import { BDDevice } from '../objects/device/device.js';
import { bsReadProperty, bsWriteProperty } from './bacnet-stack-client.js';
import { BDAnalogOutput } from '../objects/numeric/analogoutput.js';
import { ApplicationTag, EngineeringUnits, ObjectType, PropertyIdentifier } from '@bacnet-js/client';

describe('AnalogOutput', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDAnalogOutput({
      name: 'Test AO',
      description: 'A test analog output',
      unit: EngineeringUnits.PERCENT,
      presentValue: 75,
      covIncrement: 2,
      minPresentValue: 0,
      maxPresentValue: 100,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read the object\'s Present_Value property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_OUTPUT, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseFloat(value), 75);
  });

  it('should read the object\'s Units property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_OUTPUT, 1, PropertyIdentifier.UNITS);
    deepStrictEqual(value.trim(), 'percent');
  });

  it('should read the object\'s Object_Name property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_OUTPUT, 1, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Test AO"');
  });

  it('should read the object\'s Object_Type property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_OUTPUT, 1, PropertyIdentifier.OBJECT_TYPE);
    deepStrictEqual(value.trim(), 'analog-output');
  });

  it('should read the object\'s Description property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_OUTPUT, 1, PropertyIdentifier.DESCRIPTION);
    deepStrictEqual(value.trim(), '"A test analog output"');
  });

  it('should read the object\'s Status_Flags property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_OUTPUT, 1, PropertyIdentifier.STATUS_FLAGS);
    deepStrictEqual(value.trim(), '{false,false,false,false}');
  });

  it('should read the object\'s Event_State property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_OUTPUT, 1, PropertyIdentifier.EVENT_STATE);
    deepStrictEqual(value.trim(), 'normal');
  });

  it('should read the object\'s Out_Of_Service property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_OUTPUT, 1, PropertyIdentifier.OUT_OF_SERVICE);
    deepStrictEqual(value.trim(), 'FALSE');
  });

  it('should read the object\'s Reliability property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_OUTPUT, 1, PropertyIdentifier.RELIABILITY);
    deepStrictEqual(value.trim(), 'no-fault-detected');
  });

  it('should read the object\'s COV_Increment property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_OUTPUT, 1, PropertyIdentifier.COV_INCREMENT);
    deepStrictEqual(parseFloat(value), 2);
  });

  it('should read the object\'s Min_Pres_Value property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_OUTPUT, 1, PropertyIdentifier.MIN_PRES_VALUE);
    deepStrictEqual(parseFloat(value), 0);
  });

  it('should read the object\'s Max_Pres_Value property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_OUTPUT, 1, PropertyIdentifier.MAX_PRES_VALUE);
    deepStrictEqual(parseFloat(value), 100);
  });

  it('should read the object\'s Object_Identifier property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_OUTPUT, 1, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(value.trim(), '(analog-output, 1)');
  });

  it('should read the object\'s Relinquish_Default property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_OUTPUT, 1, PropertyIdentifier.RELINQUISH_DEFAULT);
    deepStrictEqual(parseFloat(value), 0);
  });

  it('should read the object\'s Priority_Array property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_OUTPUT, 1, PropertyIdentifier.PRIORITY_ARRAY);
    deepStrictEqual(value.trim(), '{Null,Null,Null,Null,Null,Null,Null,Null,Null,Null,Null,Null,Null,Null,Null,Null}');
  });

});

describe('AnalogOutput (writable)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDAnalogOutput({
      name: 'Writable AO',
      unit: EngineeringUnits.PERCENT,
      presentValue: 0,
      writable: true,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should write and read back a new Present_Value', async () => {
    await bsWriteProperty(1, ObjectType.ANALOG_OUTPUT, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.REAL, 55.5);
    const value = await bsReadProperty(1, ObjectType.ANALOG_OUTPUT, 1, PropertyIdentifier.PRESENT_VALUE);
    match(value, /55\.5/);
  });

  it('should write and read back a zero Present_Value', async () => {
    await bsWriteProperty(1, ObjectType.ANALOG_OUTPUT, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.REAL, 80);
    await bsWriteProperty(1, ObjectType.ANALOG_OUTPUT, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.REAL, 0);
    const value = await bsReadProperty(1, ObjectType.ANALOG_OUTPUT, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseFloat(value), 0);
  });

});

describe('AnalogOutput (multiple objects)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDAnalogOutput({
      name: 'Valve Output',
      unit: EngineeringUnits.PERCENT,
      presentValue: 50,
    }));
    device.addObject(new BDAnalogOutput({
      name: 'Damper Output',
      unit: EngineeringUnits.PERCENT,
      presentValue: 75,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read Present_Value from the first object', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_OUTPUT, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseFloat(value), 50);
  });

  it('should read Present_Value from the second object', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_OUTPUT, 2, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseFloat(value), 75);
  });

  it('should read Object_Name from the first object', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_OUTPUT, 1, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Valve Output"');
  });

  it('should read Object_Name from the second object', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_OUTPUT, 2, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Damper Output"');
  });

  it('should read Relinquish_Default from both objects', async () => {
    const value1 = await bsReadProperty(1, ObjectType.ANALOG_OUTPUT, 1, PropertyIdentifier.RELINQUISH_DEFAULT);
    const value2 = await bsReadProperty(1, ObjectType.ANALOG_OUTPUT, 2, PropertyIdentifier.RELINQUISH_DEFAULT);
    deepStrictEqual(parseFloat(value1), 0);
    deepStrictEqual(parseFloat(value2), 0);
  });

  it('should read Priority_Array from both objects', async () => {
    const allNull = '{Null,Null,Null,Null,Null,Null,Null,Null,Null,Null,Null,Null,Null,Null,Null,Null}';
    const value1 = await bsReadProperty(1, ObjectType.ANALOG_OUTPUT, 1, PropertyIdentifier.PRIORITY_ARRAY);
    const value2 = await bsReadProperty(1, ObjectType.ANALOG_OUTPUT, 2, PropertyIdentifier.PRIORITY_ARRAY);
    deepStrictEqual(value1.trim(), allNull);
    deepStrictEqual(value2.trim(), allNull);
  });

});