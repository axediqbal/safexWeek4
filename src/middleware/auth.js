/**
 * API Key Authentication Middleware
 * DevPulse Labs - Public API Product
 */

const { findApiKey } = require('../data/apiKeys');

function apiKeyAuth(req, res, next) {
  // Extract key from header (primary) or query parameter (fallback)
  const headerKey = req.headers['x-api-key'];
  const queryKey = req.query.api_key || req.query.apiKey;
  const providedKey = headerKey || queryKey;

  if (!providedKey) {
    return res.status(401).json({
      status: 'error',
      code: 401,
      message: "Missing API key. Please supply a valid key via the 'x-api-key' header or 'api_key' query parameter.",
      tier: null,
      timestamp: new Date().toISOString()
    });
  }

  const keyRecord = findApiKey(providedKey);

  if (!keyRecord) {
    return res.status(401).json({
      status: 'error',
      code: 401,
      message: 'Invalid API key provided. The key is either unrecognized or deactivated.',
      tier: null,
      timestamp: new Date().toISOString()
    });
  }

  // Attach tenant context to request
  req.apiKey = keyRecord.key;
  req.clientName = keyRecord.clientName;
  req.tier = keyRecord.tier;
  req.tierConfig = keyRecord.tierConfig;
  req.apiKeyRecord = keyRecord;

  next();
}

module.exports = {
  apiKeyAuth
};
