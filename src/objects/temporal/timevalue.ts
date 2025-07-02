
import { BDSingletProperty } from '../../properties/index.js';
import { BDObject } from '../generic/object.js';
import { 
  ObjectType,
  ApplicationTag,
  PropertyIdentifier,
} from '@bacnet-js/client';

export interface BDTimeValueOpts { 
  name: string, 
  writable?: boolean,
  description?: string,
  presentValue?: Date,
}

export class BDTimeValue extends BDObject { 
  
  readonly presentValue: BDSingletProperty<ApplicationTag.TIME>;
  
  constructor(instance: number, opts: BDTimeValueOpts) {
    super({ type: ObjectType.TIME_VALUE, instance }, opts.name, opts.description);
    
    this.presentValue = this.addProperty(new BDSingletProperty(
      PropertyIdentifier.PRESENT_VALUE, ApplicationTag.TIME, opts.writable ?? false, opts.presentValue ?? new Date()));

  }
}
