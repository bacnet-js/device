
import { it, describe, beforeEach, afterEach } from 'node:test';
import { deepStrictEqual, rejects } from 'node:assert';
import { BDDevice } from '../objects/device/device.js';
import { bsReadProperty, bsWriteProperty } from './bacnet-stack-client.js';
import { BDAnalogValue } from '../objects/numeric/analogvalue.js';
import { ApplicationTag, EngineeringUnits, ObjectType, PropertyIdentifier } from '@bacnet-js/client';

describe('BDPresentValueSingletProperty - Validators (AnalogValue)', () => {

  let device: BDDevice;
  let av: BDAnalogValue;

  beforeEach(async () => {
    device = new BDDevice(1, { name: 'Test Device' });
    device.on('error', console.error);
    av = new BDAnalogValue({
      name: 'Test AV Validator',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      presentValue: 20,
      writable: true,
    });
    av.presentValue.addValidator((data) => {
      if (data.value < 0) {
        throw new Error('Value must not be negative');
      }
    });
    device.addObject(av);
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should accept writes that pass validation', async () => {
    await bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.REAL, 42);
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseFloat(value), 42);
  });

  it('should reject writes that fail validation', async () => {
    await rejects(
      bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.REAL, -10),
    );
  });

  it('should leave Present_Value unchanged after a rejected write', async () => {
    await rejects(
      bsWriteProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE, 16, ApplicationTag.REAL, -10),
    );
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseFloat(value), 20);
  });

});
