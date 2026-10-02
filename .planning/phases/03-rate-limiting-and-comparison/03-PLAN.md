# Phase 3 Plan: Rate Limiting Engine & Comparative Implementation

**Phase:** 3 of 5  
**Deliverables:** Fixed Window Limiter, Sliding Window Limiter, Rate Limit Middleware with RFC Headers, Comparison Benchmark Script, Phase 3 Verification Suite  
**Status:** READY TO EXECUTE

---

## Objective
Implement multi-tenant rate limiting with RFC-compliant headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After` on HTTP `429`). To satisfy the assignment's **Special Constraint (Comparison Rule)**, implement two alternative algorithms:
1. **Approach A:** In-Memory Fixed Window Counter.
2. **Approach B:** In-Memory Sliding Window Counter (Rolling Weighted Window).
Benchmark both approaches to empirically demonstrate the boundary burst vulnerability of Fixed Window and justify the production choice of Sliding Window.

---

## Architecture Layout
```
src/
├── services/
│   └── rateLimiter/
│       ├── fixedWindow.js      # Approach A: Fixed epoch window counter
│       ├── slidingWindow.js    # Approach B: Weighted rolling window counter
│       └── index.js            # Engine factory & algorithm switcher
├── middleware/
│   └── rateLimiter.js          # Express middleware injecting headers & 429 handler
scripts/
├── benchmark-comparison.js     # Empirical benchmark script for Special Constraint
└── test-phase3.js              # Automated rate limit verification suite
```

---

## Execution Tasks

### Task 1: Approach A — Fixed Window Counter (`src/services/rateLimiter/fixedWindow.js`)
- Slice time into static windows of `windowSeconds` (60s).
- Maintain `Map<key, { count, windowStart }>` for each active tenant.
- When `now - windowStart >= windowSeconds`, reset `count = 0` and update `windowStart`.
- Return `{ allowed, limit, remaining, resetSeconds, algorithm: 'fixed-window' }`.

### Task 2: Approach B — Sliding Window Counter (`src/services/rateLimiter/slidingWindow.js`)
- Maintain `Map<key, { currentCount, previousCount, currentWindowStart }>` for each tenant.
- Calculate weighted request estimate:
  $$\text{estimated} = \text{currentCount} + \text{previousCount} \times \left(1 - \frac{\text{elapsed}}{\text{windowSize}}\right)$$
- If `estimated < limit`, increment `currentCount` and allow.
- If `estimated >= limit`, reject request.
- Return `{ allowed, limit, remaining, resetSeconds, algorithm: 'sliding-window' }`.

### Task 3: Unified Middleware & RFC Header Injection (`src/middleware/rateLimiter.js`)
- Intercept request after `apiKeyAuth`.
- Determine client's configured tier limit (`req.tierConfig.limit`, `req.tierConfig.windowSeconds`).
- Call active rate limiter engine.
- Inject standard response headers on ALL requests:
  - `X-RateLimit-Limit`: configured limit (e.g. 5, 20, 100).
  - `X-RateLimit-Remaining`: remaining quota in current window.
  - `X-RateLimit-Reset`: seconds until window reset.
  - `X-RateLimit-Algorithm`: active algorithm (`sliding-window` or `fixed-window`).
- On quota exceeded:
  - Inject `Retry-After: <resetSeconds>` header.
  - Send HTTP `429 Too Many Requests` with detailed JSON body.

### Task 4: Empirical Benchmark Script for Comparison Rule (`scripts/benchmark-comparison.js`)
- Construct an empirical harness that tests both engines under identical boundary burst traffic:
  - Send rapid requests right before a window boundary (T = 59s) and immediately after (T = 61s).
  - Show how Fixed Window allows up to 2x limit (boundary burst defect).
  - Show how Sliding Window throttles boundary bursts to maintain contracted fair use.
  - Collect numerical metrics: latency (ops/ms), throughput, burst leakage count.
  - Output a formatted comparison table ready for inclusion in the final report/README.

### Task 5: Phase 3 Verification Suite (`scripts/test-phase3.js`)
- Test Free Tier key: send 5 requests (all 200 OK), send 6th request (429 Too Many Requests).
- Verify `Retry-After` header is present and > 0.
- Verify per-key tenant isolation: Exhausting the Free key quota does NOT block the Developer key.
- Verify recovery: Wait or mock reset time to verify quota replenishment.

---

## Verification & Acceptance Criteria
- [ ] Free Tier key strictly throttled after 5 requests with HTTP 429.
- [ ] Developer Tier key throttled after 20 requests.
- [ ] `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers present.
- [ ] Comparison benchmark script executes and prints numerical evidence comparing Fixed Window vs Sliding Window.
- [ ] 100% test pass rate on `scripts/test-phase3.js`.
