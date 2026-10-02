/**
 * Tiered Rate Limiting Middleware
 * Injects RFC-compliant rate limiting and Retry-After headers.
 * DevPulse Labs - Public API Product
 */

const { getActiveLimiter } = require('../services/rateLimiter');

function rateLimiterMiddleware(req, res, next) {
  // If request has no resolved API key or tier, skip (let auth middleware handle 401)
  if (!req.apiKey || !req.tierConfig) {
    return next();
  }

  const { limit, windowSeconds } = req.tierConfig;
  const limiter = getActiveLimiter();
  const result = limiter.consume(req.apiKey, limit, windowSeconds);

  // Set standard RFC tracking headers on all requests
  res.setHeader('X-RateLimit-Limit', result.limit);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  res.setHeader('X-RateLimit-Reset', result.resetSeconds);
  res.setHeader('X-RateLimit-Algorithm', result.algorithm);

  if (!result.allowed) {
    // Inject mandatory Retry-After header
    res.setHeader('Retry-After', result.resetSeconds);

    return res.status(429).json({
      status: 'error',
      code: 429,
      message: `Rate limit exceeded. Tier quota of ${result.limit} requests per ${windowSeconds} seconds reached.`,
      tier: req.tier,
      retryAfterSeconds: result.resetSeconds,
      algorithm: result.algorithm,
      timestamp: new Date().toISOString()
    });
  }

  next();
}

module.exports = {
  rateLimiterMiddleware
};
