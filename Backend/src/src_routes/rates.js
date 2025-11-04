import { Router } from "express";
import { getRates, refreshRates } from "../src_rates/service.js";

const r = Router();

r.get("/rates", async (req, res) => {
  try {
    const data = await getRates();
    res.set("Cache-Control", "public, max-age=120, stale-while-revalidate=300");
    res.json(data);
  } catch {
    res.status(503).json({ error: "No se pudieron obtener cotizaciones" });
  }
});

r.post("/rates/refresh", async (req, res) => {
  try {
    const data = await refreshRates();
    res.json({ ok: true, data });
  } catch {
    res.status(502).json({ ok: false, error: "Falló el refresh" });
  }
});

export default r;
