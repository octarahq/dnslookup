/**
 * @module @octarahq/dnslookup
 *
 * A modern, TypeScript-native DNS resolution library for Node.js.
 *
 * Provides high-level caching, structured responses, and a low-level
 * promisified resolver as an alternative to the native `node:dns` module.
 */

export * from "./DnsLookup.js";
export * as resolver from "./resolver.js";
export * from "./cache.js";
