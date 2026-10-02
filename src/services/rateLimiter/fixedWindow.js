/**
 * Approach A: Fixed Window Counter Rate Limiter
 * 
 * Divides time into fixed discrete windows (e.g. 60 seconds).
 * Resets counter when the current time crosses the epoch boundary.
 * 
 * VULNERABILITY: Prone to boundary burst (up to 2x limit at window edges).
 */

class FixedWindowRateLimiter {
  constructor() {
    // Map<apiKey, { count: number, windowStartMs: number }>
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
    const currentWindowStart = Math.floor(now / windowMs) * windowMs;

    let record = this.storage.get(key);

    if (!record || record.windowStartMs !== currentWindowStart) {
      // New window started
      record = {
        count: 0,
        windowStartMs: currentWindowStart
      };
      this.storage.set(key, record);
    }

    const resetSeconds = Math.max(1, Math.ceil((record.windowStartMs + windowMs - now) / 1000));

    if (record.count < limit) {
      record.count += 1;
      return {
        allowed: true,
        limit,
        remaining: limit - record.count,
        resetSeconds,
        currentCount: record.count,
        algorithm: 'fixed-window'
      };
    }

    // Limit exceeded
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetSeconds,
      currentCount: record.count,
      algorithm: 'fixed-window'
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

module.exports = FixedWindowRateLimiter;
