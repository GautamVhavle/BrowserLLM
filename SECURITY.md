# Security Policy

## Supported Versions

BrowserLLM is a client-side application with no backend. Security concerns are limited to the browser environment.

| Version | Supported |
|---------|-----------|
| Latest (`main`) | Yes |

## Scope

Since BrowserLLM runs entirely in the browser with no server component:

- **No user data is transmitted** — all inference runs locally
- **No authentication or session tokens** are handled
- **No database or persistent server state** exists

The main attack surface is the browser itself and the model weights downloaded from the MLC CDN.

## Reporting a Vulnerability

If you discover a security vulnerability (e.g., XSS in rendered model output, unsafe handling of custom model IDs, or a supply-chain issue with a dependency), please **do not open a public issue**.

Instead, report it via GitHub's private [Security Advisories](https://github.com/GautamVhavle/BrowserLLM/security/advisories/new).

Include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact
- A suggested fix if you have one

We will respond within 5 business days.
