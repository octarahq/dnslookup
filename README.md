<div align="center">
    <img src="https://tools.octara.xyz/favicon.png" width="200" alt="DnsLookup Logo">
    <h1>DnsLookup</h1>
    <p>
        <a href="https://github.com/octarahq/dnslookup/commits/main"><img alt="Last commit" src="https://img.shields.io/github/last-commit/octarahq/dnslookup?logo=github&logoColor=ffffff" /></a>
        <a href="https://www.npmjs.com/package/@octarahq/dnslookup"><img alt="npm version" src="https://img.shields.io/npm/v/@octarahq/dnslookup.svg?logo=npm" /></a>
        <a href="https://tools.octara.xyz/docs/modules/dnslookup/latest"><img alt="Docs" src="https://img.shields.io/badge/Docs-dnslookup-blue.svg" /></a>
        <a href="https://tools.octara.xyz"><img src="https://img.shields.io/badge/Website-tools.octara.xyz-blue.svg" alt="Website" /></a>
    </p>
</div>

## About

`dnslookup` is a small Node.js module to perform asynchronous DNS queries (A, AAAA, CNAME, MX, TXT, etc.) with a built-in cache.

It is intended for integration into scripts, microservices, and networking tools where reliable and performant DNS resolution is required.

## Features

- Asynchronous DNS queries based on `dns/promises` with robust error handling.
- Configurable TTL cache.
- Multi-type support (A, AAAA, MX, TXT, CNAME, etc.).
- JSON-friendly output suitable for APIs.

## Installation

```bash
npm install @octarahq/dnslookup
```

## Usage

Basic example:

```ts
import { DNSLookup } from "@octarahq/dnslookup";

const dns = new DNSLookup();

// Simple A record lookup
const result = await dns.resolve("example.com", "A");
console.log(result);
// => [{ address: '93.184.216.34', ttl: 300 }]
```

## Links

- [npm package](https://www.npmjs.com/package/@octarahq/dnslookup)
- [GitHub repository](https://github.com/octarahq/dnslookup)
- [Octara](https://tools.octara.xyz)
- [Status](https://octara.xyz/status)
- [Documentation](https://tools.octara.xyz/docs/modules/dnslookup/latest)
 - [Documentation](https://tools.octara.xyz/docs/modules/dnslookup/latest)