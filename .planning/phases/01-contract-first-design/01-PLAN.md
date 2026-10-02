# Phase 1 Plan: Contract-First Design & OpenAPI 3 Specification

**Phase:** 1 of 5  
**Deliverable:** `openapi.yaml` & `openapi.json` contract files  
**Status:** READY TO EXECUTE

---

## Objective
Author a contract-first OpenAPI 3.0 specification for DevPulse Labs' Developer Tools & Code Intelligence API prior to implementing Express routes. The specification will serve as the single source of truth for both `v1` and `v2` endpoints, authentication schemes, rate limit headers, and interactive Swagger UI generation.

---

## Execution Tasks

### Task 1: Scaffold OpenAPI 3.0 Header, Servers & Security Definitions
- Target file: `openapi.yaml`
- Configure OpenAPI `3.0.3` metadata:
  - Organization: DevPulse Labs (Independent Software House)
  - Servers: Multi-environment endpoints supporting `http://localhost:3000/api/v1` and `http://localhost:3000/api/v2`
  - Security Schemes:
    - Primary: `ApiKeyHeader` (`x-api-key` header)
    - Fallback: `ApiKeyQuery` (`api_key` query param)
- Document the 3 Tier Quotas (Free: 5 req/min, Developer: 20 req/min, Enterprise: 100 req/min) in the API description.

### Task 2: Define Schemas for 5 Core Data Service Endpoints
- Define full request/response schemas with realistic examples for:
  1. `GET /metrics/code-health` — Overall maintainability index, quality score, lint rule pass rate.
  2. `GET /metrics/security-audit` — Vulnerability scan summary, CVE severity distribution (critical, high, medium, low).
  3. `GET /metrics/tech-debt` — Estimated remediation time, debt ratio, duplicated line count.
  4. `GET /metrics/build-benchmarks` — CI/CD pipeline timings, test suite execution duration, artifact sizes.
  5. `POST /analyze/repository` — Trigger repository audit job; payload accepts `repo_url`, `branch`, `commit_sha`, `analysis_depth`.

### Task 3: Define Versioning & Rate-Limiting Error Schemas
- Model standard response headers:
  - Rate limiting headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`.
  - Deprecation headers for v1: `Deprecation`, `Sunset`, `Link`.
- Model standardized error envelopes:
  - `400 Bad Request` (Validation errors).
  - `401 Unauthorized` (Missing or invalid API key).
  - `429 Too Many Requests` (Quota exceeded, includes retry delay).
  - `500 Internal Server Error`.

### Task 4: Validate OpenAPI Contract Integrity
- Generate matching `openapi.json` for easy programmatic consumption.
- Write and run a Node.js validation script (`scripts/validate-spec.js`) using a schema validator (or OpenAPI parser) to guarantee 100% specification validity without syntax errors.

---

## Verification & Acceptance Criteria
- [ ] Spec parses without errors or dangling `$ref` pointers.
- [ ] All 5 endpoints have full documentation, parameters, and 200/400/401/429 response codes.
- [ ] Tier limits and API key authentication are explicitly documented.
- [ ] Both v1 and v2 endpoint contracts are represented.
