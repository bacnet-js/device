import { it, describe, beforeEach, afterEach } from 'node:test';
import { deepStrictEqual } from 'node:assert';
import { BDDevice } from '../objects/device/device.js';
import { bsReadMultiple, bsReadProperty } from './bacnet-stack-client.js';
import { BDDateTimeValue } from '../objects/temporal/datetimevalue.js';
import { EngineeringUnits, ObjectType, PropertyIdentifier } from '@bacnet-js/client';
import { BDAnalogValue } from '../objects/numeric/analogvalue.js';

describe('ReadMultiple', () => {

  let device: BDDevice;
  let av_1: BDAnalogValue;
  let av_2: BDAnalogValue;

  beforeEach(async () => {
    device = new BDDevice(1, {
      name: 'Test Device',
    });
    device.on('error', console.error);
    av_1 = device.addObject(new BDAnalogValue({
      name: 'Test AV 1',
      description: 'A test analog value',
      presentValue: 10,
      unit: EngineeringUnits.PERCENT,
    }));
    av_2 = device.addObject(new BDAnalogValue({
      name: 'Test AV 2',
      description: 'A test analog value',
      presentValue: 90,
      unit: EngineeringUnits.PERCENT,
    }));
  });

  afterEach(async () => {
    device.destroy();
  });

  it('should read multiple Present_Value properties across different objects', async () => {
    const res = await bsReadMultiple(device.identifier.value.instance, [
      [ObjectType.ANALOG_VALUE, av_1.identifier.value.instance, PropertyIdentifier.PRESENT_VALUE],
      [ObjectType.ANALOG_VALUE, av_2.identifier.value.instance, PropertyIdentifier.PRESENT_VALUE],
    ]);
    deepStrictEqual(res, `analog-value #1 { present-value: 10.000000 } analog-value #2 { present-value: 90.000000 }`);
  });

  it('should fail to read multiple Present_Value properties across a mix of existent and non-existent properties', async () => {
    const res = await bsReadMultiple(device.identifier.value.instance, [
      [ObjectType.ANALOG_VALUE, av_1.identifier.value.instance, PropertyIdentifier.PRESENT_VALUE],
      [ObjectType.ANALOG_VALUE, 42, PropertyIdentifier.PRESENT_VALUE],
    ]);
    deepStrictEqual(res, ``);
  });

  it('should fail to read a mix of existent and non-existent properties on the same object', async () => {
    const res = await bsReadMultiple(device.identifier.value.instance, [
      [ObjectType.ANALOG_VALUE, av_1.identifier.value.instance, PropertyIdentifier.PRESENT_VALUE],
      [ObjectType.ANALOG_VALUE, av_1.identifier.value.instance, PropertyIdentifier.ACCESS_EVENT_TAG],
    ]);
    deepStrictEqual(res, ``);
  });

});
