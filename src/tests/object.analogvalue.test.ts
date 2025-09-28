
import { it, describe, beforeEach, afterEach } from 'node:test';
import { BDDevice } from '../objects/device/device.js';
import { bsReadProperty } from './bacnet-stack.js';
import { BDAnalogValue } from '../objects/numeric/analogvalue.js';
import { ApplicationTag, EngineeringUnits, ObjectType, PropertyIdentifier } from '@bacnet-js/client';

describe('AnalogValue', () => {

  let device: BDDevice;

  beforeEach(async () => {
    device = new BDDevice(1, {
      port: 47808,
      interface: '0.0.0.0',
      name: 'Test Device',
    });
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
    console.log('VALUE READ', value);
  });

});
