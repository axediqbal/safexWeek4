# Phase 2 Plan: Express Server Core & Tiered Authentication

**Phase:** 2 of 5  
**Deliverables:** Express server, API Key & Tier Registry, Auth Middleware, 5 Endpoint Controllers, Phase 2 Verification Suite  
**Status:** READY TO EXECUTE

---

## Objective
Scaffold the core Express application architecture, seed customer API keys with three usage tiers (Free, Developer, Enterprise), implement authentication middleware that rejects unauthorized requests with HTTP `401 Unauthorized`, and implement controller logic for all 5 developer tools endpoints.

---

## Architecture Layout
```
src/
├── app.js                    # Express app initialization & middleware configuration
├── server.js                 # HTTP listener & port binding
├── config/
│   └── tiers.js              # Quota configurations for Free, Developer, Enterprise
├── data/
│   ├── apiKeys.js            # In-memory customer tenant database
│   └── mockMetrics.js        # Realistic code quality, security, and benchmark data
├── middleware/
│   ├── auth.js               # API Key validation & tier resolution
│   └── errorHandler.js       # Centralized error handler
├── controllers/
│   └── metricsController.js  # Business logic for 5 core endpoints
└── routes/
    └── metricsRoutes.js      # Route bindings
```

---

## Execution Tasks

### Task 1: API Key & Tier Quota Registry (`src/config/tiers.js` & `src/data/apiKeys.js`)
- Configure the 3 subscription tiers:
  - `free`: 5 requests per 60s
  - `developer`: 20 requests per 60s
  - `enterprise`: 100 requests per 60s
- Seed valid API keys for automated and manual testing:
  - `devpulse_free_demo_key` -> Free Tier (`IndieDev Co`)
  - `devpulse_pro_demo_key` -> Developer Tier (`SaaS Velocity Studio`)
  - `devpulse_ent_demo_key` -> Enterprise Tier (`Global FinTech Cloud`)

### Task 2: Authentication Middleware (`src/middleware/auth.js`)
- Inspect incoming `x-api-key` header (with query fallback `api_key`).
- If missing or unknown, respond with HTTP `401 Unauthorized`:
  ```json
  {
    "status": "error",
    "code": 401,
    "message": "Missing or invalid API key. Provide a registered key via 'x-api-key' header.",
    "timestamp": "2026-10-02T..."
  }
  ```
- If valid, attach `req.apiKey` and `req.tier` metadata to request object.

### Task 3: Mock Data Store & Metrics Controllers (`src/data/mockMetrics.js` & `src/controllers/metricsController.js`)
- Populate realistic datasets for DevPulse's 5 endpoints:
  1. `getCodeHealth`: Returns health score (0-100), maintainability index, lint compliance.
  2. `getSecurityAudit`: Returns vulnerability scans, CVE advisories, severity counts.
  3. `getTechDebt`: Returns debt ratio, estimated remediation hours, duplicate lines.
  4. `getBuildBenchmarks`: Returns CI pipeline execution timings, test counts, bundle size.
  5. `postAnalyzeRepository`: Accepts `repo_url`, `branch`, `analysis_depth`, validates input, returns analysis job summary.

### Task 4: Express Server Pipeline (`src/app.js` & `src/server.js`)
- Configure standard middlewares: `cors()`, `express.json()`, request logging.
- Mount health check endpoint: `GET /health`.
- Mount `/api/v2` routes protected by authentication middleware.
- Configure global error handler and 404 catcher.

### Task 5: Phase 2 Verification Suite (`scripts/test-phase2.js`)
- Create automated script testing:
  1. Unauthenticated request -> returns 401.
  2. Invalid key -> returns 401.
  3. Valid Free, Pro, Enterprise keys -> return 200 with proper data.
  4. POST `/analyze/repository` validation -> returns 400 when `repo_url` is missing, returns 201 on valid submission.

---

## Verification Criteria
- [ ] Server boots on configurable port (default `3000`).
- [ ] `401 Unauthorized` returned for unauthenticated calls.
- [ ] Valid keys resolve to appropriate tenant metadata and tier.
- [ ] All 5 endpoints return valid payloads conforming to OpenAPI contract.
- [ ] Phase 2 automated test suite passes with 100% success rate.
