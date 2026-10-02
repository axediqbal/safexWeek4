# REQUIREMENTS: DevPulse Public API Product

**Milestone:** v1.0.0 — Production-Grade Commercial API  
**Status:** In Planning  
**Last Updated:** 2026-10-02

---

## 1. Functional Requirements

### 1.1 Authentication & Tenant Tiers (AUTH)
- [ ] **AUTH-01 (API Key Ingestion):** The API must authenticate clients via the `x-api-key` request header (or `api_key` query parameter fallback).
- [ ] **AUTH-02 (Key Validation & Rejection):** Missing, malformed, or unregistered keys must immediately return HTTP `401 Unauthorized` with a structured JSON error body.
- [ ] **AUTH-03 (Tier Structure):** The system must support at least three predefined customer tiers:
  - **Free Tier:** 5 requests / 60 seconds quota.
  - **Developer Tier:** 20 requests / 60 seconds quota.
  - **Enterprise Tier:** 100 requests / 60 seconds quota.
- [ ] **AUTH-04 (Per-Key Isolation):** Usage counters must be isolated per API key so that activity from one tenant never impacts another.

### 1.2 Rate Limiting & Quota Management (RATE)
- [ ] **RATE-01 (Quota Enforcement):** Requests exceeding the tier's window quota must be rejected with HTTP `429 Too Many Requests`.
- [ ] **RATE-02 (Standard Rate Limit Headers):** Every response must include standard tracking headers:
  - `X-RateLimit-Limit`: Maximum requests permitted in the window.
  - `X-RateLimit-Remaining`: Remaining request allowance for current window.
  - `X-RateLimit-Reset`: UTC epoch timestamp or remaining seconds until window resets.
- [ ] **RATE-03 (Retry-After Header):** When a `429` status is emitted, a standard `Retry-After` header indicating seconds until quota restoration must be present.
- [ ] **RATE-04 (Comparison Implementation):** Implement both Fixed Window Counter and Sliding Window Counter rate-limiting algorithms to demonstrate architectural trade-offs.

### 1.3 Endpoints & Business Logic (EP)
- [ ] **EP-01 (Code Health Metric):** `GET /api/v[1|2]/metrics/code-health` — returns repo health score, maintainability index, and lint rule compliance.
- [ ] **EP-02 (Security Audit Metric):** `GET /api/v[1|2]/metrics/security-audit` — returns vulnerability scan status, critical/high/medium CVE breakdown, and dependency risks.
- [ ] **EP-03 (Technical Debt Metric):** `GET /api/v[1|2]/metrics/tech-debt` — returns technical debt ratio, estimated refactoring hours, and code duplication percentage.
- [ ] **EP-04 (Build Benchmarks):** `GET /api/v[1|2]/metrics/build-benchmarks` — returns CI/CD pipeline run duration, test pass percentages, and bundle sizes.
- [ ] **EP-05 (Repository Analysis Engine):** `POST /api/v[1|2]/analyze/repository` — accepts repository payload (URL, branch, language) and returns an instant static audit synthesis.

### 1.4 Versioning & Deprecation Lifecycle (VER)
- [ ] **VER-01 (Dual Active Versions):** Both `/api/v1` and `/api/v2` route families must be simultaneously operational.
- [ ] **VER-02 (v1 Deprecation Signaling):** All `v1` responses must deliver deprecation metadata via standard HTTP headers:
  - `Deprecation: true`
  - `Sunset: <RFC 7231 Date>`
  - `Link: </api/v2/...>; rel="successor-version"`
- [ ] **VER-03 (v2 Breaking Changes):** `v2` must contain at least one major breaking schema evolution (e.g. uniform response envelope `data`/`meta`/`errors`, camelCase vs snake_case field normalization, enhanced nested severity counts, and ISO-8601 timestamps).

### 1.5 Contract & Documentation (DOC)
- [ ] **DOC-01 (OpenAPI 3.0 Specification):** Provide an authoritative `openapi.yaml` (or `openapi.json`) defining all paths, verbs, parameters, request bodies, response schemas, and security definitions.
- [ ] **DOC-02 (Realistic Examples):** Every schema and endpoint must have realistic, domain-accurate examples.
- [ ] **DOC-03 (Interactive Documentation Page):** Expose interactive Swagger UI at `/docs` (or `/api-docs`) allowing developers to test endpoints directly with their API keys.

---

## 2. Non-Functional & Verification Requirements

### 2.1 Verification & Tooling (VERIF)
- [ ] **VERIF-01 (Sample Client Script):** Deliver a clean 20-line standalone client script demonstrating API consumption with key headers and error handling.
- [ ] **VERIF-02 (Automated Rate Limit Load Test):** Provide a script executing burst requests that empirically verifies transitions from `200 OK` to `429 Too Many Requests` with `Retry-After`.
- [ ] **VERIF-03 (Test Log & Proof):** Record numerical test output showing key counters, tier boundaries, and reset timing.

### 2.2 Reporting & Submission (SUB)
- [ ] **SUB-01 (Professional README):** Complete report with scope statement, architectural decisions, rate-limiter comparison analysis, testing data, limitations, and future improvements.
- [ ] **SUB-02 (Clean Repository):** Git repository free from unnecessary clutter, placeholders, or Week 3 relics.
- [ ] **SUB-03 (Walkthrough Video Script):** Preparation notes and outline for the mandatory 5-10 minute screen-recording video demonstration.
