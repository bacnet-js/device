import { it, describe, beforeEach, afterEach } from 'node:test';
import { deepStrictEqual, rejects } from 'node:assert';
import { BDDevice } from '../objects/device/device.js';
import { bsReadProperty, bsWriteProperty } from './bacnet-stack-client.js';
import { BDAnalogValue } from '../objects/numeric/analogvalue.js';
import { BDBinaryValue } from '../objects/binaryvalue.js';
import { BDCharacterStringValue } from '../objects/characterstringvalue.js';
import { ApplicationTag, BinaryPV, EngineeringUnits, ObjectType, PropertyIdentifier } from '@bacnet-js/client';

describe('Out_Of_Service (not writable by default)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDAnalogValue({
      name: 'Default AV',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      presentValue: 20,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read Out_Of_Service as FALSE', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE);
    deepStrictEqual(value.trim(), 'FALSE');
  });

  it('should reject writing Out_Of_Service when not writable', async () => {
    await rejects(
      bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 1),
    );
  });

  it('should still read Out_Of_Service as FALSE after a rejected write', async () => {
    await rejects(
      bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 1),
    );
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE);
    deepStrictEqual(value.trim(), 'FALSE');
  });

});

describe('Out_Of_Service (writable, AnalogValue)', () => {

  let device: BDDevice;
  let av: BDAnalogValue;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    av = device.addObject(new BDAnalogValue({
      name: 'Writable OOS AV',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      presentValue: 22.5,
      writableOutOfService: true,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read Out_Of_Service as FALSE initially', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE);
    deepStrictEqual(value.trim(), 'FALSE');
  });

  it('should write TRUE to Out_Of_Service and read it back', async () => {
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 1);
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE);
    deepStrictEqual(value.trim(), 'TRUE');
  });

  it('should write TRUE then FALSE to Out_Of_Service and read back FALSE', async () => {
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 1);
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 0);
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE);
    deepStrictEqual(value.trim(), 'FALSE');
  });

  it('should report isOutOfService() as true after writing TRUE via BACnet', async () => {
    deepStrictEqual(av.isOutOfService(), false);
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 1);
    deepStrictEqual(av.isOutOfService(), true);
  });

  it('should report isOutOfService() as false after writing FALSE via BACnet', async () => {
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 1);
    deepStrictEqual(av.isOutOfService(), true);
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 0);
    deepStrictEqual(av.isOutOfService(), false);
  });

  it('should emit the outofservice event when Out_Of_Service is written to TRUE', async () => {
    let emitted = false;
    av.on('outofservice', () => { emitted = true; });
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 1);
    deepStrictEqual(emitted, true);
  });

  it('should emit the inservice event when Out_Of_Service is written back to FALSE', async () => {
    let emitted = false;
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 1);
    av.on('inservice', () => { emitted = true; });
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 0);
    deepStrictEqual(emitted, true);
  });

  it('should not emit inservice when Out_Of_Service is written to TRUE', async () => {
    let emitted = false;
    av.on('inservice', () => { emitted = true; });
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 1);
    deepStrictEqual(emitted, false);
  });

  it('should not emit outofservice when Out_Of_Service is written to FALSE', async () => {
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 1);
    let emitted = false;
    av.on('outofservice', () => { emitted = true; });
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 0);
    deepStrictEqual(emitted, false);
  });

  it('should not affect the Present_Value when toggling Out_Of_Service', async () => {
    const before = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseFloat(before), 22.5);
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 1);
    const during = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseFloat(during), 22.5);
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 0);
    const after = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseFloat(after), 22.5);
  });

});

describe('Out_Of_Service (writable, BinaryValue)', () => {

  let device: BDDevice;
  let bv: BDBinaryValue;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    bv = device.addObject(new BDBinaryValue({
      name: 'Writable OOS BV',
      writable: false,
      presentValue: BinaryPV.ACTIVE,
      writableOutOfService: true,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read Out_Of_Service as FALSE initially', async () => {
    const value = await bsReadProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE);
    deepStrictEqual(value.trim(), 'FALSE');
  });

  it('should write TRUE to Out_Of_Service and read it back', async () => {
    await bsWriteProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 1);
    const value = await bsReadProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE);
    deepStrictEqual(value.trim(), 'TRUE');
  });

  it('should write TRUE then FALSE to Out_Of_Service and read back FALSE', async () => {
    await bsWriteProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 1);
    await bsWriteProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 0);
    const value = await bsReadProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE);
    deepStrictEqual(value.trim(), 'FALSE');
  });

  it('should report isOutOfService() correctly', async () => {
    deepStrictEqual(bv.isOutOfService(), false);
    await bsWriteProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 1);
    deepStrictEqual(bv.isOutOfService(), true);
    await bsWriteProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 0);
    deepStrictEqual(bv.isOutOfService(), false);
  });

  it('should emit outofservice and inservice events', async () => {
    let outOfServiceCount = 0;
    let inServiceCount = 0;
    bv.on('outofservice', () => { outOfServiceCount++; });
    bv.on('inservice', () => { inServiceCount++; });
    await bsWriteProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 1);
    deepStrictEqual(outOfServiceCount, 1);
    deepStrictEqual(inServiceCount, 0);
    await bsWriteProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 0);
    deepStrictEqual(outOfServiceCount, 1);
    deepStrictEqual(inServiceCount, 1);
  });

  it('should not affect the Present_Value when toggling Out_Of_Service', async () => {
    const before = await bsReadProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(before.trim(), 'active');
    await bsWriteProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 1);
    const during = await bsReadProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(during.trim(), 'active');
    await bsWriteProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 0);
    const after = await bsReadProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(after.trim(), 'active');
  });

});

