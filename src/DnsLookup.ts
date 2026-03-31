import { DnsCache } from "./cache.js";
import * as resolver from "./resolver.js";
import dns from "node:dns";

/**
 * Configuration options for the DnsLookup client.
 */
export interface DnsLookupOptions {
  /** The default cache Time-To-Live in milliseconds. Defaults to 30,000. */
  cacheTtl?: number;
  /** Whether to enable or disable result caching. Defaults to true. */
  cache?: boolean;
}

/**
 * Represents a DNS response that includes metadata about its source.
 */
export interface CachedResponse<T> {
  /** The actual DNS data returned (e.g., list of IPs). */
  data: T;
  /** Whether the result was served from the local cache. */
  cached: boolean;
}

/**
 * The unified result of a complete DNS profile lookup.
 */
export interface DnsProfileResult {
  /** The hostname associated with the lookup. */
  hostname: string;
  /** List of IPv4 addresses. Null if resolution failed. */
  A: string[] | null;
  /** List of IPv6 addresses. Null if resolution failed. */
  AAAA: string[] | null;
  /** List of MX records. Null if resolution failed. */
  MX: dns.MxRecord[] | null;
  /** List of Name Servers. Null if resolution failed. */
  NS: string[] | null;
  /** List of TXT records. Null if resolution failed. */
  TXT: string[][] | null;
}

/**
 * High-level DNS client that provides cached and structured responses over the native node:dns module.
 *
 * This class is the primary interface for most DNS resolution tasks.
 */
export class DnsLookup {
  private _cacheEnabled: boolean;
  private _cache: DnsCache;

  /**
   * Initializes a new DnsLookup client with optional configuration.
   *
   * @param options - Configuration options for the client.
   * @example
   * ```typescript
   * const client = new DnsLookup({ cacheTtl: 60_000 });
   * ```
   */
  constructor(options: DnsLookupOptions = {}) {
    this._cacheEnabled = options.cache !== false;
    this._cache = new DnsCache(options.cacheTtl ?? 30_000);
  }

  private _cacheKey(type: string, hostname: string): string {
    return `${type}:${hostname.toLowerCase()}`;
  }

  private async _cached<T>(
    type: string,
    hostname: string,
    fn: (host: string) => Promise<T>,
  ): Promise<CachedResponse<T>> {
    const key = this._cacheKey(type, hostname);
    if (this._cacheEnabled) {
      const cachedData = this._cache.get<T>(key);
      if (cachedData !== undefined) {
        return { data: cachedData, cached: true };
      }
    }
    const data = await fn(hostname);
    if (this._cacheEnabled) {
      this._cache.set(key, data);
    }
    return { data, cached: false };
  }

  /**
   * Resolves A records (IPv4) for a hostname, using the local cache if available.
   *
   * @param hostname - The domain name to resolve.
   * @returns A structured response wrap containing the list of IPs and cache status.
   */
  resolveA(hostname: string): Promise<CachedResponse<string[]>> {
    return this._cached<string[]>("A", hostname, resolver.resolveA);
  }

  /**
   * Resolves AAAA records (IPv6) for a hostname, using the local cache if available.
   *
   * @param hostname - The domain name to resolve.
   * @returns A structured response wrap containing the list of IPs and cache status.
   */
  resolveAAAA(hostname: string): Promise<CachedResponse<string[]>> {
    return this._cached<string[]>("AAAA", hostname, resolver.resolveAAAA);
  }

  /**
   * Resolves MX records for a domain, using the local cache if available.
   * Results are sorted by priority ascending.
   *
   * @param hostname - The domain name to resolve.
   * @returns A structured response wrap containing the MX records and cache status.
   */
  resolveMX(hostname: string): Promise<CachedResponse<dns.MxRecord[]>> {
    return this._cached<dns.MxRecord[]>("MX", hostname, resolver.resolveMX);
  }

  /**
   * Resolves TXT records for a domain, using the local cache if available.
   *
   * @param hostname - The domain name to resolve.
   * @returns A structured response wrap containing the TXT records and cache status.
   */
  resolveTXT(hostname: string): Promise<CachedResponse<string[][]>> {
    return this._cached<string[][]>("TXT", hostname, resolver.resolveTXT);
  }

