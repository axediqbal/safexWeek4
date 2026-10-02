# Phase 4 Plan: API Versioning & Interactive Swagger UI

**Phase:** 4 of 5  
**Deliverables:** Deprecation Middleware (RFC 8594), Breaking Change Validation (v1 vs v2), Swagger UI Interactive Docs (`/docs`), Phase 4 Verification Suite  
**Status:** READY TO EXECUTE

---

## Objective
Implement multi-version routing with active support for both `/api/v1` (legacy) and `/api/v2` (modern). Emit RFC-compliant deprecation signaling on all `v1` routes (`Deprecation`, `Sunset`, `Link`, `Warning`). Introduce explicit breaking schema transformations in `v2` (envelope wrapping, camelCase normalization, nested severity objects). Mount interactive Swagger UI documentation at `/docs` with live endpoint testing.

---

## Architecture Layout
```
src/
├── app.js                    # Mounts Swagger UI at /docs and v1 deprecation middleware
├── middleware/
│   └── deprecation.js        # RFC 8594 deprecation and sunset headers
├── controllers/
│   └── metricsController.js  # Already supports v1 vs v2 breaking schema diffs
scripts/
└── test-phase4.js            # Automated verification for versioning and Swagger UI
```

---

## Execution Tasks

### Task 1: RFC 8594 Deprecation Middleware (`src/middleware/deprecation.js`)
- Construct middleware applied exclusively to `/api/v1` route tree.
- Inject standards-compliant deprecation headers on every `v1` response:
  - `Deprecation: true`
  - `Sunset: Wed, 11 Nov 2026 00:00:00 GMT`
  - `Link: </api/v2>; rel="successor-version"`
  - `Warning: 299 - "API v1 is deprecated and scheduled for decommission on 2026-11-11. Please migrate to /api/v2."`

### Task 2: Validate Breaking Changes Between v1 and v2
- Verify that `v1` and `v2` endpoints demonstrate clear, intentional breaking differences:
  - **Schema Envelope:** `v1` emits flat un-enveloped payloads; `v2` emits uniform envelope `{ status, version, data: { ... } }`.
  - **Naming Convention:** `v1` uses `snake_case` (e.g. `health_score`, `tech_debt_ratio`); `v2` uses `camelCase` (e.g. `healthScore`, `techDebtRatio`).
  - **Data Depth:** `v2` contains additional enterprise metadata (e.g. `lintCompliance` details, `remediationCostEstimateUsd`, `treeShakingEfficiency`).

### Task 3: Interactive Swagger UI Documentation (`/docs` & `/api-docs`)
- Mount `swagger-ui-express` in `src/app.js` using `openapi.json`.
- Serve interactive explorer at:
  - `http://localhost:3000/docs`
  - `http://localhost:3000/api-docs` (alias)
  - `http://localhost:3000/openapi.json` (raw JSON contract)
  - `http://localhost:3000/openapi.yaml` (raw YAML contract)
- Customize Swagger UI options with DevPulse branding, custom title, and persistent authorization.

### Task 4: Phase 4 Verification Suite (`scripts/test-phase4.js`)
- Test `/api/v1/metrics/code-health`:
  - Assert HTTP 200 OK.
  - Assert presence of `deprecation`, `sunset`, `link`, and `warning` headers.
  - Assert snake_case flat structure (`health_score`).
- Test `/api/v2/metrics/code-health`:
  - Assert HTTP 200 OK.
  - Assert ABSENCE of `deprecation` header.
  - Assert camelCase enveloped structure (`data.healthScore`).
- Test `/docs` endpoint:
  - Assert HTTP 200 OK with `text/html` and Swagger UI assets.
- Test `/openapi.json` endpoint:
  - Assert HTTP 200 OK with valid JSON spec.

---

## Verification Criteria
- [ ] Both `/api/v1` and `/api/v2` routes are operational side-by-side.
- [ ] All `/api/v1` responses include RFC 8594 deprecation and sunset headers.
- [ ] `/api/v2` responses do not include deprecation headers.
- [ ] Breaking changes (envelope, casing, schema depth) are verified between v1 and v2.
- [ ] Swagger UI at `/docs` loads successfully with interactive "Try it out" functionality.
- [ ] 100% test pass rate on `scripts/test-phase4.js`.
