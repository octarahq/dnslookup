import dns from "node:dns";
import { promisify } from "node:util";

const resolveAsync = promisify(dns.resolve);
const resolve4Async = promisify(dns.resolve4);
const resolve6Async = promisify(dns.resolve6);
const resolveMxAsync = promisify(dns.resolveMx);
const resolveTxtAsync = promisify(dns.resolveTxt);
const resolveNsAsync = promisify(dns.resolveNs);
const resolveCnameAsync = promisify(dns.resolveCname);
const resolveSoaAsync = promisify(dns.resolveSoa);
const resolveSrvAsync = promisify(dns.resolveSrv);
const reverseLookupAsync = promisify(dns.reverse);
const lookupAsync = promisify(dns.lookup);

/**
 * Resolves A records (IPv4 addresses) for a hostname.
 *
 * @param hostname - The domain name to resolve.
 * @returns A promise that resolves to an array of IPv4 addresses.
 * @throws {TypeError} If the hostname is not a valid string.
 * @example
 * ```typescript
 * const ips = await resolveA('google.com');
 * ```
 */
export async function resolveA(hostname: string): Promise<string[]> {
  if (!hostname || typeof hostname !== "string") {
    throw new TypeError("hostname must be a non-empty string");
  }
  return resolve4Async(hostname);
}

/**
 * Resolves AAAA records (IPv6 addresses) for a hostname.
 *
 * @param hostname - The domain name to resolve.
 * @returns A promise that resolves to an array of IPv6 addresses.
 * @throws {TypeError} If the hostname is not a valid string.
 */
export async function resolveAAAA(hostname: string): Promise<string[]> {
  if (!hostname || typeof hostname !== "string") {
    throw new TypeError("hostname must be a non-empty string");
  }
  return resolve6Async(hostname);
}

/**
 * Resolves MX (mail exchange) records for a hostname, sorted by priority.
 *
 * @param hostname - The domain name to resolve.
 * @returns A promise that resolves to an array of MX record objects.
 */
export async function resolveMX(hostname: string): Promise<dns.MxRecord[]> {
  if (!hostname || typeof hostname !== "string") {
    throw new TypeError("hostname must be a non-empty string");
  }
  const records = await resolveMxAsync(hostname);
  return records.sort(
    (a: dns.MxRecord, b: dns.MxRecord) => a.priority - b.priority,
  );
}

/**
 * Resolves TXT records for a hostname.
 *
 * @param hostname - The domain name to resolve.
 * @returns A promise that resolves to a 2D array of strings representing TXT records.
 */
export async function resolveTXT(hostname: string): Promise<string[][]> {
  if (!hostname || typeof hostname !== "string") {
    throw new TypeError("hostname must be a non-empty string");
  }
  return resolveTxtAsync(hostname);
}

/**
 * Resolves NS (name server) records for a hostname.
 *
 * @param hostname - The domain name to resolve.
 * @returns A promise that resolves to an array of name server hostnames.
 */
export async function resolveNS(hostname: string): Promise<string[]> {
  if (!hostname || typeof hostname !== "string") {
    throw new TypeError("hostname must be a non-empty string");
  }
  return resolveNsAsync(hostname);
}

/**
 * Resolves CNAME records for a hostname.
 *
 * @param hostname - The domain name to resolve.
 * @returns A promise that resolves to an array of canonical name records.
 */
export async function resolveCNAME(hostname: string): Promise<string[]> {
  if (!hostname || typeof hostname !== "string") {
    throw new TypeError("hostname must be a non-empty string");
  }
  return resolveCnameAsync(hostname);
}

/**
 * Resolves the SOA (Start of Authority) record for a hostname.
 *
 * @param hostname - The domain name to resolve.
 * @returns A promise that resolves to an SOA record object.
 */
export async function resolveSOA(hostname: string): Promise<dns.SoaRecord> {
  if (!hostname || typeof hostname !== "string") {
    throw new TypeError("hostname must be a non-empty string");
  }
  return resolveSoaAsync(hostname);
}

/**
 * Resolves SRV records for a hostname.
 *
 * @param hostname - The domain name to resolve.
 * @returns A promise that resolves to an array of SRV record objects.
 */
export async function resolveSRV(hostname: string): Promise<dns.SrvRecord[]> {
  if (!hostname || typeof hostname !== "string") {
    throw new TypeError("hostname must be a non-empty string");
  }
  return resolveSrvAsync(hostname);
}

/**
 * Resolves a generic DNS record type.
 *
 * @param hostname - The domain name to resolve.
 * @param rrtype - The resource record type (e.g., 'A', 'MX', 'TXT'). Defaults to 'A'.
 * @returns A promise that resolves to an array of records of the specified type.
 */
export async function resolve(
  hostname: string,
  rrtype: string = "A",
): Promise<any[]> {
  if (!hostname || typeof hostname !== "string") {
    throw new TypeError("hostname must be a non-empty string");
  }
  return resolveAsync(hostname, rrtype as any);
}

/**
 * Performs a reverse DNS lookup on an IP address.
 *
 * @param ip - The IP address (IPv4 or IPv6) to perform the reverse lookup for.
 * @returns A promise that resolves to an array of hostnames associated with the IP.
 */
export async function reverseLookup(ip: string): Promise<string[]> {
  if (!ip || typeof ip !== "string") {
    throw new TypeError("ip must be a non-empty string");
  }
  return reverseLookupAsync(ip);
}

/**
 * Performs a standard DNS lookup using the operating system's facilities.
 * Unlike other resolve functions, this may use /etc/hosts and internal search domains.
 *
 * @param hostname - The hostname to lookup.
 * @param options - Optional lookup configuration.
 * @returns A promise that resolves to the primary address and its family (4 or 6).
 */
export async function lookup(
  hostname: string,
  options: dns.LookupOptions = {},
): Promise<{ address: string; family: number }> {
  if (!hostname || typeof hostname !== "string") {
    throw new TypeError("hostname must be a non-empty string");
  }
  // @ts-ignore
  return lookupAsync(hostname, options);
}
