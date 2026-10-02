/**
 * Phase 2 Automated Verification Script
 * Validates Express Server Core, Auth Middleware & All 5 Endpoints
 */

const http = require('http');
const app = require('../src/app');

let server;
const PORT = 3001; // isolated testing port

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
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

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Phase 2 Verification Suite...\n');
  server = app.listen(PORT);

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
    // Test 1: Public Health Check
    const health = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/health',
      method: 'GET'
    });
    assert(health.status === 200 && health.body.status === 'healthy', 'Health check returns 200 OK without API key');

    // Test 2: Unauthenticated Request Blocked
    const noKey = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v2/metrics/code-health',
      method: 'GET'
    });
    assert(noKey.status === 401 && noKey.body.code === 401, 'Request without API key is blocked with 401 Unauthorized');

    // Test 3: Invalid API Key Blocked
    const badKey = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v2/metrics/code-health',
      method: 'GET',
      headers: { 'x-api-key': 'fake_malformed_key' }
    });
    assert(badKey.status === 401 && badKey.body.message.includes('Invalid API key'), 'Invalid API key rejected with 401');

    // Test 4: Free Key Authenticated (Endpoint 1: Code Health)
    const codeHealth = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v2/metrics/code-health',
      method: 'GET',
      headers: { 'x-api-key': 'devpulse_free_demo_key' }
    });
    assert(
      codeHealth.status === 200 && codeHealth.body.data.healthScore >= 0,
      'Endpoint 1 (Code Health) returns 200 with valid Free Tier key'
    );

    // Test 5: Pro Key Authenticated (Endpoint 2: Security Audit)
    const secAudit = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v2/metrics/security-audit?severity_min=medium',
      method: 'GET',
      headers: { 'x-api-key': 'devpulse_pro_demo_key' }
    });
    assert(
      secAudit.status === 200 && secAudit.body.data.auditStatus === 'CLEAN_PASS',
      'Endpoint 2 (Security Audit) returns 200 with Developer Tier key'
    );

    // Test 6: Enterprise Key Authenticated (Endpoint 3: Tech Debt)
    const techDebt = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v2/metrics/tech-debt',
      method: 'GET',
      headers: { 'x-api-key': 'devpulse_ent_demo_key' }
    });
    assert(
      techDebt.status === 200 && typeof techDebt.body.data.estimatedRemediationHours === 'number',
      'Endpoint 3 (Tech Debt) returns 200 with Enterprise Tier key'
    );

    // Test 7: Endpoint 4 (Build Benchmarks)
    const buildBench = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v2/metrics/build-benchmarks',
      method: 'GET',
      headers: { 'x-api-key': 'devpulse_pro_demo_key' }
    });
    assert(
      buildBench.status === 200 && buildBench.body.data.pipelineStatus === 'PASSED',
      'Endpoint 4 (Build Benchmarks) returns 200 with Developer Tier key'
    );

    // Test 8: Endpoint 5 (Analyze Repo) - 400 Validation on empty body
    const badAnalyze = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/v2/analyze/repository',
        method: 'POST',
        headers: {
          'x-api-key': 'devpulse_pro_demo_key',
          'Content-Type': 'application/json'
        }
      },
      {}
    );
    assert(badAnalyze.status === 400 && badAnalyze.body.code === 400, 'Endpoint 5 returns 400 when required repo_url is missing');

    // Test 9: Endpoint 5 (Analyze Repo) - 201 Created on valid body
    const goodAnalyze = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/v2/analyze/repository',
        method: 'POST',
        headers: {
          'x-api-key': 'devpulse_pro_demo_key',
          'Content-Type': 'application/json'
        }
      },
      {
        repo_url: 'https://github.com/devpulse/microservice-auth',
        branch: 'main',
        language: 'typescript'
      }
    );
    assert(
      goodAnalyze.status === 201 && goodAnalyze.body.data.status === 'COMPLETED',
      'Endpoint 5 returns 201 and analysis job summary on valid payload'
    );

    console.log(`\n📊 Results: ${passed}/${total} tests passed.`);
    if (passed === total) {
      console.log('🎉 PHASE 2 VERIFICATION PASSED COMPLETELY!\n');
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
