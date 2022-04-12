/**
 * Included mostly as a demonstration of pluggability.
 *
 * Sorts values in ascending order, from smallest to biggest.
 */
export const ascending = (a: number, b: number): -1 | 0 | 1 => {
  return a < b ? -1 : b < a ? 1 : 0;
};
