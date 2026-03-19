import { it, describe, beforeEach, afterEach } from 'node:test';
import { deepStrictEqual } from 'node:assert';
import { BDDevice } from '../objects/device/device.js';
import { bsReadProperty, bsWriteProperty } from './bacnet-stack-client.js';
import { BDCharacterStringValue } from '../objects/characterstringvalue.js';
import { ApplicationTag, ObjectType, PropertyIdentifier } from '@bacnet-js/client';

describe('CharacterStringValue', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDCharacterStringValue({
      name: 'Test CSV',
      description: 'A test character string value',
      presentValue: 'hello world',
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read the object\'s Present_Value property', async () => {
    const value = await bsReadProperty(1, ObjectType.CHARACTERSTRING_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), '"hello world"');
  });

  it('should read the object\'s Object_Name property', async () => {
    const value = await bsReadProperty(1, ObjectType.CHARACTERSTRING_VALUE, 1, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Test CSV"');
  });

  it('should read the object\'s Object_Type property', async () => {
    const value = await bsReadProperty(1, ObjectType.CHARACTERSTRING_VALUE, 1, PropertyIdentifier.OBJECT_TYPE);
    deepStrictEqual(value.trim(), 'characterstring-value');
  });

  it('should read the object\'s Description property', async () => {
    const value = await bsReadProperty(1, ObjectType.CHARACTERSTRING_VALUE, 1, PropertyIdentifier.DESCRIPTION);
    deepStrictEqual(value.trim(), '"A test character string value"');
  });

  it('should read the object\'s Status_Flags property', async () => {
    const value = await bsReadProperty(1, ObjectType.CHARACTERSTRING_VALUE, 1, PropertyIdentifier.STATUS_FLAGS);
    deepStrictEqual(value.trim(), '{false,false,false,false}');
  });

  it('should read the object\'s Event_State property', async () => {
    const value = await bsReadProperty(1, ObjectType.CHARACTERSTRING_VALUE, 1, PropertyIdentifier.EVENT_STATE);
    deepStrictEqual(value.trim(), 'normal');
  });

  it('should read the object\'s Out_Of_Service property', async () => {
    const value = await bsReadProperty(1, ObjectType.CHARACTERSTRING_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE);
    deepStrictEqual(value.trim(), 'FALSE');
  });

  it('should read the object\'s Reliability property', async () => {
    const value = await bsReadProperty(1, ObjectType.CHARACTERSTRING_VALUE, 1, PropertyIdentifier.RELIABILITY);
    deepStrictEqual(value.trim(), 'no-fault-detected');
  });

  it('should read the object\'s Object_Identifier property', async () => {
    const value = await bsReadProperty(1, ObjectType.CHARACTERSTRING_VALUE, 1, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(value.trim(), '(characterstring-value, 1)');
  });

});

describe('CharacterStringValue (default present value)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDCharacterStringValue({
      name: 'Default CSV',
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should default to an empty string when no presentValue is provided', async () => {
    const value = await bsReadProperty(1, ObjectType.CHARACTERSTRING_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), '""');
  });

});

describe('CharacterStringValue (writable)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDCharacterStringValue({
      name: 'Writable CSV',
      writable: true,
      presentValue: 'initial',
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should write and read back a new string value', async () => {
    await bsWriteProperty(1, ObjectType.CHARACTERSTRING_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.CHARACTER_STRING, 'updated');
    const value = await bsReadProperty(1, ObjectType.CHARACTERSTRING_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), '"updated"');
  });

  it('should write and read back an empty string', async () => {
    await bsWriteProperty(1, ObjectType.CHARACTERSTRING_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.CHARACTER_STRING, '');
    const value = await bsReadProperty(1, ObjectType.CHARACTERSTRING_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), '""');
  });

  it('should write and read back a string with spaces', async () => {
    await bsWriteProperty(1, ObjectType.CHARACTERSTRING_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.CHARACTER_STRING, 'hello brave new world');
    const value = await bsReadProperty(1, ObjectType.CHARACTERSTRING_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), '"hello brave new world"');
  });

  it('should overwrite a previous value', async () => {
    await bsWriteProperty(1, ObjectType.CHARACTERSTRING_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.CHARACTER_STRING, 'first');
    await bsWriteProperty(1, ObjectType.CHARACTERSTRING_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.CHARACTER_STRING, 'second');
    const value = await bsReadProperty(1, ObjectType.CHARACTERSTRING_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), '"second"');
  });

});

describe('CharacterStringValue (multiple objects)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDCharacterStringValue({
      name: 'Building Name',
      presentValue: 'Building A',
    }));
    device.addObject(new BDCharacterStringValue({
      name: 'Room Label',
      presentValue: 'Room 101',
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read Present_Value from the first object', async () => {
    const value = await bsReadProperty(1, ObjectType.CHARACTERSTRING_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), '"Building A"');
  });

  it('should read Present_Value from the second object', async () => {
    const value = await bsReadProperty(1, ObjectType.CHARACTERSTRING_VALUE, 2, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), '"Room 101"');
  });

  it('should read Object_Name from the first object', async () => {
    const value = await bsReadProperty(1, ObjectType.CHARACTERSTRING_VALUE, 1, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Building Name"');
  });

  it('should read Object_Name from the second object', async () => {
    const value = await bsReadProperty(1, ObjectType.CHARACTERSTRING_VALUE, 2, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Room Label"');
  });

  it('should read Object_Identifier from both objects', async () => {
    const value1 = await bsReadProperty(1, ObjectType.CHARACTERSTRING_VALUE, 1, PropertyIdentifier.OBJECT_IDENTIFIER);
    const value2 = await bsReadProperty(1, ObjectType.CHARACTERSTRING_VALUE, 2, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(value1.trim(), '(characterstring-value, 1)');
    deepStrictEqual(value2.trim(), '(characterstring-value, 2)');
  });

});