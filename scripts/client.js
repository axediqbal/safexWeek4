// DevPulse Client Script (20-line standalone consumer)
const http = require('http');
const apiKey = process.argv[2] || 'devpulse_pro_demo_key';
const opts = { hostname: 'localhost', port: 3000, path: '/api/v2/metrics/code-health', headers: { 'x-api-key': apiKey } };

http.get(opts, (res) => {
  let raw = '';
  res.on('data', chunk => raw += chunk);
  res.on('end', () => {
    const data = JSON.parse(raw);
    console.log(`[HTTP ${res.statusCode}] Remaining: ${res.headers['x-ratelimit-remaining']}/${res.headers['x-ratelimit-limit']}`);
    if (res.statusCode === 200) {
      console.log(`Repository: ${data.data.repository} | Health Score: ${data.data.healthScore}/100 (Grade: ${data.data.maintainabilityGrade})`);
    } else if (res.statusCode === 429) {
      console.log(`Throttled! Retry-After: ${res.headers['retry-after']}s | Reason: ${data.message}`);
    } else {
      console.log(`Error: ${data.message}`);
    }
  });
}).on('error', err => console.error('Connection error:', err.message));
