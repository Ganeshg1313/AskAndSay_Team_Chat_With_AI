// Role: Connect to Redis database (cache storage)

import { Redis } from "ioredis";
import "dotenv/config";

// Initialize Redis client
const redisClient = new Redis(process.env.REDIS_HOST);

// Handle successful connection
redisClient.on("connect", () => {
  console.log("Redis connected");
});

// Handle connection errors
redisClient.on("error", (error) => {
  console.error("Error while connecting to Redis:", error);
});

export default redisClient;
