
import { it, describe, beforeEach, afterEach } from 'node:test';
import { deepStrictEqual } from 'node:assert';
import { BDDevice } from '../objects/device/device.js';
import { bsReadProperty } from './bacnet-stack-client.js';
import { BDAnalogValue } from '../objects/numeric/analogvalue.js';
import { EngineeringUnits, ObjectType, PropertyIdentifier } from '@bacnet-js/client';

describe('AnalogValue', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    device.addObject(new BDAnalogValue({
      name: 'Test Value',
      unit: EngineeringUnits.AMPERES,
      presentValue: 0,
    }));
  });

  afterEach(async () => {
    device.destroy();
  })

  it('should read the object\'s Present_Value property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseInt(value), 0);
  });

  it('should read the object\'s Units property', async () => {
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.UNITS);
    deepStrictEqual(value, 'amperes');
  });

});
