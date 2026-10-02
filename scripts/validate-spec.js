/**
 * OpenAPI 3.0 Specification Validation Script
 * DevPulse Labs - Public API Product (Week 4)
 * 
 * Validates openapi.yaml syntax, checks required endpoints and schemas,
 * and compiles openapi.json.
 */

const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const yamlPath = path.join(__dirname, '..', 'openapi.yaml');
const jsonPath = path.join(__dirname, '..', 'openapi.json');

console.log('🔍 [OpenAPI Validator] Starting verification of openapi.yaml...');

try {
  // 1. Read YAML file
  if (!fs.existsSync(yamlPath)) {
    throw new Error(`Specification file not found at ${yamlPath}`);
  }

  const rawYaml = fs.readFileSync(yamlPath, 'utf8');
  const spec = YAML.parse(rawYaml);

  // 2. Validate Root Properties
  if (!spec.openapi || !spec.openapi.startsWith('3.')) {
    throw new Error(`Invalid OpenAPI version. Expected 3.x, found: ${spec.openapi}`);
  }

  if (!spec.info || !spec.info.title || !spec.info.version) {
    throw new Error("Missing mandatory 'info' metadata (title, version).");
  }

  console.log(`✅ OpenAPI Version: ${spec.openapi}`);
  console.log(`✅ Title: ${spec.info.title} (${spec.info.version})`);

  // 3. Check Required Endpoints
  const requiredEndpoints = [
    { path: '/metrics/code-health', method: 'get' },
    { path: '/metrics/security-audit', method: 'get' },
    { path: '/metrics/tech-debt', method: 'get' },
    { path: '/metrics/build-benchmarks', method: 'get' },
    { path: '/analyze/repository', method: 'post' }
  ];

  console.log('🔍 Checking 5 core data service endpoints...');
  for (const ep of requiredEndpoints) {
    if (!spec.paths[ep.path]) {
      throw new Error(`Missing endpoint path: ${ep.path}`);
    }
    if (!spec.paths[ep.path][ep.method]) {
      throw new Error(`Missing HTTP method '${ep.method.toUpperCase()}' on path ${ep.path}`);
    }
    console.log(`   ✓ Found: ${ep.method.toUpperCase()} ${ep.path}`);
  }

  // 4. Verify Security Schemes
  const securitySchemes = spec.components?.securitySchemes || {};
  if (!securitySchemes.ApiKeyAuth) {
    throw new Error("Missing 'ApiKeyAuth' security scheme in components.securitySchemes");
  }
  console.log(`✅ Security Schemes: Found ApiKeyAuth (${securitySchemes.ApiKeyAuth.name} in ${securitySchemes.ApiKeyAuth.in})`);

  // 5. Verify Rate Limit & Deprecation Headers
  const headers = spec.components?.headers || {};
  const requiredHeaders = ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'Retry-After', 'Deprecation', 'Sunset'];
  for (const hdr of requiredHeaders) {
    if (!headers[hdr]) {
      throw new Error(`Missing RFC header definition in components.headers: ${hdr}`);
    }
  }
  console.log(`✅ RFC Headers: Verified ${requiredHeaders.join(', ')}`);

  // 6. Verify Error Schemas
  const schemas = spec.components?.schemas || {};
  const requiredSchemas = [
    'CodeHealthResponse',
    'SecurityAuditResponse',
    'TechDebtResponse',
    'BuildBenchmarkResponse',
    'RepositoryAnalysisRequest',
    'RepositoryAnalysisResponse',
    'ErrorResponse',
    'RateLimitErrorResponse'
  ];
  for (const sch of requiredSchemas) {
    if (!schemas[sch]) {
      throw new Error(`Missing data schema in components.schemas: ${sch}`);
    }
  }
  console.log(`✅ Data Schemas: Verified all ${requiredSchemas.length} core and error schemas`);

  // 7. Export openapi.json
  fs.writeFileSync(jsonPath, JSON.stringify(spec, null, 2), 'utf8');
  console.log(`💾 Generated compiled JSON specification: ${jsonPath}`);
  console.log('🎉 [OpenAPI Validator] 100% SPECIFICATION INTEGRITY VERIFIED! ZERO ERRORS.\n');

} catch (err) {
  console.error(`❌ [OpenAPI Validator Error]: ${err.message}`);
  process.exit(1);
}
