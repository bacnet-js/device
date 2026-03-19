import { it, describe, beforeEach, afterEach } from 'node:test';
import { deepStrictEqual } from 'node:assert';
import { BDDevice } from '../objects/device/device.js';
import { bsReadProperty, bsWriteProperty } from './bacnet-stack-client.js';
import { BDBinaryValue } from '../objects/binaryvalue.js';
import { ApplicationTag, BinaryPV, ObjectType, PropertyIdentifier } from '@bacnet-js/client';

describe('BinaryValue', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDBinaryValue({
      name: 'Test BV',
      description: 'A test binary value',
      writable: false,
      presentValue: BinaryPV.ACTIVE,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read the object\'s Present_Value property', async () => {
    const value = await bsReadProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), 'active');
  });

  it('should read the object\'s Object_Name property', async () => {
    const value = await bsReadProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Test BV"');
  });

  it('should read the object\'s Object_Type property', async () => {
    const value = await bsReadProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.OBJECT_TYPE);
    deepStrictEqual(value.trim(), 'binary-value');
  });

  it('should read the object\'s Description property', async () => {
    const value = await bsReadProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.DESCRIPTION);
    deepStrictEqual(value.trim(), '"A test binary value"');
  });

  it('should read the object\'s Status_Flags property', async () => {
    const value = await bsReadProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.STATUS_FLAGS);
    deepStrictEqual(value.trim(), '{false,false,false,false}');
  });

  it('should read the object\'s Event_State property', async () => {
    const value = await bsReadProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.EVENT_STATE);
    deepStrictEqual(value.trim(), 'normal');
  });

  it('should read the object\'s Out_Of_Service property', async () => {
    const value = await bsReadProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE);
    deepStrictEqual(value.trim(), 'FALSE');
  });

  it('should read the object\'s Reliability property', async () => {
    const value = await bsReadProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.RELIABILITY);
    deepStrictEqual(value.trim(), 'no-fault-detected');
  });

  it('should read the object\'s Object_Identifier property', async () => {
    const value = await bsReadProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(value.trim(), '(binary-value, 1)');
  });

});

describe('BinaryValue (default present value)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDBinaryValue({
      name: 'Default BV',
      writable: false,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should default to inactive when no presentValue is provided', async () => {
    const value = await bsReadProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), 'inactive');
  });

});

describe('BinaryValue (writable)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDBinaryValue({
      name: 'Writable BV',
      writable: true,
      presentValue: BinaryPV.INACTIVE,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should write active and read it back', async () => {
    await bsWriteProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.ENUMERATED, BinaryPV.ACTIVE);
    const value = await bsReadProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), 'active');
  });

  it('should write inactive and read it back', async () => {
    await bsWriteProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.ENUMERATED, BinaryPV.ACTIVE);
    await bsWriteProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.ENUMERATED, BinaryPV.INACTIVE);
    const value = await bsReadProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), 'inactive');
  });

  it('should toggle present value multiple times', async () => {
    await bsWriteProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.ENUMERATED, BinaryPV.ACTIVE);
    let value = await bsReadProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), 'active');

    await bsWriteProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.ENUMERATED, BinaryPV.INACTIVE);
    value = await bsReadProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), 'inactive');

    await bsWriteProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.ENUMERATED, BinaryPV.ACTIVE);
    value = await bsReadProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), 'active');
  });

});

describe('BinaryValue (multiple objects)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDBinaryValue({
      name: 'Alarm BV',
      writable: false,
      presentValue: BinaryPV.INACTIVE,
    }));
    device.addObject(new BDBinaryValue({
      name: 'Status BV',
      writable: false,
      presentValue: BinaryPV.ACTIVE,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read Present_Value from the first object', async () => {
    const value = await bsReadProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), 'inactive');
  });

  it('should read Present_Value from the second object', async () => {
    const value = await bsReadProperty(1, ObjectType.BINARY_VALUE, 2, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), 'active');
  });

  it('should read Object_Name from the first object', async () => {
    const value = await bsReadProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Alarm BV"');
  });

  it('should read Object_Name from the second object', async () => {
    const value = await bsReadProperty(1, ObjectType.BINARY_VALUE, 2, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(value.trim(), '"Status BV"');
  });

  it('should read Object_Identifier from both objects', async () => {
    const value1 = await bsReadProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.OBJECT_IDENTIFIER);
    const value2 = await bsReadProperty(1, ObjectType.BINARY_VALUE, 2, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(value1.trim(), '(binary-value, 1)');
    deepStrictEqual(value2.trim(), '(binary-value, 2)');
  });

});