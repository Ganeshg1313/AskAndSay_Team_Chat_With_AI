// Role: Connect to redis database (cache storage)

import { Redis } from "ioredis";
import "dotenv/config";

const redisClient = new Redis(process.env.REDIS_HOST);

redisClient.on("connect", () => {
  console.log("Redis connected");
});
redisClient.on("error", (error) => {
  console.log(error);
});

export default redisClient;
