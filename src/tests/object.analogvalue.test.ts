
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
      // interface: '0.0.0.0',
      name: 'Test Device',
    });
    device.on('error', console.error);
  });

  afterEach(async () => {
    device.destroy();
    await new Promise(resolve => setTimeout(resolve, 10));
  })

  it('should read presentvalue', async () => {
    device.addObject(new BDAnalogValue({
      name: 'Test Value',
      unit: EngineeringUnits.AMPERES,
      presentValue: 0,
    }));
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseInt(value), 0);
  });

});
