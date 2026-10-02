/**
 * Server Entrypoint
 * DevPulse Labs - Public API Product
 */

require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 DevPulse Public API Service is LIVE!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health: http://localhost:${PORT}/health`);
  console.log(`🔑 Seeded Keys Available:`);
  console.log(`   - Free:       devpulse_free_demo_key (5 req/60s)`);
  console.log(`   - Developer:  devpulse_pro_demo_key  (20 req/60s)`);
  console.log(`   - Enterprise: devpulse_ent_demo_key  (100 req/60s)`);
  console.log(`======================================================\n`);
});

module.exports = server;
