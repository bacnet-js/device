/**
 * This file demonstrates how to create a custom device class.
 *
 * The ThermostatDevice class extends the BDDevice class and adds
 * two analog values for target and current temperature. Network
 * writes to the target temperature value will be mirrored in the
 * current temperature value after a delay of 5 seconds.
 */

import { EngineeringUnits } from "@bacnet-js/client";
import { BDAnalogValue, BDDevice, type BDDeviceOpts } from "../index.js";

class ThermostatDevice extends BDDevice {

  targetTemp: BDAnalogValue;
  currentTemp: BDAnalogValue;

  constructor(id: number, opts: BDDeviceOpts) {

    super(id, {
      ...opts,
      modelName: 'Thermostat'
    });

    this.targetTemp = this.addObject(new BDAnalogValue({
      name: 'Target Temperature',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      writable: true,
    }));

    this.currentTemp = this.addObject(new BDAnalogValue({
      name: 'Current Temperature',
      unit: EngineeringUnits.DEGREES_CELSIUS,
      writable: false,
    }));

    this.targetTemp.presentValue.on('aftercov', (data) => {
      setTimeout(() => {
        this.currentTemp.presentValue.setValue(data.value);
      }, 5_000);
    });

  }

}

const thermostat = new ThermostatDevice(1, {
  name: 'FancyThermo',
  port: 47808,
  interface: '0.0.0.0',
  broadcastAddress: '255.255.255.255',
});
