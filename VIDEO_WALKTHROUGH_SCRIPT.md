# Video Walkthrough Script & Speaking Guide (5–10 Minutes)

**Project:** DevPulse Public API Product: Keys, Rate Limits, Versioning & OpenAPI Documentation  
**Track:** Week 4 — Specialist Advanced Build (SDC Internship)  
**Presenter:** Ahmed (Member 6 — Individual Contributor)  
**Tone:** Professional, clear, confident, and evidence-driven  

---

## Video Recording Checklist Before You Click "Record"
- [ ] Open **VS Code** with the `week 4` folder open.
- [ ] Open **Browser** at `http://localhost:3000/docs` (Swagger UI).
- [ ] Open **Terminal (PowerShell)** in VS Code.
- [ ] Have this script open on your phone or second screen.
- [ ] Webcam on (optional, but highly recommended for extra credibility).

---

## Detailed Minute-by-Minute Speaking Guide

### ⏱️ Section 1: Introduction & Business Context (0:00 – 1:15)
**Screen to Show:** VS Code with [README.md](file:///c:/Users/Dell/Desktop/ahmed/AHMED%20INTERNSHIP%20SAFEX/week%204/README.md) open.

**What to Say (English/Urdu mix):**
> *"Hello everyone and respected evaluators. My name is Ahmed, and I am Member 6 in the Web Development track of the SDC Internship. Today I am presenting my Week 4 Specialist Advanced Build deliverable: **DevPulse Public API Product**.*
> 
> *Moving beyond Week 3's frontend e-commerce storefront, Week 4 required a completely different problem and skill set: **Backend API engineering, contract-first design using OpenAPI 3.0, Express.js middleware architecture, multi-tenant rate limiting, and RFC-compliant versioning**.*
> 
> *The scenario for this assignment is an Independent Software House called **DevPulse Labs**, which provides developer tools and code intelligence metrics. My role was to package their internal analytics engine into a commercial public API product with tiered API keys, fair-use rate limits, and interactive documentation."*

---

### ⏱️ Section 2: OpenAPI 3.0 Contract & Live Swagger UI Demo (1:15 – 3:00)
**Screen to Show:** Show [openapi.yaml](file:///c:/Users/Dell/Desktop/ahmed/AHMED%20INTERNSHIP%20SAFEX/week%204/openapi.yaml) in VS Code, then switch to the Browser showing `http://localhost:3000/docs`.

**What to Say:**
> *"Following professional standards, I followed a **contract-first approach**. Before writing a single line of backend route logic, I authored a comprehensive OpenAPI 3.0 specification in `openapi.yaml`.*
> 
> *(Switch to browser)*
> *Here in the browser, you can see the generated interactive Swagger UI documentation hosted live at `/docs`. It documents the five core endpoints of DevPulse:*
> 1. `GET /metrics/code-health` — *returns maintainability grade and lint scores.*
> 2. `GET /metrics/security-audit` — *returns vulnerability scans and CVE breakdowns.*
> 3. `GET /metrics/tech-debt` — *calculates technical debt ratio and remediation hours.*
> 4. `GET /metrics/build-benchmarks` — *tracks CI/CD pipeline timings and bundle size.*
> 5. `POST /analyze/repository` — *dispatches on-demand static code reviews.*
> 
> *(Click the green 'Authorize' button in Swagger UI)*
> *The API requires authentication. I'll enter our Developer Tier key: `devpulse_pro_demo_key` and click Authorize. Now, let's test `GET /metrics/code-health`. I click 'Try it out' and 'Execute'.*
> 
> *(Scroll down to Response)*
> *As you can see, we immediately get an HTTP 200 OK with the standardized response envelope, and in the response headers, we see our rate tracking headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset`."*

---

### ⏱️ Section 3: Architecture & Tiered API Key Authentication (3:00 – 4:30)
**Screen to Show:** Show `src/middleware/auth.js` and `src/config/tiers.js` in VS Code.

**What to Say:**
> *"Now let's examine the code architecture. In `src/config/tiers.js`, I defined three distinct monetization tiers:*
> - **Free Starter Tier:** *5 requests per 60 seconds.*
> - **Developer Pro Tier:** *20 requests per 60 seconds.*
> - **Enterprise Scale Tier:** *100 requests per 60 seconds.*
> 
> *In `src/middleware/auth.js`, the authentication gate extracts the key from the `x-api-key` header or query parameter. If a key is missing or invalid, it immediately rejects the request with an HTTP 401 Unauthorized status and a structured JSON error body. If valid, it attaches the client tenant and tier quota configuration to the request object for downstream middleware."*

---

### ⏱️ Section 4: Special Constraint — Comparison Rule & Benchmark Proof (4:30 – 6:45)
**Screen to Show:** Switch to VS Code terminal and show `scripts/benchmark-comparison.js`.

**What to Say:**
> *"One of the most critical aspects of Week 4 is the **Special Constraint: Comparison Rule**, where we must implement or analyze two alternative approaches to the hardest part of the task and justify our choice with evidence.*
> 
> *The hardest challenge in a multi-tenant public API is **Rate Limiting**. I implemented and benchmarked two distinct algorithms:*
> 1. **Approach A: Fixed Window Counter** (`src/services/rateLimiter/fixedWindow.js`)
> 2. **Approach B: Sliding Window Counter** (`src/services/rateLimiter/slidingWindow.js`)
> 
> *Let's run the empirical benchmark script in the terminal:*
> `npm run test:benchmark`
> 
> *(Point at the terminal output and table)*
> *Look closely at this empirical matrix:*
> - *Under **Fixed Window**, a client sends 20 requests at the 59th second of window 1, and another 20 requests at the 61st second of window 2. Because the window boundary resets between them, the Fixed Window allows **40 requests in just 2 seconds** — a 200% burst leakage that violates fair use and can crash backend databases!*
> - *Under **Sliding Window**, the algorithm calculates a weighted rolling average. At the 61st second, it detects the prior burst and immediately blocks 19 out of the 20 requests, capping the throughput to contracted limits.*
> 
> *Both algorithms exhibit sub-microsecond latency—around 380 nanoseconds versus 550 nanoseconds—and both have O(1) memory complexity. Therefore, I justified and selected the **Sliding Window Counter** as DevPulse's production rate limiter."*

---

### ⏱️ Section 5: API Versioning — v1 Deprecation & v2 Breaking Overhaul (6:45 – 8:00)
**Screen to Show:** Show `src/middleware/deprecation.js` and `scripts/test-phase4.js`.

**What to Say:**
> *"Next is API Versioning. To demonstrate real-world API lifecycle management, both `/api/v1` and `/api/v2` run simultaneously in our Express app:*
> - *In **`/api/v1`**, the endpoints are deprecated. I implemented `src/middleware/deprecation.js` which injects RFC 8594 standard headers: `Deprecation: true`, `Sunset: Wed, 11 Nov 2026`, and `Link: </api/v2>; rel="successor-version"`.*
> - *In **`/api/v2`**, I introduced an intentional breaking change: whereas v1 returns flat un-enveloped JSON with `snake_case` properties, v2 returns a standardized envelope `{ status: 'success', version: 'v2', data: { ... } }` with `camelCase` field normalization and enriched enterprise metrics."*

---

### ⏱️ Section 6: Client Script, Load Test & Problems Solved (8:00 – 9:30)
**Screen to Show:** Run `node scripts/load-test.js` and `node scripts/client.js`.

**What to Say:**
> *"Now let's prove the rate limits in action using our automated load test:*
> `npm run test:ratelimit`
> 
> *(Point to terminal output)*
> *Notice what happens here: requests 1 through 5 on our Free Tier succeed with `200 OK`, and the remaining counter decrements from 4 down to 0. On request 6, the system immediately throttles with **HTTP 429 Too Many Requests** and returns a `Retry-After: 4s` header.*
> 
> *We also wrote a clean, 20-line standalone consumer script in `scripts/client.js`:*
> `node scripts/client.js`
> *(Show output)*
> *It consumes the API, prints the health score and the active rate limit quota.*
> 
> *Finally, regarding **Step 8 (Problems Found & Fixed)**:*
> *During benchmark construction, I found that an unaligned reference epoch caused T59 and T61 to land in the same window. I resolved this by introducing mathematically aligned window boundaries (`Math.floor(now / windowMs) * windowMs`), successfully exposing the 2x burst vulnerability in Fixed Window.*
> 
> *As a future improvement, while in-memory state is extremely fast (> 1.8M ops/sec), for multi-server clusters I would migrate the sliding window state to a distributed Redis Token Bucket using atomic Lua scripts."*

---

### ⏱️ Section 7: Conclusion & Master Verification (9:30 – 10:00)
**Screen to Show:** Run `node scripts/run-all-tests.js`.

**What to Say:**
> *"To conclude, I will run our master test runner:*
> `node scripts/run-all-tests.js`
> 
> *(Show all 6 green test passes)*
> *All 6 test suites—OpenAPI validation, Core Auth, Rate Limiting, Versioning, Special Constraint Benchmark, and Burst Load Testing—pass with a 100% success rate.*
> 
> *All deliverables, documentation, test proofs, and repository links have been organized professionally. Thank you very much for your time and evaluation!"*

---

## 💡 Quick Tips for High Marks
1. Speak clearly at a moderate pace.
2. Don't rush; let the evaluator see the terminal outputs and the Swagger UI screen.
3. Emphasize the **Special Constraint** comparison table—evaluators specifically look for candidate evidence and justification!
