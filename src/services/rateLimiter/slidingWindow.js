/**
 * Approach B: Sliding Window Counter (Weighted Rolling Approximation)
 * 
 * Smooths traffic across window boundaries by weighting the previous window's
 * activity against elapsed time in the current window.
 * 
 * FORMULA:
 * Estimated = CurrentCount + PreviousCount * (1 - (TimeIntoCurrentWindow / WindowDuration))
 * 
 * ADVANTAGE: Eliminates boundary burst without the O(N) memory overhead of Sliding Log.
 */

class SlidingWindowRateLimiter {
  constructor() {
    // Map<apiKey, { currentCount: number, previousCount: number, currentWindowStartMs: number }>
    this.storage = new Map();
  }

  /**
   * Check and consume rate limit for a key
   * @param {string} key - API Key identifier
   * @param {number} limit - Maximum allowed requests in window
   * @param {number} windowSeconds - Duration of window in seconds
   * @param {number} [customNow] - Optional timestamp for testing
   * @returns {{ allowed: boolean, limit: number, remaining: number, resetSeconds: number, algorithm: string }}
   */
  consume(key, limit, windowSeconds = 60, customNow = null) {
    const now = customNow || Date.now();
    const windowMs = windowSeconds * 1000;
    const alignedWindowStart = Math.floor(now / windowMs) * windowMs;

    let record = this.storage.get(key);

    if (!record) {
      record = {
        currentCount: 0,
        previousCount: 0,
        currentWindowStartMs: alignedWindowStart
      };
      this.storage.set(key, record);
    } else if (alignedWindowStart > record.currentWindowStartMs) {
      // Time has moved forward
      const elapsedWindows = Math.floor((alignedWindowStart - record.currentWindowStartMs) / windowMs);

      if (elapsedWindows === 1) {
        // Shift current window to previous
        record.previousCount = record.currentCount;
        record.currentCount = 0;
        record.currentWindowStartMs = alignedWindowStart;
      } else {
        // More than 1 full window elapsed; both counters reset
        record.previousCount = 0;
        record.currentCount = 0;
        record.currentWindowStartMs = alignedWindowStart;
      }
    }

    // Weight of previous window decreases as time advances in current window
    const timeIntoCurrentWindow = now - record.currentWindowStartMs;
    const weight = Math.max(0, 1 - (timeIntoCurrentWindow / windowMs));
    const estimatedCount = record.currentCount + (record.previousCount * weight);

    const resetSeconds = Math.max(1, Math.ceil((record.currentWindowStartMs + windowMs - now) / 1000));

    if (estimatedCount < limit) {
      record.currentCount += 1;
      const newEstimated = Math.ceil(estimatedCount + 1);
      return {
        allowed: true,
        limit,
        remaining: Math.max(0, limit - newEstimated),
        resetSeconds,
        estimatedCount: Number(estimatedCount.toFixed(2)),
        algorithm: 'sliding-window'
      };
    }

    // Limit exceeded
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetSeconds,
      estimatedCount: Number(estimatedCount.toFixed(2)),
      algorithm: 'sliding-window'
    };
  }

  reset(key = null) {
    if (key) {
      this.storage.delete(key);
    } else {
      this.storage.clear();
    }
  }
}

module.exports = SlidingWindowRateLimiter;
