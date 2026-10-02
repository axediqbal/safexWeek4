# Phase 5 Plan: Client Script, Load Testing & Portfolio Documentation

**Phase:** 5 of 5  
**Deliverables:** 20-line Client Script, Load Test Script, Master Test Runner, Portfolio-Grade `README.md` with Changelog, Mandatory Video Walkthrough Guide  
**Status:** READY TO EXECUTE

---

## Objective
Finalize the project deliverable package according to the Week 4 assignment criteria:
1. Provide a concise 20-line standalone client script (`scripts/client.js`).
2. Provide a load test (`scripts/load-test.js`) empirically proving HTTP 429 and `Retry-After` rate limit enforcement.
3. Document problems found and fixed during validation.
4. Author a portfolio-grade, professional `README.md` containing business context, architecture diagrams, benchmark numbers, trade-off justification, limitations, and changelog.
5. Provide a comprehensive 5-10 minute screen-recording video walkthrough script (`VIDEO_WALKTHROUGH_SCRIPT.md`) to guide the mandatory submission.

---

## Architecture & Deliverables Layout
```
scripts/
├── client.js                   # 20-line standalone client script (Instruction Step 7)
├── load-test.js                # Empirical rate limit burst verification script
└── run-all-tests.js            # Unified master test orchestrator
README.md                       # Comprehensive portfolio report & documentation
VIDEO_WALKTHROUGH_SCRIPT.md     # 5-10 min video presentation script with timestamps
```

---

## Execution Tasks

### Task 1: Standalone 20-Line Client Script (`scripts/client.js`)
- Author a clean, 20-line standalone Node.js client script using standard HTTP/HTTPS.
- Authenticates using `x-api-key`.
- Requests `/api/v2/metrics/code-health`.
- Prints health score and rate limit remaining header.
- Captures and displays HTTP 429 with `Retry-After` if throttled.

### Task 2: Automated Load Test Script (`scripts/load-test.js`)
- Simulates rapid bursts of traffic against Free Tier (limit: 5) and Developer Tier (limit: 20).
- Emits real-time visual progress showing transitions:
  - Requests 1 to 5: `HTTP 200 OK` (Remaining decrements 4 -> 3 -> 2 -> 1 -> 0).
  - Request 6 onwards: `HTTP 429 Too Many Requests` (Captures `Retry-After: <seconds>`).
- Calculates pass rate and outputs execution summary table.

### Task 3: Unified Master Verification Runner (`scripts/run-all-tests.js`)
- Chains all test scripts in sequence:
  1. `validate-spec.js` (OpenAPI schema integrity)
  2. `test-phase2.js` (Server core, auth, 5 endpoints)
  3. `test-phase3.js` (Rate limiting quotas & isolation)
  4. `test-phase4.js` (v1 deprecation & v2 breaking changes)
  5. `benchmark-comparison.js` (Special constraint benchmark)
  6. `load-test.js` (Burst load test)
  7. `client.js` (Standalone client script)
- Outputs a single green scorecard confirming 100% project readiness.

### Task 4: Comprehensive Portfolio `README.md` & Report
- Detailed sections fulfilling all instructions:
  1. **Executive Summary & Scope Statement:** Independent Software House (*DevPulse Labs*) data service.
  2. **Step 1 Reflection:** Week 3 retrospective (3 strengths, 2 gaps, target new skill).
  3. **Step 2 Action Plan:** 5-line plan with measurable success target achieved.
  4. **Architecture & Tech Stack:** Express, OpenAPI 3, rate limiters, middleware pipeline.
  5. **API Reference & 5 Endpoints:** Parameters, sample requests/responses.
  6. **Special Constraint Comparison Matrix:** Fixed Window vs Sliding Window benchmark numbers, burst leakage analysis, latency, and justification.
  7. **Step 8 Validation & Quality:** Problems found and fixed documented with numbers.
  8. **Limitations & Future Improvements:** At least 1 architectural limitation and 1 planned improvement.
  9. **Changelog:** Progressive log of what was built and refined.
  10. **Quick Start Guide:** Setup, running the server, running tests, accessing `/docs`.

### Task 5: Mandatory Video Walkthrough Script (`VIDEO_WALKTHROUGH_SCRIPT.md`)
- Complete narration guide for the mandatory 5-10 minute screen-recording video submission:
  - Timestamp breakdown (0:00 to 10:00).
  - What to show on screen at each minute.
  - Exactly what to say in clear English / Urdu.
  - Explanations of OpenAPI, Swagger UI, Rate limiting algorithms, Deprecation headers, and problems solved.

---

## Verification Criteria
- [ ] `scripts/client.js` executes and terminates in ~20 lines cleanly.
- [ ] `scripts/load-test.js` provides empirical terminal output demonstrating 200 -> 429 transition with `Retry-After`.
- [ ] `scripts/run-all-tests.js` passes all tests with zero failures.
- [ ] `README.md` contains complete required reporting sections, benchmark tables, and changelog.
- [ ] `VIDEO_WALKTHROUGH_SCRIPT.md` provides a ready-to-record presentation outline.
