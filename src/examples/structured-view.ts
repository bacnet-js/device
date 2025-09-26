
import { EngineeringUnits } from "@bacnet-js/client";
import { BDDevice, BDStructuredView, BDAnalogValue } from "../index.js";

const device = new BDDevice(1, {
  port: 47808,
  interface: '0.0.0.0',
  name: "Example Device",
  description: "This is an example device.",
  modelName: "Example Model",
  firmwareRevision: "0.0.1",
  applicationSoftwareVersion: "0.0.1",
  databaseRevision: 1,
});

const group1 = device.addSubordinate(new BDStructuredView(1, {
  name: "Group 1",
}));

const group2 = device.addSubordinate(new BDStructuredView(2, {
  name: "Group 2",
}));

const group2_1 = group2.addSubordinate(new BDStructuredView(3, {
  name: "Group 2.1",
}));

group2_1.addSubordinate(new BDAnalogValue(1, {
  name: 'Value 2.1.1',
  presentValue: 0,
  unit: EngineeringUnits.PERCENT,
}))
