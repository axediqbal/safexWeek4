/**
 * Mock Data Repository for DevPulse Code Intelligence Engine
 * Provides realistic engineering metrics for static analysis, security, tech debt, and builds.
 */

const REPOSITORIES = {
  'github.com/devpulse/core-service': {
    healthScore: 92,
    maintainabilityGrade: 'A',
    cyclomaticComplexityAvg: 4.8,
    lintCompliance: {
      rulesChecked: 142,
      passed: 139,
      violations: 3,
      complianceRate: '97.9%'
    },
    security: {
      auditStatus: 'CLEAN_PASS',
      totalVulnerabilities: 2,
      severityCounts: { critical: 0, high: 0, medium: 1, low: 1 },
      advisories: [
        {
          cveId: 'CVE-2026-44012',
          package: 'axios',
          installedVersion: '1.6.0',
          patchedVersion: '1.7.4',
          severity: 'medium'
        },
        {
          cveId: 'CVE-2026-31089',
          package: 'minimist',
          installedVersion: '1.2.6',
          patchedVersion: '1.2.8',
          severity: 'low'
        }
      ]
    },
    techDebt: {
      techDebtRatio: '3.4%',
      estimatedRemediationHours: 18.5,
      duplicatedLinesCount: 140,
      duplicatedBlocksPercentage: '1.8%',
      codeSmellCount: 12,
      remediationCostEstimateUsd: 1480
    },
    buildBenchmarks: {
      pipelineStatus: 'PASSED',
      buildDurationSeconds: 42.6,
      testSuiteDurationSeconds: 18.2,
      testsPassed: 312,
      testsFailed: 0,
      bundleSizeKb: 248.5,
      treeShakingEfficiency: '94.2%'
    }
  },
  'default': {
    healthScore: 84,
    maintainabilityGrade: 'B',
    cyclomaticComplexityAvg: 6.2,
    lintCompliance: {
      rulesChecked: 110,
      passed: 101,
      violations: 9,
      complianceRate: '91.8%'
    },
    security: {
      auditStatus: 'WARNINGS_PRESENT',
      totalVulnerabilities: 4,
      severityCounts: { critical: 0, high: 1, medium: 2, low: 1 },
      advisories: [
        {
          cveId: 'CVE-2026-11802',
          package: 'jsonwebtoken',
          installedVersion: '8.5.1',
          patchedVersion: '9.0.2',
          severity: 'high'
        }
      ]
    },
    techDebt: {
      techDebtRatio: '7.8%',
      estimatedRemediationHours: 42.0,
      duplicatedLinesCount: 380,
      duplicatedBlocksPercentage: '4.2%',
      codeSmellCount: 29,
      remediationCostEstimateUsd: 3360
    },
    buildBenchmarks: {
      pipelineStatus: 'PASSED',
      buildDurationSeconds: 68.4,
      testSuiteDurationSeconds: 31.0,
      testsPassed: 184,
      testsFailed: 2,
      bundleSizeKb: 512.0,
      treeShakingEfficiency: '88.5%'
    }
  }
};

function getRepoMetrics(repoName) {
  return REPOSITORIES[repoName] || REPOSITORIES['default'];
}

module.exports = {
  getRepoMetrics
};
