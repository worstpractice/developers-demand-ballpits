import type { clear } from '../challengeSolution';

/**
 * This class is an abstraction over {@link Map}. A higher-order map is not exactly right. Rather, it's a collection of {@link Map}s, posing as a single {@link Map}.
 *
 * Fair enough. But why? What on earth necessitated this creation when we already have {@link Map}s?
 *
 * Funny story actually — in writing my first implementation using a regular {@link Map}, I managed to reproducibly
 * trigger a built-in exception, the error message of which Google returns just 1 result for (and it's a false positive search result).
 *
 * {@link https://www.google.com/search?q=%22RangeError%3A+Map+maximum+size+exceeded%22 No, really}.
 *
 * Note that this is not your run-of-the-mill stack overflow. There is no recursion involved here.
 *
 * It turns out that V8's {@link Map} implementation has a hard limit of 16,777,216 million keys per instance.
 * This hard upper limit (and the resulting exception once the limit is surpassed) could very well be in the spec,
 * though my gut tells me even if so, the exact number is likely implementation-defined.
 *
 * In short, it appears few people have publicly stressed V8's {@link Map} implementation to the point I did in solving
 * this challenge. This omen, of course, bodes well.
 *
 * The {@link BucketMap.insert insert} method represents my chosen technique for overcoming this limitation in practice.
 *
 * This (perhaps lesser known) key limit of regular {@link Map}s is what motivated the creation of a data
 * structure better suited to the present (highly specific) use case.
 *
 * I should note that while I always try to solve problems in terms of data structures rather than logic, I don't
 * just sit down and start implementing data structures at the drop of a hat. Anymore.
 *
 * Crucially, the `Big O` remains the same for this class as for the regular {@link Map}.
 *
 * While the search space is (potentially) bigger, both time and memory complexity for all operations still *grow*
 * at the same rate as before.
 *
 * V8's {@link Map} {@link https://v8.dev/blog/hash-code implementation} uses {@link https://wiki.mozilla.org/User:Jorend/Deterministic_hash_tables deterministic hash tables}.
 *
 * The JSC {@link https://webkit.org/blog/7536/jsc-loves-es6/ implementation} instead uses {@link https://en.wikipedia.org/wiki/Linear_probing linear probing}
 * (relevant primarily for React Native).
 *
 * That being said, a `React Native` app is an unlikely choice for an API backend — and in which case, I wish it all the luck
 * in handling the load we're imagining here.
 *
 * As far as {@link Map}s go, then, in a nutshell, most operations are `O(1)`, which is one reason why I felt a solution involving
 * something more exotic (like a `binary heap` or a `trie`, respectively) would be pan out less than ideal, and certainly require
 * a lot more code (or taking on an external dependency `*gasps audibly*`).
 *
 * I didn't bother to fully implement the entire {@link Map} interface, as I feel that would have been beside the point
 * for this particular use case.
 *
 * If I *were* to implement it fully, I would first of all change the signature to:
 *
 * ```
 * export class BucketMap<K, V> implements Map<K, V> { // ...
 * ```
 *
 *  ...and then start following the compiler errors. Again, that's `implements`, not `extends`.
 */
export class BucketMap<K, V> {
  /** This odd looking syntax is actually incredibly powerful.
   *
   * This dash of TypeScript makes it a type error for the `buckets` array (initialized in the constructor) to ever be empty.
   *
   * In other words, it must have atleast one `Map<K, V>` in it at all times.
   *
   * A regular list (zero or more):
   *
   * ```
   * let foo: Map<K, V>[];
   * ```
   *
   * A tuple (exactly one):
   * ```
   * let foo: [Map<K, V>];
   * ```
   *
   * Combining the two (one or more):
   * ```
   * let foo: [Map<K, V>, ...Map<K, V>[]];
   * ```
   */
  private readonly buckets: [Map<K, V>, ...Map<K, V>[]];

  /**
   * Helps prevent off-by-one-errors. Basically always worth it in my experience.
   */
  private get currentBucket(): Map<K, V> {
    return this.buckets[this.buckets.length - 1];
  }

  constructor() {
    this.buckets = [new Map<K, V>()]; // try changing this to an empty array and watch in amazement as TypeScript complains
  }

  /**
   * Not to be confused with the {@link clear} function specified as part of the exercise.
   *
   * This method is merely {@link Map.clear upholding convention}.
   */
  clear(this: this): void {
    for (const bucket of this.buckets) {
      bucket.clear();
    }
  }

  /**
   * The (genuinely) rare instance of a function where returning two incompatible types actually makes sense.
   *
   * We could use {@link Map.has has} here instead, but with a {@link Map.get get}, you save the extra lookup if you *do* find the value.
   */
  get(this: this, key: K): V | undefined {
    for (const bucket of this.buckets) {
      const value = bucket.get(key);

      if (value !== undefined) return value;
    }

    return undefined;
  }

  /**
   * Some dev teams value {@link https://en.wikipedia.org/wiki/Code_golf code golfing} at work.
   *
   * Just to show my range, I would like to point out that this method *can* also be written as a one-liner:
   * ```
   * this.#buckets.push(new Map<K, V>().set(key, value));
   * ```
   */
  private growToAccomodate(this: this, key: K, value: V): void {
    const bucket = new Map<K, V>();

    bucket.set(key, value);

    this.buckets.push(bucket);
  }

  /**
   * Since we're only looking to handle a very specific edge case (see {@link BucketMap the technical reason why}),
   * we immediately re-throw anything that isn't exactly that.
   */
  private insert(this: this, key: K, value: V): void {
    try {
      this.currentBucket.set(key, value);
    } catch (err: unknown) {
      if (!(err instanceof RangeError)) throw err;

      this.growToAccomodate(key, value);
    }
  }

  /**
   * Some devs are categorically opposed to using expressions to produce side effects,
   * which I can totally understand.
   *
   * I happen write a lot of Rust, and there, you learn to think in expressions.
   *
   * Snippets like these tend to induce tears in developers, though from what precise emotion depends on the dev:
   *
   * ```rust
   * let x = if x { a } else { b };
   * ```
   *
   * If the team leans more towards statement form:
   *
   * ```
   *  if (!this.update(key, value)) {
   *   this.insert(key, value);
   * }
   * ```
   */
  set(this: this, key: K, value: V): void {
    this.update(key, value) || this.insert(key, value);
  }

  /**
   * Returns wether or not the update operation succeeded.
   */
  private update(this: this, key: K, value: V): boolean {
    for (const bucket of this.buckets) {
      if (bucket.has(key)) {
        bucket.set(key, value);
        return true;
      }
    }

    return false;
  }
}
