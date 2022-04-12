import { randomInteger } from './randomInteger';

/**
 * Helps prevent off-by-one errors.
 */
export const randomByte = (): number => {
  return randomInteger(0, 255);
};
