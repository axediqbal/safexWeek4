/**
 * In-Memory API Key Registry
 * Simulates customer account provisioning and tier association
 * DevPulse Labs - Public API Product
 */

const { TIERS } = require('../config/tiers');

// Seeded API Key Directory
const API_KEYS = new Map([
  [
    'devpulse_free_demo_key',
    {
      key: 'devpulse_free_demo_key',
      clientName: 'IndieDev Co',
      tier: 'free',
      tierConfig: TIERS.free,
      status: 'active',
      createdAt: '2026-09-01T00:00:00.000Z'
    }
  ],
  [
    'devpulse_pro_demo_key',
    {
      key: 'devpulse_pro_demo_key',
      clientName: 'SaaS Velocity Studio',
      tier: 'developer',
      tierConfig: TIERS.developer,
      status: 'active',
      createdAt: '2026-09-15T00:00:00.000Z'
    }
  ],
  [
    'devpulse_ent_demo_key',
    {
      key: 'devpulse_ent_demo_key',
      clientName: 'Global FinTech Cloud',
      tier: 'enterprise',
      tierConfig: TIERS.enterprise,
      status: 'active',
      createdAt: '2026-08-10T00:00:00.000Z'
    }
  ]
]);

/**
 * Find API key metadata
 * @param {string} keyString
 * @returns {object|null}
 */
function findApiKey(keyString) {
  if (!keyString || typeof keyString !== 'string') return null;
  const keyRecord = API_KEYS.get(keyString.trim());
  if (!keyRecord || keyRecord.status !== 'active') return null;
  return keyRecord;
}

/**
 * Register a new API key (e.g. for dynamic onboarding)
 * @param {string} key
 * @param {string} clientName
 * @param {'free'|'developer'|'enterprise'} tier
 */
function registerApiKey(key, clientName, tier = 'free') {
  const tierConfig = TIERS[tier] || TIERS.free;
  const record = {
    key,
    clientName,
    tier: tierConfig.id,
    tierConfig,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  API_KEYS.set(key, record);
  return record;
}

module.exports = {
  findApiKey,
  registerApiKey,
  API_KEYS
};
