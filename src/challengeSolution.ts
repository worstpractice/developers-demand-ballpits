import { BucketMap } from './lib/BucketMap';
import { RequestCounter } from './lib/RequestCounter';
import type { IpV4Address } from './typings/IpV4Address';
import { descendingByRequests } from './utils/sorting/descendingByRequests';

/**
 * An instance of the {@link BucketMap} I devised as part of solving this interesting challenge.
 *
 * It allows us to do the job of a normal {@link Map} *without* running into certain limitations described in the docs for {@link BucketMap}.
 */
const REQUESTS_BY_IP: BucketMap<IpV4Address, RequestCounter> = new BucketMap();

/**
 * Our top requesters. This array, and aggressively re-sorting it, lies at the heart of the algorithm.
 *
 * {@link requestHandled} details how it is used in the program.
 */
const TOP_100: RequestCounter[] = [];

/**
 * Due to the fiddly nature of the `isTop100` caching mechanism, I decided to open this function with an immediate return.
 *
 * The first line checking the {@link BucketMap.isTop100 isTop100} flag is a significantly more performant way of expressing:
 *
 * ```
 * if (TOP_100.includes(requests)) return;
 * ```
 *
 * One clear benefit of unconditionally calling this function, only to immediately return in the vast majority of cases,
 * is that we keep essentially all of the fiddly flag code in a single location.
 */
const considerForTop100 = (requests: RequestCounter): void => {
  if (requests.isTop100) return;

  const lastIndex = TOP_100.length - 1;
  const lastEntry = TOP_100[lastIndex];

  if (requests.count > lastEntry.count) {
    TOP_100[lastIndex] = requests;

    requests.isTop100 = true;
    lastEntry.isTop100 = false;
  }
};

/**
 * This function ties much of the implementation together behind the scenes.
 *
 * A considerable amount of disparate logic that would be pretty gnarly to have spread out everywhere
 * has been neatly wrapped up in a single logical place. At least, that's the intention. 😁
 *
 * In a bigger program, it would of course also make sense to ensure a critical function like this can
 * only ever be called from the right place.
 *
 * For this small challenge, just making it module-private (unexported) felt sufficient.
 */
const initRequestCounter = (ip: IpV4Address): RequestCounter => {
  const requests = new RequestCounter(ip);

  REQUESTS_BY_IP.set(ip, requests);

  if (TOP_100.length < 100) {
    TOP_100.push(requests);
    requests.isTop100 = true;
  }

  return requests;
};

/**
 * For the given ip adress, we either get the existing count, or transparently begin counting.
 */
const getRequestCount = (ip: IpV4Address): RequestCounter => {
  return REQUESTS_BY_IP.get(ip) ?? initRequestCounter(ip);
};

/**
 * The last line of this function is (hopefully) the only surprising thing here.
 * It also ends up powering the whole algorithm.
 *
 * For these two reasons, let's focus on it.
 *
 * Let me preface this by pointing out that the sort is stable. Which is to say, the
 * cost of re-sorting at any given time is (in part) relative to the degree of disorder
 * accumulated since re-sorting it last.
 *
 * For once in a program, my solution here is aggressively re-sorting the
 * {@link TOP_100} array on every single request. Before you get out your pitchforks
 * and torches, let me point to the numbers. Incidentally, this exact practice is what
 * makes the whole implementation scale {@link benchmark as well as it does}.
 *
 * The {@link TOP_100} array only ever contains 100 items, and every time we re-sort
 * it again, the vast majority of elements will already be in their right places.
 *
 * Even in the case of some sort being particularly costly, we will have recuperated
 * that cost right afterwards, since the following (likely millions of) re-sorts all
 * capitalize on the shared ordering.
 *
 * Finally, sorting here is what allows a number of other invariants to fall into place.
 * E.g, only ever having to compare against the last entry in {@link considerForTop100}.
 */
export const requestHandled = (ip: IpV4Address): void => {
  const requests = getRequestCount(ip);

  requests.increment();

  considerForTop100(requests);

  TOP_100.sort(descendingByRequests);
};

/**
 * This function incurs its only cost from having to copy over the elements of the {@link TOP_100} array.
 *
 * If you instead wanted an automagically live-updating list, you could elide the spread,
 * and simply return a reference to the {@link TOP_100} array.
 *
 * On the plus side, it would make invoking this function near-instant.
 *
 * But we all know doing so would introduce a major footgun in practice (although returning it
 * as `readonly` does improve our odds slightly).
 *
 * Granted, there *are* cases where having a stateful list asynchronously reorder itself under
 * your feet *is* what you want. In the remaining 99% of cases, however, it's a bug.
 */
export const top100 = (): readonly RequestCounter[] => {
  return [...TOP_100];
};

/**
 * Expected to be called once a day.
 *
 * As for the last line mutating {@link TOP_100}...
 *
 * I typically prefer replacing the existing array with an empty array instead.
 *
 * However, in this case, it felt marginally simpler to declare the array as `const` instead.
 *
 * We get a stable reference in all places in exchange for accepting that we mutate the array (which renders it stateful).
 *
 * But we already *were* mutating it — that's *part of* sorting in-place.
 *
 * So I figure, why take on the possibility of the wrong reference getting captured in some closure?
 *
 * In upholding some variants, we inherently trade away others. 🧙‍♂️
 */
export const clear = (): void => {
  REQUESTS_BY_IP.clear();

  TOP_100.length = 0;
};
