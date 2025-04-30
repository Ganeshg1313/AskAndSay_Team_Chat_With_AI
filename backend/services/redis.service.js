// Role: Connect to redis database (cache storage)

// src/services/redis.service.js
// services/redis.service.js
import Redis from 'ioredis';
import 'dotenv/config';

const REDIS_URL = 'redis://default:kOpd5QghcVgEp5TP4h3ioe3YilUVzmZO@memcached-15060.c80.us-east-1-2.ec2.redns.redis-cloud.com:15060';  
// e.g. "redis://default:YOUR_PASSWORD@...:15060"

const redisClient = new Redis(REDIS_URL, {
  // Enable TLS on that port:
  tls: {
    // You may disable certificate verification if needed:
    // rejectUnauthorized: false,
  }
});

redisClient.on('connect', () => {
  console.log('Redis connected');
});
redisClient.on('error', (error) => {
  console.error('Redis error:', error);
});

export default redisClient;




// import { Redis } from "ioredis";

// const redisClient = new Redis('redis://default:kOpd5QghcVgEp5TP4h3ioe3YilUVzmZO@memcached-15060.c80.us-east-1-2.ec2.redns.redis-cloud.com:15060');

// redisClient.on("connect", () => {
//   console.log("Redis connected");
// });
// redisClient.on("error", (error) => {
//   console.log(error);
// });

// export default redisClient;

// import { Redis } from 'ioredis';

// const redisClient = new Redis('redis://:iDibBfTRiaamo7qL5GGiuSkH9N0Qlj3J@memcached-10647.c301.ap-south-1-1.ec2.redns.redis-cloud.com:10647/12943744');

// redisClient.on('connect', () => {
//   console.log('Redis connected'); 
// });

// redisClient.on('error', (error) => {
//   console.error('Redis error:', error);
// });

// export default redisClient;
