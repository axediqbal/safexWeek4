/**
 * RFC 8594 API Deprecation and Sunset Middleware
 * Applied to legacy v1 endpoints to signal lifecycle decommissioning
 * DevPulse Labs - Public API Product
 */

function deprecationMiddleware(req, res, next) {
  // RFC 8594 Deprecation Header
  res.setHeader('Deprecation', 'true');

  // RFC 8594 Sunset Header (Decommission date: November 11, 2026)
  res.setHeader('Sunset', 'Wed, 11 Nov 2026 00:00:00 GMT');

  // RFC 8288 Web Linking header pointing to the successor version
  res.setHeader('Link', '</api/v2>; rel="successor-version"');

  // RFC 7234 Warning Header
  res.setHeader(
    'Warning',
    '299 - "API v1 is deprecated and scheduled for decommission on 2026-11-11. Please migrate to /api/v2."'
  );

  next();
}

module.exports = {
  deprecationMiddleware
};
