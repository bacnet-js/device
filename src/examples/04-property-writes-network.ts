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

// Provide validators to validate value writes originating from the
// BACnet network. Throwing will cause requests to be rejected.
analogValue.presentValue.addValidator((data: BACNetAppData) => {
  console.log('Before write: %s', data);
  if (data.value < 0) {
    throw new Error('Value must be non-negative');
  }
});

// Use the `aftercov` event to be notified of successfulvalue writes having
// originated from the BACnet network. If you need to perform asynchronous
// operations use a CoV listener to ensure backpressure is managed correctly.
analogValue.presentValue.on('aftercov', (data: BACNetAppData) => {
  console.log('New value written: %s', data);
});

// Use a CoV listener to perform asynchronous operations after a value write.
// Using CoV listeners ensures that backpressure is managed correctly.
analogValue.presentValue.addCoVListener(async (data: BACNetAppData) => {
  console.log('New value written: %s', data);
  // do something async
});
