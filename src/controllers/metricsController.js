/**
 * Metrics Controller
 * Implements business logic for the 5 DevPulse data service endpoints.
 * Handles both v1 (legacy flat format) and v2 (standardized enveloped format).
 */

const { getRepoMetrics } = require('../data/mockMetrics');

/**
 * 1. GET /metrics/code-health
 */
function getCodeHealth(req, res) {
  const version = req.apiVersion || 'v2';
  const repo = req.query.repo || 'github.com/devpulse/core-service';
  const branch = req.query.branch || 'main';
  const metrics = getRepoMetrics(repo);

  if (version === 'v1') {
    // Legacy v1 breaking difference: flat format, snake_case keys, no metadata envelope
    return res.status(200).json({
      repository: repo,
      branch: branch,
      health_score: metrics.healthScore,
      maintainability_grade: metrics.maintainabilityGrade,
      cyclomatic_complexity: metrics.cyclomaticComplexityAvg,
      lint_rules_passed: metrics.lintCompliance.passed,
      lint_violations: metrics.lintCompliance.violations,
      evaluated_at: new Date().toISOString()
    });
  }

  // Modern v2 format: normalized envelope, camelCase, nested metrics
  return res.status(200).json({
    status: 'success',
    version: 'v2',
    data: {
      repository: repo,
      branch: branch,
      healthScore: metrics.healthScore,
      maintainabilityGrade: metrics.maintainabilityGrade,
      cyclomaticComplexityAvg: metrics.cyclomaticComplexityAvg,
      lintCompliance: metrics.lintCompliance,
      lastAuditedAt: new Date().toISOString()
    }
  });
}

/**
 * 2. GET /metrics/security-audit
 */
function getSecurityAudit(req, res) {
  const version = req.apiVersion || 'v2';
  const repo = req.query.repo || 'github.com/devpulse/core-service';
  const severityMin = req.query.severity_min || 'low';
  const metrics = getRepoMetrics(repo);

  if (version === 'v1') {
    // Legacy v1: flat unnested response
    return res.status(200).json({
      repo: repo,
      total_vulnerabilities: metrics.security.totalVulnerabilities,
      critical_count: metrics.security.severityCounts.critical,
      high_count: metrics.security.severityCounts.high,
      medium_count: metrics.security.severityCounts.medium,
      low_count: metrics.security.severityCounts.low,
      advisories: metrics.security.advisories
    });
  }

  // Modern v2
  return res.status(200).json({
    status: 'success',
    version: 'v2',
    data: {
      repository: repo,
      auditStatus: metrics.security.auditStatus,
      severityFilterApplied: severityMin,
      totalVulnerabilities: metrics.security.totalVulnerabilities,
      severityCounts: metrics.security.severityCounts,
      advisories: metrics.security.advisories
    }
  });
}

/**
 * 3. GET /metrics/tech-debt
 */
function getTechDebt(req, res) {
  const version = req.apiVersion || 'v2';
  const repo = req.query.repo || 'github.com/devpulse/core-service';
  const metrics = getRepoMetrics(repo);

  if (version === 'v1') {
    // Legacy v1
    return res.status(200).json({
      repo: repo,
      tech_debt_ratio: metrics.techDebt.techDebtRatio,
      remediation_hours: metrics.techDebt.estimatedRemediationHours,
      duplicated_lines: metrics.techDebt.duplicatedLinesCount
    });
  }

  // Modern v2
  return res.status(200).json({
    status: 'success',
    version: 'v2',
    data: {
      repository: repo,
      techDebtRatio: metrics.techDebt.techDebtRatio,
      estimatedRemediationHours: metrics.techDebt.estimatedRemediationHours,
      duplicatedLinesCount: metrics.techDebt.duplicatedLinesCount,
      duplicatedBlocksPercentage: metrics.techDebt.duplicatedBlocksPercentage,
      codeSmellCount: metrics.techDebt.codeSmellCount,
      remediationCostEstimateUsd: metrics.techDebt.remediationCostEstimateUsd
    }
  });
}

/**
 * 4. GET /metrics/build-benchmarks
 */
function getBuildBenchmarks(req, res) {
  const version = req.apiVersion || 'v2';
  const repo = req.query.repo || 'github.com/devpulse/core-service';
  const metrics = getRepoMetrics(repo);

  if (version === 'v1') {
    // Legacy v1
    return res.status(200).json({
      repo: repo,
      pipeline_status: metrics.buildBenchmarks.pipelineStatus,
      build_seconds: metrics.buildBenchmarks.buildDurationSeconds,
      test_seconds: metrics.buildBenchmarks.testSuiteDurationSeconds
    });
  }

  // Modern v2
  return res.status(200).json({
    status: 'success',
    version: 'v2',
    data: {
      repository: repo,
      pipelineStatus: metrics.buildBenchmarks.pipelineStatus,
      buildDurationSeconds: metrics.buildBenchmarks.buildDurationSeconds,
      testSuiteDurationSeconds: metrics.buildBenchmarks.testSuiteDurationSeconds,
      testsPassed: metrics.buildBenchmarks.testsPassed,
      testsFailed: metrics.buildBenchmarks.testsFailed,
      bundleSizeKb: metrics.buildBenchmarks.bundleSizeKb,
      treeShakingEfficiency: metrics.buildBenchmarks.treeShakingEfficiency
    }
  });
}

/**
 * 5. POST /analyze/repository
 */
function postAnalyzeRepository(req, res) {
  const version = req.apiVersion || 'v2';
  const { repo_url, branch = 'main', language = 'typescript', analysis_depth = 'standard' } = req.body || {};

  if (!repo_url || typeof repo_url !== 'string') {
    return res.status(400).json({
      status: 'error',
      code: 400,
      message: "Validation failed: 'repo_url' is a required string field.",
      errors: [
        { field: 'repo_url', issue: 'Field is missing or not a valid string' }
      ],
      timestamp: new Date().toISOString()
    });
  }

  const randomHash = Math.random().toString(36).substring(2, 10);
  const jobId = `job_anlz_${randomHash}`;

  if (version === 'v1') {
    return res.status(201).json({
      job_id: jobId,
      target_repo: repo_url,
      branch: branch,
      status: 'COMPLETED',
      score: 89
    });
  }

  return res.status(201).json({
    status: 'success',
    version: 'v2',
    data: {
      jobId: jobId,
      targetRepo: repo_url,
      branch: branch,
      language: language,
      analysisDepth: analysis_depth,
      status: 'COMPLETED',
      summaryScore: 89,
      findingsCount: 5,
      recommendedAction: 'Upgrade 1 medium severity dependency and refactor 2 long methods.',
      completedAt: new Date().toISOString()
    }
  });
}

module.exports = {
  getCodeHealth,
  getSecurityAudit,
  getTechDebt,
  getBuildBenchmarks,
  postAnalyzeRepository
};
