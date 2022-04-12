import type { requestHandled } from '../challengeSolution';
import type { IpV4Address } from '../typings/IpV4Address';

/**
 * A simple monotonic counter.
 *
 * Deduplication of counter objects per IP happens in the {@link requestHandled} function
 * (or, more precisely, in a module-private function called inside it).
 */
export class RequestCounter {
  /**
   * For those unfamiliar with the syntax, this is not a TypeScript original.
   *
   * Private fields are {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields a semi-new part of normal JS} and is supported on all platforms.
   *
   * Aside from offering (highly optimizable) hard privacy at runtime, they also solve internal naming collisions in classes.
   *
   * Having the getter be named `count` is suddenly possible when the private field storing the actual value is `#count`.
   */
  #count: number;

  get count(): number {
    return this.#count;
  }

  /**
   * While this flag is included as a (major) performance optimization (a form of caching), I should stress it adds a certain amount of brittleness to the code.
   *
   * In most code, flipping boolean flags in a stateful manner is a pretty bad idea, even for a small codebase.
   *
   * Things still pan out well without this flag, in which case we would walk the entire toplist of 100 items each time instead.
   *
   * The list is small and consistently sorted, so it would be fast enough.
   *
   * I ultimately opted to include this boolean flag because it reliably speeds up {@link requestHandled} by an order of magnitude.
   */
  isTop100: boolean;

  readonly ip: IpV4Address;

  constructor(ip: IpV4Address) {
    this.#count = 0;
    this.ip = ip;
    this.isTop100 = false;
  }

  increment(this: this): void {
    this.#count++;
  }
}
