/**
 * This example demonstrates how to manage write requests originating from the
 * BACnet network using property events.
 */

import { EngineeringUnits, type BACNetAppData } from "@bacnet-js/client";
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

// Use the `beforecov` event to validate value writes originating from the
// BACnet network. Throwing will cause requests to be rejected.
analogValue.presentValue.on('beforecov', async (data: BACNetAppData) => {
  console.log('Before write: %s', data);
  if (data.value < 0) {
    throw new Error('Value must be non-negative');
  }
});

// Use the `aftercov` event to be notified of successfulvalue writes having
// originated from the BACnet network.
analogValue.presentValue.on('aftercov', async (data: BACNetAppData) => {
  console.log('New value written: %s', data);
});