describe('Out_Of_Service (writable, CharacterStringValue)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDCharacterStringValue({
      name: 'Writable OOS CSV',
      presentValue: 'hello',
      writableOutOfService: true,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should write TRUE to Out_Of_Service and read it back', async () => {
    await bsWriteProperty(1, ObjectType.CHARACTERSTRING_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 1);
    const value = await bsReadProperty(1, ObjectType.CHARACTERSTRING_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE);
    deepStrictEqual(value.trim(), 'TRUE');
  });

  it('should not affect the Present_Value when toggling Out_Of_Service', async () => {
    await bsWriteProperty(1, ObjectType.CHARACTERSTRING_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 1);
    const value = await bsReadProperty(1, ObjectType.CHARACTERSTRING_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(value.trim(), '"hello"');
  });

});

describe('Out_Of_Service (not writable, BinaryValue)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDBinaryValue({
      name: 'Non-writable OOS BV',
      writable: false,
      presentValue: BinaryPV.INACTIVE,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should reject writing Out_Of_Service when not writable', async () => {
    await rejects(
      bsWriteProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 1),
    );
  });

  it('should remain FALSE after a rejected write attempt', async () => {
    await rejects(
      bsWriteProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 1),
    );
    const value = await bsReadProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE);
    deepStrictEqual(value.trim(), 'FALSE');
  });

});

describe('Out_Of_Service (writable, Device)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
      writableOutOfService: true,
    });
    device.on('error', console.error);
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read Out_Of_Service as FALSE initially', async () => {
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.OUT_OF_SERVICE);
    deepStrictEqual(value.trim(), 'FALSE');
  });

  it('should write TRUE to Out_Of_Service and read it back', async () => {
    await bsWriteProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 1);
    const value = await bsReadProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.OUT_OF_SERVICE);
    deepStrictEqual(value.trim(), 'TRUE');
  });

  it('should report isOutOfService() correctly', async () => {
    deepStrictEqual(device.isOutOfService(), false);
    await bsWriteProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 1);
    deepStrictEqual(device.isOutOfService(), true);
  });

  it('should emit outofservice and inservice events', async () => {
    let outOfServiceCount = 0;
    let inServiceCount = 0;
    device.on('outofservice', () => { outOfServiceCount++; });
    device.on('inservice', () => { inServiceCount++; });
    await bsWriteProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 1);
    deepStrictEqual(outOfServiceCount, 1);
    deepStrictEqual(inServiceCount, 0);
    await bsWriteProperty(1, ObjectType.DEVICE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 0);
    deepStrictEqual(outOfServiceCount, 1);
    deepStrictEqual(inServiceCount, 1);
  });

});

describe('Out_Of_Service (writableOutOfService: false explicit)', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDAnalogValue({
      name: 'Explicit non-writable OOS',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      presentValue: 10,
      writableOutOfService: false,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should reject writing Out_Of_Service when explicitly set to false', async () => {
    await rejects(
      bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 1),
    );
  });

  it('should read Out_Of_Service as FALSE', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE);
    deepStrictEqual(value.trim(), 'FALSE');
  });

  it('should report isOutOfService() as false', async () => {
    deepStrictEqual(device.isOutOfService(), false);
  });

});

describe('Out_Of_Service (multiple objects, mixed writability)', () => {

  let device: BDDevice;
  let writableAv: BDAnalogValue;
  let readonlyAv: BDAnalogValue;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    writableAv = device.addObject(new BDAnalogValue({
      name: 'Writable OOS AV',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      presentValue: 10,
      writableOutOfService: true,
    }));
    readonlyAv = device.addObject(new BDAnalogValue({
      name: 'Readonly OOS AV',
      unit: EngineeringUnits.PERCENT,
      presentValue: 50,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should allow writing Out_Of_Service on the writable object', async () => {
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 1);
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE);
    deepStrictEqual(value.trim(), 'TRUE');
  });

  it('should reject writing Out_Of_Service on the non-writable object', async () => {
    await rejects(
      bsWriteProperty(1, ObjectType.ANALOG_VALUE, 2, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 1),
    );
  });

  it('should not affect the non-writable object when the writable one changes', async () => {
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OUT_OF_SERVICE, 16, ApplicationTag.BOOLEAN, 1);
    deepStrictEqual(writableAv.isOutOfService(), true);
    deepStrictEqual(readonlyAv.isOutOfService(), false);
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 2, PropertyIdentifier.OUT_OF_SERVICE);
    deepStrictEqual(value.trim(), 'FALSE');
  });

});