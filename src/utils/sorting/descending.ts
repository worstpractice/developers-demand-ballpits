/**
 * Included mostly as a demonstration of pluggability.
 *
 * Sorts values in descending order, from biggest to smallest.
 */
export const descending = (a: number, b: number): -1 | 0 | 1 => {
  return a < b ? 1 : b < a ? -1 : 0;
};
