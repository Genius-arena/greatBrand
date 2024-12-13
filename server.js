const cluster = require('cluster');
const os = require('os');
const dotenv = require('dotenv');

  
// Load environment variables
dotenv.config();

// Clustering configuration
if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers for each CPU core
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Handle worker exits
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    // Fork a new worker to replace the dead one
    cluster.fork();
  });
} else {

  // Worker process - initialize the application
  const app = require('./app');
  const { initializeDatabase } = require('./src/config/database');
  const logger = require('./src/utils/logger');
  // Database and server initialization
  async function startServer() {
    try {
      // Initialize database connection
      await initializeDatabase();

      // Start the Express server
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
        logger.info(`Worker ${process.pid} started. Server running on port ${PORT}`);
      });
    } catch (error) {
      logger.error('Failed to start server', error);
      process.exit(1);
    }
  }

  startServer();
}

