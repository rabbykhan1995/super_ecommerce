import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL as string, {
  tls: {}, // Upstash requires TLS
  maxRetriesPerRequest: 3,
});

redis.on("connect", () => {
  console.log("✅ Redis connected");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

export default redis;