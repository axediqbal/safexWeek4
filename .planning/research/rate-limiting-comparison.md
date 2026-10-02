# Research & Architectural Trade-offs: Rate Limiting Algorithms

**Author:** Member 6 (Individual Contributor)  
**Project:** DevPulse Public API Product (Week 4 Specialist Advanced Build)  
**Topic:** Special Constraint — Fixed Window Counter vs Sliding Window Log/Counter

---

## 1. Problem Statement
Public APIs monetized on tiered subscriptions require strict rate limiting to:
1. Prevent denial-of-service and fair usage violations across multi-tenant clients.
2. Accurately bill and throttle clients based on contracted quotas (e.g. Free: 5 req/min, Developer: 20 req/min).
3. Return standards-compliant status codes (`429 Too Many Requests`) with clear replenishment signals (`Retry-After`).

In distributed systems, Redis is often utilized, but in standalone Node.js microservices, the choice of in-memory rate-limiting algorithm heavily dictates accuracy, latency, and burst tolerance.

---

## 2. Approach A: Fixed Window Counter

### Mechanism
- Time is divided into discrete, static windows (e.g. `[12:00:00 - 12:01:00]`, `[12:01:00 - 12:02:00]`).
- Each API key maintains a counter for the current epoch block: `windowKey = Math.floor(now / windowSize)`.
- When a request arrives:
  - If `counter < limit`, increment and allow.
  - If `counter >= limit`, reject with HTTP 429.
  - Reset counter when `Math.floor(now / windowSize)` transitions.

### Advantages
- **O(1) Constant Time Complexity:** Negligible CPU overhead.
- **O(1) Space Complexity:** Stores only one integer and one timestamp per API key.
- Trivial to implement without complex state structures.

### Critical Vulnerability: The Boundary Burst Problem (2x Traffic Spike)
- If a client with a limit of 20 req/min sends 20 requests at `12:00:59` (end of window 1), and then another 20 requests at `12:01:01` (start of window 2), the counter resets between the requests.
- **Result:** The client successfully pushes 40 requests in a 2-second span — effectively doubling the intended capacity limit and potentially overloading downstream databases.

---

## 3. Approach B: Sliding Window Counter (Hybrid Approximated Rolling Window)

### Mechanism
- Rather than a rigid boundary reset, the Sliding Window Counter calculates request volume by weighting the previous window's count against the elapsed time in the current window:
  $$\text{Estimated Requests} = \text{Count}_{\text{current}} + \text{Count}_{\text{previous}} \times \left(1 - \frac{\text{elapsedTime}}{\text{windowSize}}\right)$$
- If $\text{Estimated Requests} < \text{limit}$, allow and increment current window counter.
- If $\text{Estimated Requests} \ge \text{limit}$, reject with HTTP 429.

### Advantages
- **Smooth Throttling:** Eliminates the boundary burst exploit; bursts across boundaries are naturally dampened by the weighted decay.
- **Memory Efficient:** Unlike a raw Sliding Window Log (which stores every individual request timestamp and consumes $O(N)$ space), the Sliding Window Counter only stores two numbers per key (previous count and current count).
- Highly accurate approximation (typically < 0.05% error rate).

### Disadvantages
- Slightly more math computations per request (fractional weighting), though still effectively $O(1)$.
- Approximation assumes uniform request distribution in the prior window.

---

## 4. Empirical Evaluation Plan
In Phase 3 and Phase 5, we will implement both engines in Express middleware with a runtime toggle (`RATE_LIMITER_ENGINE=fixed|sliding`). We will execute a dedicated load test that sends burst traffic concentrated at window boundaries to quantitatively prove:
1. Fixed Window permits up to $2 \times \text{limit}$ during boundary transitions.
2. Sliding Window strictly caps traffic to the contracted limit across any rolling 60-second window.
