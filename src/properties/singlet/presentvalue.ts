// import {
//   type ApplicationTagValueTypeMap,
//   type BACNetAppData,
//   type CharacterStringEncoding,
//   ErrorCode,
//   ErrorClass,
//   ApplicationTag,
//   PropertyIdentifier,
// } from '@bacnet-js/client';

// import { BDError } from '../../errors.js';
// import { BDAbstractSingletProperty } from './abstract.js';
// import { type BDPropertyAccessContext } from '../types.js';
// import { BDSingletProperty } from './singlet.js';
// import { BDArrayProperty } from '../array/array.js';
// import type { BDPolledSingletProperty } from './polled.js';

// export class BDPresentValueSingletProperty<
//   Tag extends ApplicationTag,
//   Type extends ApplicationTagValueTypeMap[Tag] = ApplicationTagValueTypeMap[Tag],
// > extends BDSingletProperty<Tag, Type> {

//   priorityArray: BDArrayProperty<Tag, Type>;
//   relinquishDefault: BDSingletProperty<Tag, Type>;
//   currentCommandPriority: BDPolledSingletProperty<ApplicationTag.UNSIGNED_INTEGER>;

//   constructor(identifier: PropertyIdentifier, type: Tag, writable: boolean, value: Type, encoding?: CharacterStringEncoding) {

//     super(identifier, type, writable, value, encoding);

//     this.priorityArray = new BDArrayProperty<Tag, Type>(PropertyIdentifier.PRIORITY_ARRAY);
//     this.relinquishDefault = new BDSingletProperty<Tag, Type>(PropertyIdentifier.RELINQUISH_DEFAULT);
//     this.currentCommandPriority = new BDPolledSingletProperty<ApplicationTag.UNSIGNED_INTEGER>(PropertyIdentifier.CURRENT_COMMAND_PRIORITY);


//   }


// }
