/**
 * Subscription Tiers and Fair-Use Quotas Configuration
 * DevPulse Labs - Public API Product
 */

const TIERS = {
  free: {
    id: 'free',
    name: 'Free Starter Tier',
    limit: 5, // 5 requests
    windowSeconds: 60, // per 60 seconds
    description: 'Designed for individual developers evaluating the DevPulse API.'
  },
  developer: {
    id: 'developer',
    name: 'Developer Pro Tier',
    limit: 20, // 20 requests
    windowSeconds: 60, // per 60 seconds
    description: 'Ideal for continuous integration pipelines and small engineering teams.'
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Scale Tier',
    limit: 100, // 100 requests
    windowSeconds: 60, // per 60 seconds
    description: 'High-throughput access for large engineering organizations with dedicated support.'
  }
};

module.exports = {
  TIERS,
  DEFAULT_TIER: 'free'
};
