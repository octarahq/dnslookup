/**
 * Represents a single cached entry with a timestamp-based expiration.
 * @template T
 */
interface CacheEntry<T> {
  /** The value stored in the cache. */
  value: T;
  /** The absolute time (milliseconds) when this entry should be considered expired. */
  expiresAt: number;
}

/**
 * Simple in-memory TTL (Time-to-Live) cache for DNS records and other assets.
 *
 * Provides basic expiration logic and cleanup of expired entries.
 */
export class DnsCache {
  private _store: Map<string, CacheEntry<any>> = new Map();
  private _defaultTtl: number;

  /**
   * Creates a new DnsCache instance.
   *
   * @param defaultTtl - The default entry lifespan in milliseconds. Defaults to 30,000 (30 seconds).
   */
  constructor(defaultTtl: number = 30_000) {
    this._defaultTtl = defaultTtl;
  }

  /**
   * Stores a value in the cache with a specified or default TTL.
   *
   * @template T
   * @param key - The unique identifier for the cached value.
   * @param value - The data to store.
   * @param ttl - Lifespan of this specific entry in milliseconds. Defaults to _defaultTtl.
   * @example
   * ```typescript
   * cache.set('A:example.com', ['127.0.0.1'], 60_000);
   * ```
   */
  set<T>(key: string, value: T, ttl: number = this._defaultTtl): void {
    this._store.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });
  }

  /**
   * Retrieves a non-expired value from the cache.
   * If the value exists but is expired, it will be removed and return undefined.
   *
   * @template T
   * @param key - The unique identifier for the cached value.
   * @returns The cached data, or undefined if not found or expired.
   */
  get<T>(key: string): T | undefined {
    const entry = this._store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this._store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  /**
   * Checks if a cache entry exists and is still valid (not expired).
   *
   * @param key - The unique identifier to check.
   * @returns True if a valid entry exists, false otherwise.
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Manually removes an entry from the cache.
   *
   * @param key - The unique identifier to delete.
   */
  delete(key: string): void {
    this._store.delete(key);
  }

  /**
   * Clears the entire cache store.
   */
  clear(): void {
    this._store.clear();
  }

  /**
   * Manually triggers a cleanup of all expired entries across the entire store.
   */
  purgeExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this._store.entries()) {
      if (now > entry.expiresAt) {
        this._store.delete(key);
      }
    }
  }

  /**
   * Returns the total number of entries currently stored (includes both valid and expired entries).
   */
  get size(): number {
    return this._store.size;
  }
}
