// Role: Connect to redis database (cache storage)

import { Redis } from "ioredis";

const redisClient = new Redis('redis://default:fA3CGypYXm8NZCHdevWwHYE4g58qJ1em@redis-17459.crce179.ap-south-1-1.ec2.redns.redis-cloud.com:17459');

redisClient.on("connect", () => {
  console.log("Redis connected");
});
redisClient.on("error", (error) => {
  console.log(error);
});

export default redisClient;

// import { Redis } from 'ioredis';

// const redisClient = new Redis('redis://:iDibBfTRiaamo7qL5GGiuSkH9N0Qlj3J@memcached-10647.c301.ap-south-1-1.ec2.redns.redis-cloud.com:10647/12943744');

// redisClient.on('connect', () => {
//   console.log('Redis connected'); 
// });

// redisClient.on('error', (error) => {
//   console.error('Redis error:', error);
// });

// export default redisClient;
