/**
 * Rate Limiter Engine Factory
 * DevPulse Labs - Public API Product
 */

const FixedWindowRateLimiter = require('./fixedWindow');
const SlidingWindowRateLimiter = require('./slidingWindow');

const fixedEngine = new FixedWindowRateLimiter();
const slidingEngine = new SlidingWindowRateLimiter();

let activeEngineType = process.env.RATE_LIMITER_ENGINE === 'fixed' ? 'fixed' : 'sliding';

function getActiveLimiter() {
  return activeEngineType === 'fixed' ? fixedEngine : slidingEngine;
}

function setActiveEngineType(type) {
  if (type === 'fixed' || type === 'sliding') {
    activeEngineType = type;
  }
}

function getActiveEngineType() {
  return activeEngineType;
}

module.exports = {
  fixedEngine,
  slidingEngine,
  getActiveLimiter,
  setActiveEngineType,
  getActiveEngineType,
  FixedWindowRateLimiter,
  SlidingWindowRateLimiter
};
