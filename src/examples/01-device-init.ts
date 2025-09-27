/**
 * This file demonstrates how to initialize a new BACnet device.
 */

import { BDDevice } from '../index.js';

// The instance number - in this case 1234 - must be unique on the network
// and comprised between 0 and 4194303.
const device = new BDDevice(1234, {
  port: 47808,            // Standard BACnet/IP port
  interface: '0.0.0.0',   // Listen on all interfaces
  broadcastAddress: '255.255.255.255',
  name: 'My BACnet Device',
});

// Listen for errors
device.on('error', (err) => {
  console.error('BACnet error:', err);
});
