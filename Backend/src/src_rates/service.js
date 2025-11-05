import cron from "node-cron";
import { providers } from "./providers.js";
import { cacheGet, cacheSet } from "../cache.js";

const KEY = "rates:usd-ars";
const TTL = Number(process.env.CACHE_TTL_MS || 15 * 60 * 1000);

async function fetchFromAnyProvider() {
  let lastErr = null;
  for (const p of providers) {
    try {
      const res = await p();
      if (!res?.ars?.oficial) throw new Error("Formato inválido");
      return { ...res, updatedAt: new Date().toISOString() };
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error("Sin proveedores");
}

export async function getRates() {
  const cached = await cacheGet(KEY);
  if (cached) return cached;
  const fresh = await fetchFromAnyProvider();
  await cacheSet(KEY, fresh, TTL);
  return fresh;
}

export async function refreshRates() {
  const fresh = await fetchFromAnyProvider();
  await cacheSet(KEY, fresh, TTL);
  return fresh;
}

export function scheduleRatesCron() {
  const expr = process.env.RATES_REFRESH_CRON || "*/15 * * * *";
  cron.schedule(expr, async () => {
    try { await refreshRates(); console.log("[rates] refresh OK"); }
    catch (e) { console.log("[rates] refresh FAIL", e?.message); }
  });
}
