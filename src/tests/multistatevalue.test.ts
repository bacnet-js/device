import { it, describe, beforeEach, afterEach } from 'node:test';
import { deepStrictEqual } from 'node:assert';
import { BDDevice } from '../objects/device/device.js';
import { bsReadProperty, bsWriteProperty } from './bacnet-stack-client.js';
import { BDMultiStateValue } from '../objects/multistatevalue.js';
import { ApplicationTag, ObjectType, PropertyIdentifier } from '@bacnet-js/client';

describe('MultiStateValue', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDMultiStateValue({
      name: 'Test MSV',
      description: 'A test multi-state value',
      states: ['Off', 'Low', 'Medium', 'High'],
      presentValue: 2,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read the object\'s Present_Value property', async () => {
    const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseInt(value), 2);
  });

  it('should read the object\'s Number_Of_States property', async () => {
    const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.NUMBER_OF_STATES);
    deepStrictEqual(parseInt(value), 4);
  });

  it('should read the object\'s State_Text property', async () => {
    const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.STATE_TEXT);
    deepStrictEqual(value.trim(), '{"Off","Low","Medium","High"}');
  });

  it('should read the object\'s Object_Name property', async () => {
    const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Test MSV"');
  });

  it('should read the object\'s Object_Type property', async () => {
    const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.OBJECT_TYPE);
    deepStrictEqual(value.trim(), 'multi-state-value');
  });

  it('should read the object\'s Description property', async () => {
    const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.DESCRIPTION);
    deepStrictEqual(value.trim(), '"A test multi-state value"');
  });

  it('should read the object\'s Status_Flags property', async () => {
    const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.STATUS_FLAGS);
    deepStrictEqual(value.trim(), '{false,false,false,false}');
  });

  it('should read the object\'s Event_State property', async () => {
    const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.EVENT_STATE);
    deepStrictEqual(value.trim(), 'normal');
  });

  it('should read the object\'s Out_Of_Service property', async () => {
    const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE);
    deepStrictEqual(value.trim(), 'FALSE');
  });

  it('should read the object\'s Reliability property', async () => {
    const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.RELIABILITY);
    deepStrictEqual(value.trim(), 'no-fault-detected');
  });

  it('should read the object\'s Object_Identifier property', async () => {
    const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(value.trim(), '(multi-state-value, 1)');
  });

});

describe('MultiStateValue (default present value)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDMultiStateValue({
      name: 'Default MSV',
      states: ['Idle', 'Running'],
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should default to state 1 when no presentValue is provided', async () => {
    const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseInt(value), 1);
  });

  it('should have two states', async () => {
    const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.NUMBER_OF_STATES);
    deepStrictEqual(parseInt(value), 2);
  });

  it('should read state text', async () => {
    const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.STATE_TEXT);
    deepStrictEqual(value.trim(), '{"Idle","Running"}');
  });

});

describe('MultiStateValue (writable)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDMultiStateValue({
      name: 'Writable MSV',
      states: ['Off', 'Low', 'Medium', 'High'],
      writable: true,
      presentValue: 1,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should write and read back state 2', async () => {
    await bsWriteProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.UNSIGNED_INTEGER, 2);
    const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseInt(value), 2);
  });

  it('should write and read back state 4', async () => {
    await bsWriteProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.UNSIGNED_INTEGER, 4);
    const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseInt(value), 4);
  });

  it('should write and read back state 1', async () => {
    await bsWriteProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.UNSIGNED_INTEGER, 3);
    await bsWriteProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.UNSIGNED_INTEGER, 1);
    const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseInt(value), 1);
  });

  it('should cycle through all states', async () => {
    for (let state = 1; state <= 4; state++) {
      await bsWriteProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.UNSIGNED_INTEGER, state);
      const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
      deepStrictEqual(parseInt(value), state);
    }
  });

});

describe('MultiStateValue (single state)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDMultiStateValue({
      name: 'Single State MSV',
      states: ['Only'],
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should have one state', async () => {
    const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.NUMBER_OF_STATES);
    deepStrictEqual(parseInt(value), 1);
  });

  it('should read state text with a single entry', async () => {
    const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.STATE_TEXT);
    deepStrictEqual(value.trim(), '"Only"');
  });

  it('should default to state 1', async () => {
    const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseInt(value), 1);
  });

});

describe('MultiStateValue (multiple objects)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDMultiStateValue({
      name: 'Fan Speed',
      states: ['Off', 'Low', 'High'],
      presentValue: 1,
    }));
    device.addObject(new BDMultiStateValue({
      name: 'Operating Mode',
      states: ['Heating', 'Cooling', 'Auto', 'Standby'],
      presentValue: 3,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read Present_Value from the first object', async () => {
    const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseInt(value), 1);
  });

  it('should read Present_Value from the second object', async () => {
    const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 2, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseInt(value), 3);
  });

  it('should read Object_Name from the first object', async () => {
    const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Fan Speed"');
  });

  it('should read Object_Name from the second object', async () => {
    const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 2, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Operating Mode"');
  });

  it('should read Number_Of_States from the first object', async () => {
    const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.NUMBER_OF_STATES);
    deepStrictEqual(parseInt(value), 3);
  });

  it('should read Number_Of_States from the second object', async () => {
    const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 2, PropertyIdentifier.NUMBER_OF_STATES);
    deepStrictEqual(parseInt(value), 4);
  });

  it('should read State_Text from the first object', async () => {
    const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.STATE_TEXT);
    deepStrictEqual(value.trim(), '{"Off","Low","High"}');
  });

  it('should read State_Text from the second object', async () => {
    const value = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 2, PropertyIdentifier.STATE_TEXT);
    deepStrictEqual(value.trim(), '{"Heating","Cooling","Auto","Standby"}');
  });

  it('should read Object_Identifier from both objects', async () => {
    const value1 = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 1, PropertyIdentifier.OBJECT_IDENTIFIER);
    const value2 = await bsReadProperty(1, ObjectType.MULTI_STATE_VALUE, 2, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(value1.trim(), '(multi-state-value, 1)');
    deepStrictEqual(value2.trim(), '(multi-state-value, 2)');
  });

});