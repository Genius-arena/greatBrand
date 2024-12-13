const dotenv = require('dotenv');
const Redis = require('ioredis');

// Load environment variables
dotenv.config();

// Redis Cache Configuration
const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
});

module.exports = redisClient;
