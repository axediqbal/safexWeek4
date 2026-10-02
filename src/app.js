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

// Swagger UI Options with High-Contrast Dark Theme
const swaggerOptions = {
  customCss: swaggerDarkCss,
  customSiteTitle: 'DevPulse Code Intelligence API — Interactive Docs',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true
  }
};

// Mount Interactive Swagger UI at /docs and /api-docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, swaggerOptions));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, swaggerOptions));

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