  /**
   * Resolves NS records for a domain, using the local cache if available.
   *
   * @param hostname - The domain name to resolve.
   * @returns A structured response wrap containing the Name Servers and cache status.
   */
  resolveNS(hostname: string): Promise<CachedResponse<string[]>> {
    return this._cached<string[]>("NS", hostname, resolver.resolveNS);
  }

  /**
   * Resolves CNAME records for a domain, using the local cache if available.
   *
   * @param hostname - The domain name to resolve.
   * @returns A structured response wrap containing the CNAME records and cache status.
   */
  resolveCNAME(hostname: string): Promise<CachedResponse<string[]>> {
    return this._cached<string[]>("CNAME", hostname, resolver.resolveCNAME);
  }

  /**
   * Resolves the SOA (Start of Authority) record for a domain, using the local cache if available.
   *
   * @param hostname - The domain name to resolve.
   * @returns A structured response wrap containing the SOA record and cache status.
   */
  resolveSOA(hostname: string): Promise<CachedResponse<dns.SoaRecord>> {
    return this._cached<dns.SoaRecord>("SOA", hostname, resolver.resolveSOA);
  }

  /**
   * Resolves SRV records for a domain, using the local cache if available.
   *
   * @param hostname - The domain name to resolve.
   * @returns A structured response wrap containing the SRV records and cache status.
   */
  resolveSRV(hostname: string): Promise<CachedResponse<dns.SrvRecord[]>> {
    return this._cached<dns.SrvRecord[]>("SRV", hostname, resolver.resolveSRV);
  }

  /**
   * Performs an exhaustive DNS profile lookup (A, AAAA, MX, NS, TXT) in parallel.
   * This is useful for obtaining a snapshot of multiple record types efficiently.
   *
   * @param hostname - The domain name to profile.
   * @returns A single unified result object with all resolved record types.
   * @example
   * ```typescript
   * const profile = await client.profile('example.com');
   * console.log(profile.A, profile.MX);
   * ```
   */
  async profile(hostname: string): Promise<DnsProfileResult> {
    const [a, aaaa, mx, ns, txt] = await Promise.allSettled([
      this.resolveA(hostname),
      this.resolveAAAA(hostname),
      this.resolveMX(hostname),
      this.resolveNS(hostname),
      this.resolveTXT(hostname),
    ]);

    const extract = <T>(
      result: PromiseSettledResult<CachedResponse<T>>,
    ): T | null => (result.status === "fulfilled" ? result.value.data : null);

    return {
      hostname,
      A: extract(a),
      AAAA: extract(aaaa),
      MX: extract(mx),
      NS: extract(ns),
      TXT: extract(txt),
    };
  }

  /**
   * Performs a reverse DNS lookup on an IP address, caching the PTR record.
   *
   * @param ip - The IP to reverse-map.
   * @returns A structured response wrap with the hostnames and cache status.
   */
  reverse(ip: string): Promise<CachedResponse<string[]>> {
    return this._cached<string[]>("PTR", ip, resolver.reverseLookup);
  }

  /**
   * Directly performs an OS-level hostname lookup (respects /etc/hosts).
   * Note: This method bypasses the DnsLookup internal cache as it depends on system state.
   *
   * @param hostname - The domain to lookup.
   * @param options - OS resolver options.
   * @returns The primary address and family found by the system.
   */
  lookup(
    hostname: string,
    options: dns.LookupOptions = {},
  ): Promise<{ address: string; family: number }> {
    return resolver.lookup(hostname, options);
  }

  /**
   * Manually invalidates (removes) a cached entry for a specific record type and host.
   *
   * @param type - The DNS record type identifier (e.g., 'A', 'MX', 'PTR').
   * @param hostname - The domain associated with the entry.
   */
  invalidate(type: string, hostname: string): void {
    this._cache.delete(this._cacheKey(type, hostname));
  }

  /**
   * Clears all cached DNS records stored by this client.
   */
  clearCache(): void {
    this._cache.clear();
  }
}
