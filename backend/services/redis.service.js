// Role: Connect to redis database (cache storage)

import { Redis } from "ioredis";

const redisClient = new Redis(
  "redis://default:kimvZOZBSC8wjB4HhMeGuPIlHbVQvMIX@redis-17110.c264.ap-south-1-1.ec2.redns.redis-cloud.com:17110"
);

redisClient.on("connect", () => {
  console.log("Redis connected");
});
redisClient.on("error", (error) => {
  console.log(error);
});

export default redisClient;
