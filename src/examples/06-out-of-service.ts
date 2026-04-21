/**
 * This example demonstrates how to use the writable Out_Of_Service feature.
 *
 * When `writableOutOfService` is set to `true`, remote BACnet clients can
 * write to the object's Out_Of_Service property. The object emits
 * `outofservice` and `inservice` events when the property changes, allowing
 * application code to react — for example, by freezing a sensor reading or
 * switching to a manual override mode.
 */

import { EngineeringUnits } from '@bacnet-js/client';
import { BDDevice, BDAnalogValue } from '../index.js';

const device = new BDDevice(1, {
  port: 47808,
  interface: '0.0.0.0',
  name: 'Example Device',
});

device.on('error', (err) => {
  console.error('BACnet error:', err);
});

// Create an analog value with a writable Out_Of_Service property.
// This allows remote BACnet clients to take the object out of service.
const temperature = device.addObject(new BDAnalogValue({
  name: 'Zone Temperature',
  unit: EngineeringUnits.DEGREES_CELSIUS,
  presentValue: 21.5,
  writableOutOfService: true,
}));

// Simulate a live sensor feed that updates the present value every second,
// but only while the object is in service.
const interval = setInterval(() => {
  if (!temperature.isOutOfService()) {
    const simulated = 20 + Math.random() * 5;
    temperature.presentValue.setValue(simulated);
  }
}, 1000);

// React to the object being taken out of service by a remote BACnet client.
temperature.on('outofservice', () => {
  console.log('Zone Temperature has been taken OUT OF SERVICE — sensor updates paused');
});

// React to the object being put back in service.
temperature.on('inservice', () => {
  console.log('Zone Temperature is back IN SERVICE — sensor updates resumed');
});

// Clean up on shutdown
process.on('SIGINT', () => {
  clearInterval(interval);
  device.destroy();
});