import crypto from "node:crypto";
import Redis from "ioredis";

export type RedisLike = {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  ttl(key: string): Promise<number>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode: "EX", seconds: number): Promise<string | null>;
};

function normalizeRedisUrl(redisUrl: string) {
  try {
    const parsed = new URL(redisUrl);

    if (
      process.env.NODE_ENV !== "production" &&
      process.env.DOCKER !== "true" &&
      parsed.hostname === "redis"
    ) {
      parsed.hostname = "localhost";
      return parsed.toString();
    }

    return redisUrl;
  } catch {
    return redisUrl;
  }
}

let redis: Redis | undefined;

export function getRedis() {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      throw new Error("REDIS_URL is not configured");
    }

    const client = new Redis(normalizeRedisUrl(redisUrl), {
      lazyConnect: true,
      maxRetriesPerRequest: 0,
      retryStrategy: () => null,
    });

    client.on("error", (error) => {
      console.warn(`[redis] ${error.message}`);
    });

    redis = client;
  }

  return redis;
}

export async function rateLimitWithClient(
  client: RedisLike,
  userId: string,
  limit: number,
  windowSeconds: number,
) {
  const key = `rate:${userId}`;
  const current = await client.incr(key);

  if (current === 1) {
    await client.expire(key, windowSeconds);
  }

  const ttl = await client.ttl(key);

  return {
    allowed: current <= limit,
    remaining: Math.max(0, limit - current),
    resetIn: Math.max(ttl, 0),
  };
}

export async function rateLimit(userId: string, limit: number, windowSeconds: number) {
  return rateLimitWithClient(getRedis(), userId, limit, windowSeconds);
}

export function createPromptCacheKey(prompt: string) {
  return `gen:${crypto.createHash("sha256").update(prompt.trim()).digest("hex")}`;
}

export async function getCachedResponse(cacheKey: string) {
  const redisClient = getRedis();
  const cached = await redisClient.get(cacheKey);

  if (!cached) {
    return null;
  }

  try {
    return JSON.parse(cached) as { response: string };
  } catch {
    return null;
  }
}

export async function setCachedResponse(
  cacheKey: string,
  response: string,
  ttlHours = 24,
) {
  const redisClient = getRedis();

  await redisClient.set(
    cacheKey,
    JSON.stringify({ response }),
    "EX",
    ttlHours * 60 * 60,
  );
}
