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