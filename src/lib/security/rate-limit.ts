import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  prefix: string;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 100,
  prefix: "rl",
};

const AUTH_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  prefix: "rl:auth",
};

const API_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 200,
  prefix: "rl:api",
};

let redis: any = null;
let redisConnected = false;
let redisAttempted = false;
let redisRetryAt = 0;

async function getRedis() {
  if (redis) return redis;
  if (!redisAttempted && Date.now() < redisRetryAt) return null;
  
  redisAttempted = true;
  redisRetryAt = Date.now() + 60000;

  try {
    const { createClient } = await import("redis");
    redis = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
      socket: {
        connectTimeout: 1000,
        reconnectStrategy: () => false,
      },
    });
    redis.on("error", (err: Error) => {
      console.log("[RateLimit] Redis connection failed:", err.message);
      redis = null;
      redisConnected = false;
    });
    await redis.connect();
    redisConnected = true;
    console.log("[RateLimit] Redis connected");
  } catch (err) {
    redisConnected = false;
    console.log("[RateLimit] Redis unavailable, using in-memory store");
  }
  return redis;
}

const memoryStore = new Map<string, { count: number; resetTime: number }>();

async function getStore(key: string, config: RateLimitConfig) {
  const client = await getRedis();
  if (client && redisConnected) {
    return {
      async get() {
        try {
          const data = await client.get(key);
          return data ? JSON.parse(data) : null;
        } catch {
          return null;
        }
      },
      async set(entry: { count: number; resetTime: number }) {
        try {
          const ttl = Math.ceil((entry.resetTime - Date.now()) / 1000);
          if (ttl > 0) await client.setEx(key, ttl, JSON.stringify(entry));
        } catch {}
      },
    };
  }
  return {
    get() {
      const entry = memoryStore.get(key);
      return entry && entry.resetTime > Date.now() ? entry : null;
    },
    set(entry: { count: number; resetTime: number }) {
      memoryStore.set(key, entry);
      if (memoryStore.size > 10000) {
        const now = Date.now();
        for (const [k, v] of memoryStore.entries()) {
          if (v.resetTime < now) memoryStore.delete(k);
        }
      }
    },
  };
}

export async function rateLimit(req: NextRequest, config = DEFAULT_CONFIG): Promise<NextResponse | null> {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const key = `${config.prefix}:${ip}:${req.nextUrl.pathname}`;
  const now = Date.now();
  const store = await getStore(key, config);

  const entry = await store.get();

  if (!entry || now > entry.resetTime) {
    await store.set({ count: 1, resetTime: now + config.windowMs });
    return null;
  }

  if (entry.count >= config.maxRequests) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((entry.resetTime - now) / 1000).toString(),
          "X-RateLimit-Limit": config.maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.ceil(entry.resetTime / 1000).toString(),
        },
      }
    );
  }

  entry.count++;
  await store.set(entry);

  return null;
}

export function checkCSRF(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host") || "";

  if (!origin && !referer) {
    return true;
  }

  if (origin) {
    try {
      const url = new URL(origin);
      if (url.host !== host && process.env.NODE_ENV === "production") {
        return false;
      }
    } catch {
      return false;
    }
  }

  return true;
}

export function getRateLimitConfig(pathname: string): RateLimitConfig {
  if (pathname.startsWith("/api/auth/")) return AUTH_CONFIG;
  if (pathname.startsWith("/api/")) return API_CONFIG;
  return DEFAULT_CONFIG;
}
