import { getLogger } from "@shopsphere/logger";
import { createClient, type RedisClientType } from "redis";

const logger = getLogger("@shopSphere/redis-client", "debug");

let redisClient: RedisClientType | null = null;

function getRedisConnection(REDIS_CONNECTION_URL: string): RedisClientType {
  if (!REDIS_CONNECTION_URL) {
    throw Error("Redis connection string is missing.");
  }

  if (!redisClient) {
    redisClient = createClient({
      url: REDIS_CONNECTION_URL,
    });

    redisClient.on("error", (error) => {
      console.log("Redis connection error", error);
    });

    redisClient.on("connect", () => {
      console.log("Redis connection success.");
    });
  }

  return redisClient;
}

export async function connectRedis(redisUrl: string): Promise<RedisClientType> {
  const client = getRedisConnection(redisUrl);

  if (!client.isOpen) {
    await client.connect();
  }

  return client;
}
