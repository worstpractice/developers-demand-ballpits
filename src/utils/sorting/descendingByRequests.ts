import type { RequestCounter } from '../../lib/RequestCounter';
import { descending } from './descending';

/**
 * This function outsources the fiddly bits to the {@link descending} function.
 *
 * Instead, we can focus on which numbers we want compared.
 *
 * With the types being guaranteed (and non-generic) in the signature, the function
 * remains monomorphic, and will be completely optimized away by whichever JIT
 * compiles it.
 */
export const descendingByRequests = (a: RequestCounter, b: RequestCounter): -1 | 0 | 1 => {
  return descending(a.count, b.count);
};
