
import { BDSingletProperty } from '../../properties/index.js';
import { BDObject } from '../generic/object.js';
import { 
  ObjectType,
  ApplicationTag,
  PropertyIdentifier,
} from '@bacnet-js/client';

export interface BDDateValueOpts { 
  name: string, 
  writable?: boolean,
  description?: string,
  presentValue?: Date,
}

export class BDDateValue extends BDObject { 
  
  readonly presentValue: BDSingletProperty<ApplicationTag.DATE>;
  
  constructor(instance: number, opts: BDDateValueOpts) {
    super({ type: ObjectType.DATE_VALUE, instance }, opts.name, opts.description);
    
    this.presentValue = this.addProperty(new BDSingletProperty(
      PropertyIdentifier.PRESENT_VALUE, ApplicationTag.DATE, opts.writable ?? false, opts.presentValue ?? new Date()));

  }
}
