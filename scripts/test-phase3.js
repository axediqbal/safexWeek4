/**
 * Phase 3 Automated Verification Suite
 * Tests Rate Limiting Quotas, RFC Headers, 429 Throttling & Per-Key Isolation
 */

const http = require('http');
const app = require('../src/app');
const { getActiveLimiter } = require('../src/services/rateLimiter');

let server;
const PORT = 3002; // isolated test port

function makeRequest(path, apiKey) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method: 'GET',
      headers: {
        'x-api-key': apiKey
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Phase 3 Rate Limiting Verification Suite...\n');
  server = app.listen(PORT);
  getActiveLimiter().reset();

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
    }
  }

  try {
    const freeKey = 'devpulse_free_demo_key'; // Limit: 5
    const proKey = 'devpulse_pro_demo_key';   // Limit: 20

    // 1. Send first 5 requests on Free Tier (all must succeed)
    console.log('🔹 Testing Free Tier Quota (Limit: 5 req/60s)...');
    let firstRes;
    for (let i = 1; i <= 5; i++) {
      const res = await makeRequest('/api/v2/metrics/code-health', freeKey);
      if (i === 1) firstRes = res;
      assert(res.status === 200, `Request ${i}/5 for Free Tier succeeded with 200 OK`);
    }

    // 2. Validate tracking headers on permitted requests
    assert(firstRes.headers['x-ratelimit-limit'] === '5', "Header 'X-RateLimit-Limit' is 5");
    assert(Number(firstRes.headers['x-ratelimit-remaining']) < 5, "Header 'X-RateLimit-Remaining' correctly decremented");
    assert(Number(firstRes.headers['x-ratelimit-reset']) > 0, "Header 'X-RateLimit-Reset' is positive integer");
    assert(Boolean(firstRes.headers['x-ratelimit-algorithm']), "Header 'X-RateLimit-Algorithm' reported");

    // 3. 6th request on Free Tier MUST be throttled with HTTP 429
    console.log('\n🔹 Testing Quota Depletion & HTTP 429 Throttling...');
    const throttledRes = await makeRequest('/api/v2/metrics/code-health', freeKey);
    assert(throttledRes.status === 429, '6th request received HTTP 429 Too Many Requests');
    assert(throttledRes.body.code === 429, 'Response body contains code 429');
    assert(throttledRes.body.tier === 'free', 'Response body identifies tier as free');
    assert(Boolean(throttledRes.headers['retry-after']), "Mandatory 'Retry-After' header present");
    assert(Number(throttledRes.headers['retry-after']) > 0, "'Retry-After' specifies positive wait seconds");

    // 4. Test Per-Key Tenant Isolation
    console.log('\n🔹 Testing Tenant Isolation (Free Key Depleted vs Developer Key Active)...');
    const proRes = await makeRequest('/api/v2/metrics/security-audit', proKey);
    assert(
      proRes.status === 200,
      'Developer Tier key succeeds with 200 OK despite Free Tier key quota exhaustion'
    );
    assert(proRes.headers['x-ratelimit-limit'] === '20', "Developer key limit header correctly shows 20");

    console.log(`\n📊 Results: ${passed}/${total} tests passed.`);
    if (passed === total) {
      console.log('🎉 PHASE 3 VERIFICATION PASSED COMPLETELY!\n');
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runTests();
