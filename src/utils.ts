
import bacnet, { ApplicationTag } from '@bacnet-js/client';

const { default: BACnetClient } = bacnet;

/**
 * Type representing the BACnet client instance from the underlying library
 */
export type BACNetClientType = InstanceType<typeof BACnetClient>;

/**
 * Ensures that a value or array of values is returned as an array
 * 
 * @param val - A single value or array of values
 * @returns An array containing the input value(s)
 * @typeParam T - The type of the values
 */
export const ensureArray = <T>(val: T | T[]): T[] => {
  return Array.isArray(val) ? val : [val];
};

/**
 * Start date of the process.
 */
export const PROCESS_START_DATE = new Date();

/**
 * Standard time zone offset local to the computer running this code.
 */
export const STD_TZ_OFFSET = Math.max(
  new Date(PROCESS_START_DATE.getFullYear(), 0, 1).getTimezoneOffset(),
  new Date(PROCESS_START_DATE.getFullYear(), 6, 1).getTimezoneOffset(),
); 

/**
 * Returns whether daylight saving time is in effect for a given date,
 * relative to the local time zone of the computer running this code.
 */
export const isDstInEffect = (date: Date): boolean => { 
  return date.getTimezoneOffset() < STD_TZ_OFFSET;
};

export const isNumericApplicationTag = (tag: ApplicationTag): tag is ApplicationTag.REAL | ApplicationTag.UNSIGNED_INTEGER | ApplicationTag.SIGNED_INTEGER => {
  return tag === ApplicationTag.REAL || tag === ApplicationTag.SIGNED_INTEGER || tag === ApplicationTag.UNSIGNED_INTEGER;
};
