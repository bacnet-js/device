/**
 * This file demonstrates how to use custom object numbering providers.
 *
 * By default, BDDevice assigns sequential instance numbers starting at 1
 * for each object type (e.g. analog-value 1, analog-value 2, binary-value 1,
 * etc.). The `objectNumberingProvider` option lets you override this behavior
 * with your own numbering logic.
 */

import { EngineeringUnits, ObjectType } from '@bacnet-js/client';
import {
  BDDevice,
  BDAnalogValue,
  BDBinaryValue,
  BDCharacterStringValue,
  type BDDeviceOpts,
  type BDObject,
} from '../index.js';

// ---------------------------------------------------------------------
// Example 1: Numbering with a custom starting offset
// ---------------------------------------------------------------------
// All object types start numbering at 100 instead of 1.

class OffsetNumberingProvider {

  #counters: Partial<Record<ObjectType, number>> = Object.create(null);
  #startAt: number;

  constructor(startAt: number) {
    this.#startAt = startAt;
  }

  nextInstanceNumber<O extends BDObject>(object: O): number {
    if (!(object.type in this.#counters)) {
      this.#counters[object.type] = this.#startAt;
    }
    return this.#counters[object.type]!++;
  }

}

const deviceA = new BDDevice(1, {
  port: 47808,
  interface: '0.0.0.0',
  name: 'Offset-Numbered Device',
  objectNumberingProvider: new OffsetNumberingProvider(100),
});

// These will be analog-value 100 and analog-value 101
deviceA.addObject(new BDAnalogValue({
  name: 'Zone Temperature',
  unit: EngineeringUnits.DEGREES_CELSIUS,
  presentValue: 22.5,
}));
deviceA.addObject(new BDAnalogValue({
  name: 'Zone Humidity',
  unit: EngineeringUnits.PERCENT,
  presentValue: 55,
}));

// This will be binary-value 100 (numbering is independent per type)
deviceA.addObject(new BDBinaryValue({
  name: 'Occupancy',
  writable: false,
}));

// ---------------------------------------------------------------------
// Example 2: Different starting offsets per object type
// ---------------------------------------------------------------------
// Analog values start at 1000, binary values at 2000, etc.

class PerTypeOffsetNumberingProvider {

  #counters: Partial<Record<ObjectType, number>> = Object.create(null);
  #startByType: Partial<Record<ObjectType, number>>;
  #defaultStart: number;

  constructor(startByType: Partial<Record<ObjectType, number>>, defaultStart: number = 1) {
    this.#startByType = startByType;
    this.#defaultStart = defaultStart;
  }

  nextInstanceNumber<O extends BDObject>(object: O): number {
    if (!(object.type in this.#counters)) {
      this.#counters[object.type] = this.#startByType[object.type] ?? this.#defaultStart;
    }
    return this.#counters[object.type]!++;
  }

}

const deviceB = new BDDevice(2, {
  port: 47809,
  interface: '0.0.0.0',
  name: 'Per-Type Numbered Device',
  objectNumberingProvider: new PerTypeOffsetNumberingProvider({
    [ObjectType.ANALOG_VALUE]: 1000,
    [ObjectType.BINARY_VALUE]: 2000,
    [ObjectType.CHARACTERSTRING_VALUE]: 3000,
  }),
});

// analog-value 1000
deviceB.addObject(new BDAnalogValue({
  name: 'Supply Air Temp',
  unit: EngineeringUnits.DEGREES_CELSIUS,
}));

// binary-value 2000
deviceB.addObject(new BDBinaryValue({
  name: 'Fan Status',
  writable: false,
}));

// characterstring-value 3000
deviceB.addObject(new BDCharacterStringValue({
  name: 'Room Label',
  presentValue: 'Conference Room A',
}));

// analog-value 1001
deviceB.addObject(new BDAnalogValue({
  name: 'Return Air Temp',
  unit: EngineeringUnits.DEGREES_CELSIUS,
}));

// ---------------------------------------------------------------------
// Example 3: Name-derived numbering
// ---------------------------------------------------------------------
// Instance numbers are extracted from the object name itself, allowing
// explicit control over each object's instance number.

class NameDerivedNumberingProvider {

  nextInstanceNumber<O extends BDObject>(object: O): number {
    const name = object.objectName.getValue();
    const match = name.match(/#(\d+)$/);
    if (!match) {
      throw new Error(`Object name "${name}" must end with #<number> for name-derived numbering`);
    }
    return parseInt(match[1], 10);
  }

}

const deviceC = new BDDevice(3, {
  port: 47810,
  interface: '0.0.0.0',
  name: 'Name-Derived Numbered Device',
  objectNumberingProvider: new NameDerivedNumberingProvider(),
});

// analog-value 50
deviceC.addObject(new BDAnalogValue({
  name: 'Chilled Water Temp #50',
  unit: EngineeringUnits.DEGREES_CELSIUS,
  presentValue: 7,
}));

// analog-value 75
deviceC.addObject(new BDAnalogValue({
  name: 'Hot Water Temp #75',
  unit: EngineeringUnits.DEGREES_CELSIUS,
  presentValue: 60,
}));

// binary-value 10
deviceC.addObject(new BDBinaryValue({
  name: 'Valve Open #10',
  writable: true,
}));