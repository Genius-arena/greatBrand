const winston = require('winston');

// Global error handler middleware
function errorHandler(err, req, res, next) {
  // Log the error
  winston.error(`Error: ${err.message}`, {
    method: req.method,
    path: req.path,
    body: req.body,
    stack: err.stack
  });

  // Determine status code
  const statusCode = err.status || 500;

  // Send error response
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = errorHandler;