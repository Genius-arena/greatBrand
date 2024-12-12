// app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const eventRoutes = require('./src/routes/eventRoutes');
const errorHandler = require('./src/middleware/errorHandler');
const rateLimiter = require('./src/middleware/rateLimiter');
const logger = require('./src/utils/logger');

function createApp() {
  const app = express();

  // Middleware
  app.use(helmet()); // Security middleware
  app.use(cors()); // Enable CORS
  app.use(compression()); // Compress responses
  app.use(express.json()); // JSON body parser
  app.use(rateLimiter); // Rate limiting

  // Logging middleware
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });

  // Routes
  app.use('/api/events', eventRoutes);

  // Global error handler
  app.use(errorHandler);

  return app;
}

module.exports = createApp();