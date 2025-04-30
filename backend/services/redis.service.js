// Role: Connect to redis database (cache storage)


import { Redis } from "ioredis";
 import "dotenv/config";
 
//  const redisClient = new Redis(process.env.REDIS_HOST);
 const redisClient = new Redis('redis://default:NqvRujwLj6btPltRH9VvwR5xQBrnerou@redis-18123.c274.us-east-1-3.ec2.redns.redis-cloud.com:18123');
 
 redisClient.on("connect", () => {
   console.log("Redis connected");
   redisClient.on("error", (error) => {
 });
 
 export default redisClient;


// src/services/redis.service.js
// services/redis.service.js
// import Redis from 'ioredis';
// import 'dotenv/config';

// const REDIS_URL = 'redis://default:kOpd5QghcVgEp5TP4h3ioe3YilUVzmZO@memcached-15060.c80.us-east-1-2.ec2.redns.redis-cloud.com:15060';  
// // e.g. "redis://default:YOUR_PASSWORD@...:15060"

// const redisClient = new Redis(REDIS_URL, {
//   // Enable TLS on that port:
//   tls: {
//     // You may disable certificate verification if needed:
//     // rejectUnauthorized: false,
//   }
// });

// redisClient.on('connect', () => {
//   console.log('Redis connected');
// });
// redisClient.on('error', (error) => {
//   console.error('Redis error:', error);
// });

// export default redisClient;




// import { createClient } from 'redis';

// const redisClient = createClient({
//     url: 'redis://default:kOpd5QghcVgEp5TP4h3ioe3YilUVzmZO@memcached-15060.c80.us-east-1-2.ec2.redns.redis-cloud.com:15060'
// });

// redisClient.on('error', err => console.log('Redis Client Error', err));

// async function connectRedis() {
//     try {
//         await redisClient.connect();
//         console.log('Redis client connected successfully');
//     } catch (error) {
//         console.error('Error connecting to Redis:', error);
//     }
// }

// connectRedis();

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
