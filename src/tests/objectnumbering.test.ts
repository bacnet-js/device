import { it, describe, beforeEach, afterEach } from 'node:test';
import { deepStrictEqual } from 'node:assert';
import { BDDevice } from '../objects/device/device.js';
import { bsReadProperty } from './bacnet-stack-client.js';
import { BDAnalogValue } from '../objects/numeric/analogvalue.js';
import { BDAnalogInput } from '../objects/numeric/analoginput.js';
import { BDBinaryValue } from '../objects/binaryvalue.js';
import { BDCharacterStringValue } from '../objects/characterstringvalue.js';
import { BDIntegerValue } from '../objects/numeric/integervalue.js';
import { type BDObjectNumberingProvider } from '../objects/device/types.js';
import { type BDObject } from '../objects/generic/object.js';
import { EngineeringUnits, ObjectType, PropertyIdentifier } from '@bacnet-js/client';

describe('Object numbering (default provider)', () => {

  let device: BDDevice;

  afterEach(async () => {
    device.destroy();
  });

  it('should assign instance number 1 to the first object of a given type', async () => {
    device = new BDDevice(1, { name: 'Test Device' });
    device.on('error', console.error);
    device.addObject(new BDAnalogValue({
      name: 'AV First',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      presentValue: 10,
    }));
    const value = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(value.trim(), '(analog-value, 1)');
  });

  it('should assign sequential instance numbers to objects of the same type', async () => {
    device = new BDDevice(1, { name: 'Test Device' });
    device.on('error', console.error);
    device.addObject(new BDAnalogValue({
      name: 'AV 1',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      presentValue: 1,
    }));
    device.addObject(new BDAnalogValue({
      name: 'AV 2',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      presentValue: 2,
    }));
    device.addObject(new BDAnalogValue({
      name: 'AV 3',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      presentValue: 3,
    }));
    const v1 = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(v1.trim(), '(analog-value, 1)');
    const v2 = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 2, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(v2.trim(), '(analog-value, 2)');
    const v3 = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 3, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(v3.trim(), '(analog-value, 3)');
  });

  it('should number each object type independently starting at 1', async () => {
    device = new BDDevice(1, { name: 'Test Device' });
    device.on('error', console.error);
    device.addObject(new BDAnalogValue({
      name: 'AV 1',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      presentValue: 10,
    }));
    device.addObject(new BDBinaryValue({
      name: 'BV 1',
      writable: false,
    }));
    device.addObject(new BDCharacterStringValue({
      name: 'CSV 1',
      presentValue: 'hello',
    }));
    device.addObject(new BDAnalogValue({
      name: 'AV 2',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      presentValue: 20,
    }));
    device.addObject(new BDBinaryValue({
      name: 'BV 2',
      writable: false,
    }));
    const av1 = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(av1.trim(), '(analog-value, 1)');
    const av2 = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 2, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(av2.trim(), '(analog-value, 2)');
    const bv1 = await bsReadProperty(1, ObjectType.BINARY_VALUE, 1, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(bv1.trim(), '(binary-value, 1)');
    const bv2 = await bsReadProperty(1, ObjectType.BINARY_VALUE, 2, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(bv2.trim(), '(binary-value, 2)');
    const csv1 = await bsReadProperty(1, ObjectType.CHARACTERSTRING_VALUE, 1, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(csv1.trim(), '(characterstring-value, 1)');
  });

  it('should number analog-input and analog-value types independently', async () => {
    device = new BDDevice(1, { name: 'Test Device' });
    device.on('error', console.error);
    device.addObject(new BDAnalogValue({
      name: 'AV 1',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      presentValue: 5,
    }));
    device.addObject(new BDAnalogInput({
      name: 'AI 1',
      unit: EngineeringUnits.AMPERES,
      presentValue: 15,
    }));
    device.addObject(new BDAnalogValue({
      name: 'AV 2',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      presentValue: 25,
    }));
    device.addObject(new BDAnalogInput({
      name: 'AI 2',
      unit: EngineeringUnits.AMPERES,
      presentValue: 35,
    }));
    const av1 = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(av1.trim(), '(analog-value, 1)');
    const av2 = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 2, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(av2.trim(), '(analog-value, 2)');
    const ai1 = await bsReadProperty(1, ObjectType.ANALOG_INPUT, 1, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(ai1.trim(), '(analog-input, 1)');
    const ai2 = await bsReadProperty(1, ObjectType.ANALOG_INPUT, 2, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(ai2.trim(), '(analog-input, 2)');
  });

});

describe('Object numbering (custom provider, offset start)', () => {

  let device: BDDevice;

  afterEach(async () => {
    device.destroy();
  });

  it('should assign instance numbers starting from a custom offset', async () => {
    const provider: BDObjectNumberingProvider = (() => {
      const counters: Partial<Record<ObjectType, number>> = Object.create(null);
      return {
        nextInstanceNumber<O extends BDObject>(object: O): number {
          if (!(object.type in counters)) {
            counters[object.type] = 100;
          }
          return counters[object.type]!++;
        },
      };
    })();
    device = new BDDevice(1, { name: 'Test Device', objectNumberingProvider: provider });
    device.on('error', console.error);
    device.addObject(new BDAnalogValue({
      name: 'AV 100',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      presentValue: 1,
    }));
    device.addObject(new BDAnalogValue({
      name: 'AV 101',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      presentValue: 2,
    }));
    const v1 = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 100, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(v1.trim(), '(analog-value, 100)');
    const v2 = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 101, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(v2.trim(), '(analog-value, 101)');
  });

  it('should apply custom offset independently per type', async () => {
    const provider: BDObjectNumberingProvider = (() => {
      const counters: Partial<Record<ObjectType, number>> = Object.create(null);
      return {
        nextInstanceNumber<O extends BDObject>(object: O): number {
          if (!(object.type in counters)) {
            counters[object.type] = 100;
          }
          return counters[object.type]!++;
        },
      };
    })();
    device = new BDDevice(1, { name: 'Test Device', objectNumberingProvider: provider });
    device.on('error', console.error);
    device.addObject(new BDAnalogValue({
      name: 'AV 100',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      presentValue: 10,
    }));
    device.addObject(new BDBinaryValue({
      name: 'BV 100',
      writable: false,
    }));
    device.addObject(new BDAnalogValue({
      name: 'AV 101',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      presentValue: 20,
    }));
    const av1 = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 100, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(av1.trim(), '(analog-value, 100)');
    const av2 = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 101, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(av2.trim(), '(analog-value, 101)');
    const bv1 = await bsReadProperty(1, ObjectType.BINARY_VALUE, 100, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(bv1.trim(), '(binary-value, 100)');
  });

});

describe('Object numbering (custom provider, type-based offsets)', () => {

  let device: BDDevice;

  afterEach(async () => {
    device.destroy();
  });

  it('should assign different starting numbers per object type', async () => {
    const startByType: Partial<Record<ObjectType, number>> = {
      [ObjectType.ANALOG_VALUE]: 1000,
      [ObjectType.BINARY_VALUE]: 2000,
      [ObjectType.CHARACTERSTRING_VALUE]: 3000,
    };
    const provider: BDObjectNumberingProvider = (() => {
      const counters: Partial<Record<ObjectType, number>> = Object.create(null);
      return {
        nextInstanceNumber<O extends BDObject>(object: O): number {
          if (!(object.type in counters)) {
            counters[object.type] = startByType[object.type] ?? 1;
          }
          return counters[object.type]!++;
        },
      };
    })();
    device = new BDDevice(1, { name: 'Test Device', objectNumberingProvider: provider });
    device.on('error', console.error);
    device.addObject(new BDAnalogValue({
      name: 'AV 1000',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      presentValue: 10,
    }));
    device.addObject(new BDBinaryValue({
      name: 'BV 2000',
      writable: false,
    }));
    device.addObject(new BDCharacterStringValue({
      name: 'CSV 3000',
      presentValue: 'text',
    }));
    device.addObject(new BDAnalogValue({
      name: 'AV 1001',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      presentValue: 20,
    }));
    const av1 = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1000, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(av1.trim(), '(analog-value, 1000)');
    const av2 = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 1001, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(av2.trim(), '(analog-value, 1001)');
    const bv1 = await bsReadProperty(1, ObjectType.BINARY_VALUE, 2000, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(bv1.trim(), '(binary-value, 2000)');
    const csv1 = await bsReadProperty(1, ObjectType.CHARACTERSTRING_VALUE, 3000, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(csv1.trim(), '(characterstring-value, 3000)');
  });

});

describe('Object numbering (custom provider, name-based)', () => {

  let device: BDDevice;

  afterEach(async () => {
    device.destroy();
  });

  it('should derive instance numbers from object names', async () => {
    const provider: BDObjectNumberingProvider = {
      nextInstanceNumber<O extends BDObject>(object: O): number {
        const name = object.objectName.getValue();
        const match = name.match(/#(\d+)$/);
        if (!match) {
          throw new Error(`Object name "${name}" does not end with #<number>`);
        }
        return parseInt(match[1], 10);
      },
    };
    device = new BDDevice(1, { name: 'Test Device', objectNumberingProvider: provider });
    device.on('error', console.error);
    device.addObject(new BDAnalogValue({
      name: 'Temperature #50',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      presentValue: 22.5,
    }));
    device.addObject(new BDAnalogValue({
      name: 'Humidity #75',
      unit: EngineeringUnits.PERCENT,
      presentValue: 55,
    }));
    device.addObject(new BDBinaryValue({
      name: 'Occupancy #10',
      writable: false,
    }));
    const av50 = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 50, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(av50.trim(), '(analog-value, 50)');
    const av75 = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 75, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(av75.trim(), '(analog-value, 75)');
    const bv10 = await bsReadProperty(1, ObjectType.BINARY_VALUE, 10, PropertyIdentifier.OBJECT_IDENTIFIER);
    deepStrictEqual(bv10.trim(), '(binary-value, 10)');
  });

});

describe('Object numbering (custom provider verifies property reads)', () => {

  let device: BDDevice;

  afterEach(async () => {
    device.destroy();
  });

  it('should read Present_Value of custom-numbered objects correctly', async () => {
    const provider: BDObjectNumberingProvider = (() => {
      const counters: Partial<Record<ObjectType, number>> = Object.create(null);
      return {
        nextInstanceNumber<O extends BDObject>(object: O): number {
          if (!(object.type in counters)) {
            counters[object.type] = 500;
          }
          return counters[object.type]!++;
        },
      };
    })();
    device = new BDDevice(1, { name: 'Test Device', objectNumberingProvider: provider });
    device.on('error', console.error);
    device.addObject(new BDAnalogValue({
      name: 'AV 500',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      presentValue: 42.5,
    }));
    device.addObject(new BDIntegerValue({
      name: 'IV 500',
      unit: EngineeringUnits.NO_UNITS,
      presentValue: -99,
    }));
    const avPv = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 500, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseFloat(avPv), 42.5);
    const avName = await bsReadProperty(1, ObjectType.ANALOG_VALUE, 500, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(avName.trim(), '"AV 500"');
    const ivPv = await bsReadProperty(1, ObjectType.INTEGER_VALUE, 500, PropertyIdentifier.PRESENT_VALUE);
    deepStrictEqual(parseInt(ivPv), -99);
    const ivName = await bsReadProperty(1, ObjectType.INTEGER_VALUE, 500, PropertyIdentifier.OBJECT_NAME);
    deepStrictEqual(ivName.trim(), '"IV 500"');
  });

});