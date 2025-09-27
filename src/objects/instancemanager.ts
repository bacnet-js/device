
import type { BDDevice } from "./device/device.js";
import type { ObjectType } from "@bacnet-js/client";

class InstanceManager {

  #numbers: Map<BDDevice, Partial<Record<ObjectType, number>>>;

  constructor() {
    this.#numbers = new Map();
  }

  next(device: BDDevice, type: ObjectType): number {
    let deviceNumbers = this.#numbers.get(device);
    if (!deviceNumbers) {
      this.#numbers.set(device, (deviceNumbers = {}));
    }
    if (!(type in deviceNumbers)) {
      deviceNumbers[type] = 1;
    }
    return deviceNumbers[type]!++;
  }

}

export const instanceManager = new InstanceManager();
