/**
 * Centralized Error Handlers
 * DevPulse Labs - Public API Product
 */

function notFoundHandler(req, res) {
  res.status(404).json({
    status: 'error',
    code: 404,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
}

function globalErrorHandler(err, req, res, next) {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    code: err.status || 500,
    message: err.message || 'Internal server error occurred.',
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
