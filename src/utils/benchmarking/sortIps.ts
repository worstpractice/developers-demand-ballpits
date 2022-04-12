import type { RequestCounter } from '../../lib/RequestCounter';
import { ascending } from '../sorting/ascending';

/**
 * Simply makes it a tad easier to visually diff the end result.
 */
export const sortIps = (a: RequestCounter, b: RequestCounter): -1 | 0 | 1 => {
  const [ipA] = a.ip.split('.');
  const [ipB] = b.ip.split('.');

  return ascending(Number.parseInt(ipA), Number.parseInt(ipB));
};
