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
  // The `setValue()` method returns a Promise that can be awaited to enable
  // backpressure management when notifying CoV subscribers.
  analogValue.presentValue.setValue(Math.random() * 1000);
}, 1000)
