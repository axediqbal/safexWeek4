/**
 * Phase 4 Automated Verification Suite
 * Validates API Versioning (v1 Deprecation, v2 Modern Envelope) & Swagger UI Docs
 */

const http = require('http');
const app = require('../src/app');
const { getActiveLimiter } = require('../src/services/rateLimiter');

let server;
const PORT = 3003; // isolated test port

function makeRequest(path, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed, rawBody: data });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: null, rawBody: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Phase 4 Versioning & Documentation Verification Suite...\n');
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

  const apiKey = 'devpulse_pro_demo_key';

  try {
    // -------------------------------------------------------------
    // Test Set 1: Legacy v1 Route Verification & Deprecation Headers
    // -------------------------------------------------------------
    console.log('🔹 Testing Legacy /api/v1 (Deprecation Lifecycle)...');
    const v1Res = await makeRequest('/api/v1/metrics/code-health', 'GET', { 'x-api-key': apiKey });
    assert(v1Res.status === 200, 'GET /api/v1/metrics/code-health returns 200 OK');
    assert(v1Res.headers['deprecation'] === 'true', "Header 'Deprecation: true' present on v1");
    assert(Boolean(v1Res.headers['sunset']), "Header 'Sunset' present with future decommission date");
    assert(v1Res.headers['link'].includes('successor-version'), "Header 'Link' points to successor version");
    assert(Boolean(v1Res.headers['warning']), "Header 'Warning: 299' present advising migration to /api/v2");
    assert(
      typeof v1Res.body.health_score === 'number' && v1Res.body.data === undefined,
      'v1 returns legacy flat response with snake_case fields (no data envelope)'
    );

    // -------------------------------------------------------------
    // Test Set 2: Modern v2 Route Verification (Clean Headers & Envelope)
    // -------------------------------------------------------------
    console.log('\n🔹 Testing Production /api/v2 (Modern Standards)...');
    const v2Res = await makeRequest('/api/v2/metrics/code-health', 'GET', { 'x-api-key': apiKey });
    assert(v2Res.status === 200, 'GET /api/v2/metrics/code-health returns 200 OK');
    assert(v2Res.headers['deprecation'] === undefined, "Header 'Deprecation' is ABSENT on v2 (clean production)");
    assert(v2Res.headers['sunset'] === undefined, "Header 'Sunset' is ABSENT on v2");
    assert(
      v2Res.body.status === 'success' && v2Res.body.version === 'v2' && typeof v2Res.body.data.healthScore === 'number',
      'v2 returns standardized envelope { status, version, data } with camelCase fields'
    );

    // -------------------------------------------------------------
    // Test Set 3: Breaking Change Verification on POST /analyze/repository
    // -------------------------------------------------------------
    console.log('\n🔹 Testing Breaking Changes in POST /analyze/repository...');
    const postPayload = { repo_url: 'https://github.com/devpulse/auth-core' };
    const v1Post = await makeRequest(
      '/api/v1/analyze/repository',
      'POST',
      { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
      postPayload
    );
    assert(
      v1Post.status === 201 && typeof v1Post.body.job_id === 'string' && v1Post.body.data === undefined,
      'POST v1 returns legacy flat format with job_id'
    );

    const v2Post = await makeRequest(
      '/api/v2/analyze/repository',
      'POST',
      { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
      postPayload
    );
    assert(
      v2Post.status === 201 && v2Post.body.version === 'v2' && typeof v2Post.body.data.jobId === 'string',
      'POST v2 returns enveloped structure with jobId and extended analysis metadata'
    );

    // -------------------------------------------------------------
    // Test Set 4: Interactive Swagger UI & Specification Endpoints
    // -------------------------------------------------------------
    console.log('\n🔹 Testing Swagger UI & Contract Endpoints...');
    const docsRes = await makeRequest('/docs/');
    assert(
      docsRes.status === 200 && docsRes.rawBody.includes('swagger-ui'),
      'GET /docs/ serves interactive Swagger UI HTML page'
    );

    const jsonRes = await makeRequest('/openapi.json');
    assert(
      jsonRes.status === 200 && jsonRes.body.openapi.startsWith('3.'),
      'GET /openapi.json serves valid OpenAPI 3 specification JSON'
    );

    const yamlRes = await makeRequest('/openapi.yaml');
    assert(
      yamlRes.status === 200 && yamlRes.rawBody.includes('openapi: 3.0.3'),
      'GET /openapi.yaml serves raw OpenAPI specification YAML'
    );

    const rootRes = await makeRequest('/');
    assert(
      rootRes.status === 200 && rootRes.rawBody.includes('DevPulse'),
      'Root GET / serves DevPulse Developer Portal (200 OK)'
    );

    console.log(`\n📊 Results: ${passed}/${total} tests passed.`);
    if (passed === total) {
      console.log('🎉 PHASE 4 VERIFICATION PASSED COMPLETELY!\n');
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
