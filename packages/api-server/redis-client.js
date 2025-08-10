const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env') // Adjust the path as needed based on your project structure
});
const Redis = require('ioredis');

// Create a single Redis client instance
const redis = new Redis({
  host: 'redis-12517.c322.us-east-1-2.ec2.redns.redis-cloud.com',
  password: process.env.REDIS_PASSWORD,
  port: 12517,
  username: 'default',
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('ready', () => {
  console.log('Redis client ready');
});

module.exports = redis;
