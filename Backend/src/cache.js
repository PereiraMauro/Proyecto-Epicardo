import { LRUCache } from "lru-cache";

const TTL = Number(process.env.CACHE_TTL_MS || 15 * 60 * 1000); // 15 min

const memory = new LRUCache({ max: 100, ttl: TTL });

export async function cacheGet(key) {
  return memory.get(key) || null;
}
export async function cacheSet(key, value, ttlMs = TTL) {
  memory.set(key, value, { ttl: ttlMs });
}
