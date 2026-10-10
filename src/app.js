/**
 * Express Application Pipeline
 * DevPulse Labs - Public API Product
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');

const { apiKeyAuth } = require('./middleware/auth');
const { registerApiKey, API_KEYS } = require('./data/apiKeys');
const { rateLimiterMiddleware } = require('./middleware/rateLimiter');
const { deprecationMiddleware } = require('./middleware/deprecation');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');
const metricsRoutes = require('./routes/metricsRoutes');

// Load OpenAPI Specification & Paths
const openApiJsonPath = path.join(__dirname, '..', 'openapi.json');
const openApiYamlPath = path.join(__dirname, '..', 'openapi.yaml');
const openApiSpec = JSON.parse(fs.readFileSync(openApiJsonPath, 'utf8'));

const publicDirPath = path.join(__dirname, '..', 'public');
const swaggerDarkCss = fs.readFileSync(path.join(publicDirPath, 'swagger-dark.css'), 'utf8');

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// Serve Static Assets (Developer Portal, CSS, Themes)
app.use(express.static(publicDirPath));

// Serve React SaaS WebApp at /app if built
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use('/app', express.static(clientDistPath));
  app.get(['/app', '/app/*'], (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Root Serves the Interactive Developer Portal
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDirPath, 'index.html'));
});
app.get('/portal', (req, res) => {
  res.sendFile(path.join(publicDirPath, 'index.html'));
});

// Developer Portal Key Management Endpoints
app.get('/api/keys', (req, res) => {
  const keys = Array.from(API_KEYS.values()).map(k => ({
    key: k.key,
    clientName: k.clientName,
    tier: k.tier,
    quota: k.tierConfig.limit,
    windowSeconds: k.tierConfig.windowSeconds,
    status: k.status,
    createdAt: k.createdAt
  }));
  res.status(200).json({ status: 'success', data: keys });
});

app.post('/api/keys/provision', (req, res) => {
  const { clientName, tier } = req.body || {};
  const validTier = ['free', 'developer', 'enterprise'].includes(tier) ? tier : 'free';
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const newKey = `devpulse_${validTier}_${randomSuffix}`;
  const record = registerApiKey(newKey, clientName || 'Portfolio Studio User', validTier);
  res.status(201).json({
    status: 'success',
    message: 'API Key generated and provisioned successfully',
    data: {
      key: record.key,
      clientName: record.clientName,
      tier: record.tier,
      quota: record.tierConfig.limit,
      windowSeconds: record.tierConfig.windowSeconds,
      createdAt: record.createdAt
    }
  });
});

// Public Health Check Endpoint (No API Key Required)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'DevPulse Public API',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Raw OpenAPI Specification Endpoints
app.get('/openapi.json', (req, res) => {
  res.sendFile(openApiJsonPath);
});

app.get('/openapi.yaml', (req, res) => {
  res.type('text/yaml').sendFile(openApiYamlPath);
});

// Self-contained Swagger UI HTML with CDN Assets (guarantees 100% reliability on Vercel Serverless & Local)
const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevPulse Code Intelligence API — Interactive Docs</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <style>
    ${swaggerDarkCss}
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        spec: ${JSON.stringify(openApiSpec)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        persistAuthorization: true,
        displayRequestDuration: true
      });
    };
  </script>
</body>
</html>`;

// Mount Interactive Swagger UI at /docs and /api-docs (CDN-powered for Vercel & Cloud)
app.get(['/docs', '/docs/*', '/api-docs', '/api-docs/*'], (req, res) => {
  res.type('html').send(swaggerHtml);
});

// Version 2 Routes (Latest Production - Active)
app.use(
  '/api/v2',
  (req, res, next) => {
    req.apiVersion = 'v2';
    next();
  },
  apiKeyAuth,
  rateLimiterMiddleware,
  metricsRoutes
);

// Version 1 Routes (Legacy - Deprecated with RFC 8594 Headers)
app.use(
  '/api/v1',
  (req, res, next) => {
    req.apiVersion = 'v1';
    next();
  },
  deprecationMiddleware,
  apiKeyAuth,
  rateLimiterMiddleware,
  metricsRoutes
);

// Catch-all 404 & Centralized Error Handler
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
