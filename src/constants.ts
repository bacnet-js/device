
import { type BDObjectUID } from './uids.js';

/**
 * Maximum value of the `index` parameter of `readProperty` requests.
 * Used to indicate that a client is interested in the entire list of values
 * as opposed to either the length (`index = 0`) or a specific item 
 * (`1 <= index < MAX_ARRAY_INDEX`).
 */
export const MAX_ARRAY_INDEX = 4294967295;

export const EMPTY_ARRAY = [];

export const EMPTY_SET = new Set();

export const NULL_OBJECT_UID = 1_000_000 as BDObjectUID;
