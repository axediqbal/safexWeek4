/**
 * Master Test Orchestrator
 * Executes all validation suites, benchmarks, and load tests.
 * DevPulse Labs - Public API Product
 */

const { execSync } = require('child_process');
const path = require('path');

const rootDir = path.join(__dirname, '..');

const testSuites = [
  { name: '1. OpenAPI 3.0 Specification Integrity', cmd: 'node scripts/validate-spec.js' },
  { name: '2. Express Server Core, Auth & 5 Endpoints', cmd: 'node scripts/test-phase2.js' },
  { name: '3. Rate Limiting Quotas & Tenant Isolation', cmd: 'node scripts/test-phase3.js' },
  { name: '4. Versioning Lifecycle (v1 Deprecation, v2 Breaking & Swagger UI)', cmd: 'node scripts/test-phase4.js' },
  { name: '5. Special Constraint: Rate Limiting Benchmark & Trade-off Matrix', cmd: 'node scripts/benchmark-comparison.js' },
  { name: '6. Automated Rate Limit Load Test (200 -> 429 Transition Proof)', cmd: 'node scripts/load-test.js' }
];

console.log('========================================================================');
console.log('🚀 DEVPULSE PUBLIC API PRODUCT — MASTER VERIFICATION RUNNER');
console.log('========================================================================\n');

let allPassed = true;
const summary = [];

for (const suite of testSuites) {
  console.log(`▶ Running Suite: ${suite.name}...`);
  try {
    const start = Date.now();
    const output = execSync(suite.cmd, { cwd: rootDir, encoding: 'utf8' });
    const duration = Date.now() - start;

    console.log(output);
    console.log(`✅ ${suite.name} PASSED in ${duration}ms\n`);
    summary.push({ Suite: suite.name, Status: '✅ PASSED', Duration: `${duration}ms` });
  } catch (err) {
    console.error(`❌ Suite Failed: ${suite.name}`);
    console.error(err.stdout || err.message);
    summary.push({ Suite: suite.name, Status: '❌ FAILED', Duration: 'N/A' });
    allPassed = false;
    break;
  }
}

console.log('========================================================================');
console.log('📋 FINAL MASTER VERIFICATION SCORECARD');
console.log('========================================================================');
console.table(summary);

if (allPassed) {
  console.log('🎉 ALL TEST SUITES PASSED WITH 100% SUCCESS!');
  console.log('   The project is portfolio-grade and ready for video recording and delivery.\n');
} else {
  console.error('❌ One or more test suites failed.');
  process.exit(1);
}
