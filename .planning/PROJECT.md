# PROJECT: DevPulse Public API Product

**Independent Software House Data Service: Developer Tools & Code Intelligence API**  
**Course/Internship:** Week 4 — Specialist Advanced Build (Web Development Track)  
**Role:** Member 6 — Individual Contributor  
**Primary Tools:** Express.js + OpenAPI 3.0 (Swagger UI)

---

## 1. Scope Statement & Business Context
**Organization:** *DevPulse Labs* — an independent software engineering house specializing in developer tooling, static analysis, and code quality audits.  
**Objective:** Transform DevPulse's internal code intelligence analytics engine into a commercial, self-service **Public API Product**. External engineering teams and CI/CD pipelines can consume these services to monitor code health, audit security vulnerabilities, calculate technical debt, benchmark build performance, and measure test coverage.

### Key Value Propositions
- **Tiered Monetization & Access:** Protect backend resources with tiered API keys (Free, Developer, Enterprise) enforced via per-key usage quotas.
- **Resilience & Rate Control:** Guaranteed fair-use rate limiting with standard HTTP `429 Too Many Requests` and `Retry-After` headers.
- **Contract-First Reliability:** Complete OpenAPI 3.0 specification offering interactive Swagger UI documentation and exact schema contracts.
- **Smooth Evolution:** Side-by-side support for `v1` (with deprecation notices) and `v2` (with modern breaking schema enhancements).

---

## 2. Week 3 Reflection & Week 4 Skill Target (Step 1 Requirement)
- **3 Things Done Well in Week 3 (E-Commerce Storefront):**
  1. Built clean, reactive shopping cart state management with persistent storage.
  2. Implemented responsive multi-step checkout flow with robust client-side form validation.
  3. Delivered high-fidelity UI aesthetics with modern design tokens and animations.
- **2 Gaps Identified from Week 3:**
  1. Lack of contract-first API design: Frontend relied heavily on mocked ad-hoc JSON without standardized schema validation.
  2. No automated rate-limiting or API key enforcement: Endpoints were open without quota safeguards.
- **New Skill Practiced in Week 4:**
  - **Specialist Backend API Product Engineering:** Schema-first API design using OpenAPI 3.0, Express middleware pipelines for tiered API key authentication, algorithmic rate limiting, and RFC-compliant HTTP versioning/deprecation headers.

---

## 3. 5-Line Action Plan & Measurable Success Target (Step 2 Requirement)
1. **Design:** Define OpenAPI 3.0 specification for 5 code-intelligence endpoints before writing any backend route handlers.
2. **Core Auth & Tiers:** Implement Express server with API key middleware supporting 3 tiers (Free: 5 req/min, Developer: 20 req/min, Enterprise: 100 req/min).
3. **Dual Limiter & Special Constraint:** Implement and benchmark two rate-limiting algorithms (Fixed Window Counter vs Sliding Window Counter) to satisfy the Comparison Rule.
4. **Versioning & Docs:** Expose `/api/v1` (with `Deprecation: true` & `Sunset` headers) alongside `/api/v2` (breaking schema overhaul), served with live interactive Swagger UI at `/docs`.
5. **Validation:** Build an automated test suite and load-test script that hammers the API to prove `429 Too Many Requests` and `Retry-After` trigger accurately.
- **Measurable Success Target:**  
  *Automated load test hitting the Developer tier (20 req/min limit) must return exactly 20 HTTP 200 OK responses followed by consistent HTTP 429 Too Many Requests with valid integer `Retry-After` headers and zero server crashes (100% test pass rate).*

---

## 4. Special Constraint: Comparison Rule Focus
- **Topic:** Rate Limiting Architecture for Multi-Tenant Public APIs
- **Approach A:** In-Memory Fixed Window Counter (Simple, low memory, but susceptible to boundary burst traffic).
- **Approach B:** In-Memory Sliding Window Log / Counter (Accurate burst prevention, rolling window calculations).
- **Deliverable:** Both approaches implemented/analyzed with empirical benchmarks, response header accuracy comparison, and documented justification for the final production choice.

---

## 5. Technology Stack
- **Runtime:** Node.js (v18+)
- **Server Framework:** Express.js
- **API Specification:** OpenAPI 3.0 (YAML/JSON)
- **Documentation Renderer:** `swagger-ui-express`
- **Testing & Benchmarking:** Custom automated verification script + load-test harness using native Node.js / `node-fetch` / `axios`
- **Environment:** Windows PowerShell
