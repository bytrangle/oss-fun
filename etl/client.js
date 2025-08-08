// import 'dotenv/config';
// import { createClient } from 'redis';

// const client = createClient({
//   url: `redis://default:${process.env.REDIS_PASSWORD}@redis-12517.c322.us-east-1-2.ec2.redns.redis-cloud.com:12517`
// });

// client.on('error', err => console.log('Redis Client Error', err));

// export default client;
require ('dotenv').config();
const Redis = require('ioredis');
const redis = new Redis({
  port: 12517, // Redis port
  host: 'redis-12517.c322.us-east-1-2.ec2.redns.redis-cloud.com', // Redis host
  username: 'default', // Redis username
  password: process.env.REDIS_PASSWORD, // Replace
});

redis.set('key', 'value');
redis.get('key').then(value => {
  console.log(`Value from Redis: ${value}`);
}).catch(err => {
  console.error('Error fetching "key":', err);
});

module.exports = redis;