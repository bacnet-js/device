import { it, describe, beforeEach, afterEach } from 'node:test';
import { deepStrictEqual } from 'node:assert';
import { BDDevice } from '../objects/device/device.js';
import { bsReadProperty, bsWriteProperty } from './bacnet-stack-client.js';
import { BDAnalogValue } from '../objects/numeric/analogvalue.js';
import { ApplicationTag, EngineeringUnits, ObjectType, PropertyIdentifier } from '@bacnet-js/client';

// ─── describe block 1: Priority Array ────────────────────────────────────────

describe('BDPresentValueSingletProperty - Priority Array (AnalogValue)', () => {

  let device: BDDevice;
  let av: BDAnalogValue;

  const ALL_NULL = '{Null,Null,Null,Null,Null,Null,Null,Null,Null,Null,Null,Null,Null,Null,Null,Null}';

  beforeEach(async () => {
    device = new BDDevice(1, { name: 'Test Device' });
    device.on('error', console.error);
    av = new BDAnalogValue({
      name: 'Test AV Priority',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      presentValue: 25,
      writable: true,
    });
    device.addObject(av);
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read Priority_Array as all-null initially', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRIORITY_ARRAY);
    deepStrictEqual(value.trim(), ALL_NULL);
  });

  it('should read Relinquish_Default as the initial presentValue', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.RELINQUISH_DEFAULT);
    deepStrictEqual(parseFloat(value), 25);
  });

  it('should read Current_Command_Priority as 16 initially', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.CURRENT_COMMAND_PRIORITY);
    deepStrictEqual(parseInt(value, 10), 16);
  });

  it('should update Priority_Array at the written priority slot after a write', async () => {
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 8, ApplicationTag.REAL, 50);
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRIORITY_ARRAY, 8);
    deepStrictEqual(parseFloat(value), 50);
  });

  it('should update Priority_Array at the written priority slot after a local write', async () => {
    await av.presentValue.setValue(50, 8);
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRIORITY_ARRAY, 8);
    deepStrictEqual(parseFloat(value), 50);
  });

  it('should reflect the written value in Present_Value after writing at a priority', async () => {
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 8, ApplicationTag.REAL, 50);
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseFloat(value), 50);
  });

  it('should reflect the written value in Present_Value after locally writing at a priority', async () => {
    await av.presentValue.setValue(50, 8);
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseFloat(value), 50);
  });

  it('should update Current_Command_Priority to the written priority level', async () => {
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 8, ApplicationTag.REAL, 50);
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.CURRENT_COMMAND_PRIORITY);
    deepStrictEqual(parseInt(value, 10), 8);
  });

  it('should give precedence to a higher-priority write (lower priority number)', async () => {
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 8, ApplicationTag.REAL, 50);
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 4, ApplicationTag.REAL, 80);
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseFloat(value), 80);
  });

  it('should update Current_Command_Priority to the highest active priority', async () => {
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 8, ApplicationTag.REAL, 50);
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 4, ApplicationTag.REAL, 80);
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.CURRENT_COMMAND_PRIORITY);
    deepStrictEqual(parseInt(value, 10), 4);
  });

  it('should preserve both priorities in the Priority_Array when two priorities are active', async () => {
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 8, ApplicationTag.REAL, 50);
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 4, ApplicationTag.REAL, 80);
    const element4 = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRIORITY_ARRAY, 4);
    const element8 = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRIORITY_ARRAY, 8);
    deepStrictEqual(parseFloat(element4), 80);
    deepStrictEqual(parseFloat(element8), 50);
  });

  it('should revert Present_Value to the lower priority when the higher priority is released', async () => {
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 8, ApplicationTag.REAL, 50);
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 4, ApplicationTag.REAL, 80);
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 4, ApplicationTag.NULL, 0);
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseFloat(value), 50);
  });

  it('should update Current_Command_Priority after releasing the higher priority', async () => {
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 8, ApplicationTag.REAL, 50);
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 4, ApplicationTag.REAL, 80);
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 4, ApplicationTag.NULL, 0);
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.CURRENT_COMMAND_PRIORITY);
    deepStrictEqual(parseInt(value, 10), 8);
  });

  it('should revert Present_Value to Relinquish_Default when all priorities are released', async () => {
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 8, ApplicationTag.REAL, 50);
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 8, ApplicationTag.NULL, 0);
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseFloat(value), 25);
  });

  it('should restore all-null Priority_Array after all priorities are released', async () => {
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 8, ApplicationTag.REAL, 50);
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 8, ApplicationTag.NULL, 0);
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRIORITY_ARRAY);
    deepStrictEqual(value.trim(), ALL_NULL);
  });

  it('should restore Current_Command_Priority to 16 after all priorities are released', async () => {
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 8, ApplicationTag.REAL, 50);
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 8, ApplicationTag.NULL, 0);
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.CURRENT_COMMAND_PRIORITY);
    deepStrictEqual(parseInt(value, 10), 16);
  });

});

// ─── describe block 2: Priority 1 (highest) ──────────────────────────────────

describe('BDPresentValueSingletProperty - Priority 1 (highest) (AnalogValue)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, { name: 'Test Device' });
    device.on('error', console.error);
    device.addObject(new BDAnalogValue({
      name: 'Test AV Priority1',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      presentValue: 0,
      writable: true,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should give priority 1 (highest) precedence over lower priorities', async () => {
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.REAL, 10);
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 1, ApplicationTag.REAL, 99);
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseFloat(value), 99);
  });

  it('should update Current_Command_Priority to 1 when priority 1 is written', async () => {
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.REAL, 10);
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 1, ApplicationTag.REAL, 99);
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.CURRENT_COMMAND_PRIORITY);
    deepStrictEqual(parseInt(value, 10), 1);
  });

});
