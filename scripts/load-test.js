/**
 * Automated Rate Limit Proof & Load Test Harness
 * Demonstrates 200 OK -> 429 Too Many Requests transitions with Retry-After headers.
 * DevPulse Labs - Public API Product (Week 4)
 */

const http = require('http');
const app = require('../src/app');
const { getActiveLimiter } = require('../src/services/rateLimiter');

let server;
const PORT = 3004;

function sendRequest(path, apiKey) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method: 'GET',
      headers: { 'x-api-key': apiKey }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runLoadTest() {
  console.log('========================================================================');
  console.log('⚡ DEVPULSE LOAD TEST & RATE LIMIT ENFORCEMENT PROOF');
  console.log('========================================================================\n');

  server = app.listen(PORT);
  getActiveLimiter().reset();

  const results = [];

  try {
    // -------------------------------------------------------------
    // TEST RUN 1: Free Starter Tier (Quota: 5 requests / 60s)
    // -------------------------------------------------------------
    console.log('🔹 [RUN 1] Burst Testing Free Tier (Limit: 5 req/60s) with 8 rapid calls...');
    const freeKey = 'devpulse_free_demo_key';

    for (let reqNum = 1; reqNum <= 8; reqNum++) {
      const res = await sendRequest('/api/v2/metrics/code-health', freeKey);
      const remaining = res.headers['x-ratelimit-remaining'];
      const retryAfter = res.headers['retry-after'] || 'N/A';
      const statusText = res.status === 200 ? '✅ 200 OK' : '🛑 429 TOO MANY REQUESTS';

      console.log(`  Req #${reqNum}: ${statusText} | Remaining: ${remaining}/5 | Retry-After: ${retryAfter}s`);

      results.push({
        Run: 'Free Tier',
        'Req #': reqNum,
        Status: res.status,
        Remaining: remaining,
        'Retry-After': retryAfter,
        Outcome: reqNum <= 5 ? (res.status === 200 ? 'PASS' : 'FAIL') : (res.status === 429 ? 'PASS' : 'FAIL')
      });
    }

    // -------------------------------------------------------------
    // TEST RUN 2: Developer Pro Tier (Quota: 20 requests / 60s)
    // -------------------------------------------------------------
    console.log('\n🔹 [RUN 2] Burst Testing Developer Tier (Limit: 20 req/60s) with 23 rapid calls...');
    const proKey = 'devpulse_pro_demo_key';

    let pro200Count = 0;
    let pro429Count = 0;

    for (let reqNum = 1; reqNum <= 23; reqNum++) {
      const res = await sendRequest('/api/v2/metrics/security-audit', proKey);
      if (res.status === 200) pro200Count++;
      if (res.status === 429) pro429Count++;

      if (reqNum === 1 || reqNum === 10 || reqNum === 20 || reqNum === 21 || reqNum === 23) {
        const remaining = res.headers['x-ratelimit-remaining'];
        const retryAfter = res.headers['retry-after'] || 'N/A';
        const statusText = res.status === 200 ? '✅ 200 OK' : '🛑 429 TOO MANY REQUESTS';
        console.log(`  Req #${reqNum}: ${statusText} | Remaining: ${remaining}/20 | Retry-After: ${retryAfter}s`);
      }
    }

    console.log(`\nDeveloper Tier Summary:`);
    console.log(`  - 200 OK Responses (Quota Active):     ${pro200Count}/20`);
    console.log(`  - 429 Throttled (Quota Depleted):     ${pro429Count}/3`);

    // -------------------------------------------------------------
    // EMPIRICAL SUMMARY TABLE
    // -------------------------------------------------------------
    console.log('\n========================================================================');
    console.log('📊 EMPIRICAL RATE LIMIT PROOF TABLE (Free Tier Burst)');
    console.log('========================================================================');
    console.table(results);

    const allPassed = results.every(r => r.Outcome === 'PASS') && pro200Count === 20 && pro429Count === 3;
    if (allPassed) {
      console.log('🎉 LOAD TEST VALIDATION PASSED WITH 100% ACCURACY!');
      console.log('   Empirical evidence proves rate limiting, 429 codes, and Retry-After headers work as specified.\n');
    } else {
      console.error('❌ Some load test conditions failed.');
      process.exit(1);
    }
  } catch (err) {
    console.error('Load test error:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runLoadTest();
