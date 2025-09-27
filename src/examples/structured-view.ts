/**
 * This example uses StructuredView objects to create the following structure:
 *
 * Device
 *   - Group 1
 *     - Value 1.1
 *   - Group 2
 *     - Group 2.1
 *       - Value 2.1.1
 */


import { EngineeringUnits } from "@bacnet-js/client";
import { BDDevice, BDStructuredView, BDAnalogValue } from "../index.js";

const device = new BDDevice(1, {
  port: 47808,
  interface: '0.0.0.0',
  name: "Example Device",
});

const group1 = device.addSubordinate(new BDStructuredView({
  name: "Group 1",
}));

const analogValue1_1 = group1.addSubordinate(new BDAnalogValue({
  name: 'Value 1.1',
  presentValue: 0,
  unit: EngineeringUnits.PERCENT,
}));

const group2 = device.addSubordinate(new BDStructuredView({
  name: "Group 2",
}));

const group2_1 = group2.addSubordinate(new BDStructuredView({
  name: "Group 2.1",
}));

const analogValue2_1_1 = group2_1.addSubordinate(new BDAnalogValue({
  name: 'Value 2.1.1',
  presentValue: 0,
  unit: EngineeringUnits.PERCENT,
}));
