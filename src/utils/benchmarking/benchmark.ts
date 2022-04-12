import { requestHandled, top100 } from '../../challengeSolution';
import type { RequestCounter } from '../../lib/RequestCounter';
import type { IpV4Address } from '../../typings/IpV4Address';
import { randomIpv4Address } from '../randomization/randomIpv4Address';
import { parseTimings } from './parseTimings';

/**
 * 🌈 DISCLAIMER: 🌈
 *
 * This is not the greatest code in the world. This is just a tribute. 😅
 *
 * I humbly ask for this benchmarking function not to be treated as part of the exercise (and it really lies outside the scope of the task anyways).
 *
 * The reason I wish to include (despite it being pasta) is that it would've made me happy to recieve if I was a technical reviewer.
 *
 * Not because it's part of the challenge (it isn't), but because I'm an incurably curious skeptic.
 *
 * And so, I imagine I would be delighted to be given a way to conveniently run some inofficial numbers on my own machine, just to see.
 *
 * If this doesn't interest you, you're still great in my book, and you can skip this. ✌
 *
 * But if it does pique your interest to run this yourself — happy benchmarking!
 *
 * Just don't stay up late trying out all sorts of interesting performance tweaks 😉
 */
export const benchmark = (ipAdresses: number, requestsPerIp: number): void => {
  const randomIpAddresses: IpV4Address[] = Array.from({ length: ipAdresses }, randomIpv4Address);

  const requestsHandledTimes: DOMHighResTimeStamp[] = [];
  const top100Times: DOMHighResTimeStamp[] = [];

  /** We log this list at the end to prevent the JIT from optimizing away our calls to {@link top100}. */
  let toplist: readonly RequestCounter[] = [];
  let requestsMade = 0;

  for (let i = 0; i < ipAdresses; i++, requestsMade++) {
    if (i % (ipAdresses * 0.01) === 0) console.log(`${i.toLocaleString('en')} down (${(ipAdresses - i).toLocaleString('en')} to go)`);

    const ip = randomIpAddresses[i];

    let worstRequestsHandledTime: DOMHighResTimeStamp = 0;
    let worstTop100Time: DOMHighResTimeStamp = 0;

    for (let i = 0; i < requestsPerIp; i++, requestsMade++) {
      {
        const before = performance.now();
        requestHandled(ip);
        const after = performance.now();

        const delta = after - before;

        if (delta > worstRequestsHandledTime) {
          worstRequestsHandledTime = delta;
        }
      }

      // Aha, duplicated code! ...Thank goodness this isn't part of the exercise! 😅
      {
        const before = performance.now();
        toplist = top100();
        const after = performance.now();

        const delta = after - before;

        if (delta > worstTop100Time) {
          worstTop100Time = delta;
        }
      }
    }

    top100Times.push(worstTop100Time);
    requestsHandledTimes.push(worstRequestsHandledTime);
  }

  /** Again, we log this list here to prevent the JIT from optimizing away our calls to {@link top100}. */
  console.log(
    toplist.map(({ count, ip }) => ({
      requests: count,
      ip,
    })),
  );

  {
    const { mean, median } = parseTimings(requestsHandledTimes);

    console.log(`requestHandled (averaged across ${requestsMade.toLocaleString('en')} requests from ${ipAdresses.toLocaleString('en')} ip addresses)`);

    console.log(`mean:   ${mean}`);
    console.log(`median: ${median}`);
  }

  // Aha, duplicated code! ...Thank goodness this isn't part of the exercise! 😅
  {
    const { mean, median } = parseTimings(top100Times);

    console.log(`top100 (averaged across ${requestsMade.toLocaleString('en')} requests from ${ipAdresses.toLocaleString('en')} ip addresses)`);

    console.log(`mean:   ${mean}`);
    console.log(`median: ${median}`);
  }
};
