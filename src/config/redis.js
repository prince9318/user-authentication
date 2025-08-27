import redis from "redis";
import { redis as redisConfig } from "./env.js";

const client = redis.createClient({
  socket: {
    host: redisConfig.host,
    port: redisConfig.port,
  },
});

client.on("error", (err) => console.log("Redis Client Error", err));

const connectRedis = async () => {
  try {
    await client.connect();
    console.log("Redis connected successfully");
  } catch (error) {
    console.error("Redis connection failed:", error);
  }
};

module.exports = { client, connectRedis };
