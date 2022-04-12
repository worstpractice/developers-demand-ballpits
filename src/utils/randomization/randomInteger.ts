/**
 * This function ignores signedness (positive/negative), `NaN`s, `Infinity`, overflow, impossible ranges, and a host of other constraints.
 *
 * That's fine for this small challenge.
 *
 * We return the **biggest** number out of:
 *  - the given *minimum*
 *  - the **smallest** number out of:
 *     - the given *maximum*
 *     - the randomly generated value
 */
export const randomInteger = (from: number, to: number): number => {
  const random = Math.floor(Math.random() * to);

  return Math.max(from, Math.min(to, random));
};
