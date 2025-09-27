/**
 * This example demonstrates how to read property values from a BACnet device.
 */

import { EngineeringUnits } from "@bacnet-js/client";
import { BDDevice, BDAnalogValue } from "../index.js";

const device = new BDDevice(1, {
  port: 47808,
  interface: '0.0.0.0',
  name: "Example Device",
});

const analogValue = device.addObject(new BDAnalogValue({
  name: 'Writable Analog Value',
  unit: EngineeringUnits.VOLTS,
  writable: true,
  presentValue: 0,
}));

setInterval(() => {
  const value = analogValue.presentValue.getValue();
  console.log('Current value: %s', value);
}, 1000)
