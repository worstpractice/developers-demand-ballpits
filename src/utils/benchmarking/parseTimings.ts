import type { benchmark } from './benchmark';

/**
 * There's no need to optimize {@link parseTimings}.
 *
 * We could afford to just pay the allocation cost on every single call, instead of paying
 * the cost once and then staying fast and cheap forever.
 *
 * We *could*. 🧘‍♀️
 *
 * Even so, here we are. 😂
 */
const asMilliseconds = new Intl.NumberFormat('en', {
  minimumSignificantDigits: 1,
  maximumSignificantDigits: 1,
  style: 'unit',
  unit: 'millisecond',
});

/**
 * Helper for the {@link benchmark} function.
 *
 * Please don't consider this part of the challenge. It's meant primarily for highly entusiastic nerds, like myself 🤓
 */
export const parseTimings = (timings: DOMHighResTimeStamp[]) => {
  const sum = timings.reduce((acc: number, time: number): number => {
    return acc + time;
  }, 0);

  const mean = sum / timings.length;
  const median = timings[Math.floor(timings.length / 2)];

  return {
    mean: asMilliseconds.format(mean),
    median: asMilliseconds.format(median),
  } as const;
};
