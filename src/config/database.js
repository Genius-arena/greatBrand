const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

  // MySQL Sequelize Configuration
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );

  // Database Synchronization
async function initializeDatabase() {
    try {
      await sequelize.authenticate();
      await sequelize.sync({ force: process.env.NODE_ENV === 'development' });
      logger.info('Database connected and synchronized');
    } catch (error) {
      logger.error('Database initialization failed', error);
      throw error;
    }
  }
  
  module.exports = {initializeDatabase, sequelize};