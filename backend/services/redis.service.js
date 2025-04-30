// Role: Connect to redis database (cache storage)

// src/services/redis.service.js
import Redis from "ioredis";

const redisClient = new Redis({
  host: "memcached-15060.c80.us-east-1-2.ec2.redns.redis-cloud.com",
  port: 15060,
  username: "default",
  password: "kOpd5QghcVgEp5TP4h3ioe3YilUVzmZO",
  tls: {},                   // <-- enable TLS
  lazyConnect: true,         // optional: don’t connect until needed
  reconnectOnError(err) {    // optional: auto-reconnect logic
    const targetErr = "READONLY";
    if (err.message.includes(targetErr)) {
      return true;           // reconnect on READONLY errors
    }
  },
});

redisClient.on("connect", () => {
  console.log("✅ Redis connected");
});
redisClient.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

// If you used lazyConnect
redisClient.connect().catch(console.error);

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
