/**
 * This file demonstrates how to create a BACnet device and add objects to it.
 */

import { EngineeringUnits } from '@bacnet-js/client';
import { BDDevice, BDAnalogValue } from '../index.js';

const device = new BDDevice(1, {
  port: 47808,
  interface: '0.0.0.0',
  name: 'My BACnet Device',
});

const analogValueObj = device.addObject(new BDAnalogValue({
  name: 'Zone Temperature',
  unit: EngineeringUnits.DEGREES_CELSIUS,
}));
