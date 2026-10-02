/**
 * Metrics Routes
 * Binds the 5 core endpoints to controller functions
 */

const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metricsController');

router.get('/metrics/code-health', metricsController.getCodeHealth);
router.get('/metrics/security-audit', metricsController.getSecurityAudit);
router.get('/metrics/tech-debt', metricsController.getTechDebt);
router.get('/metrics/build-benchmarks', metricsController.getBuildBenchmarks);
router.post('/analyze/repository', metricsController.postAnalyzeRepository);

module.exports = router;
