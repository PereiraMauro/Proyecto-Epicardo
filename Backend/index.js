// index.js (corregido)
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import preciosRouter from "./api_routes/precios.js";
import ratesRouter from "./src/src_routes/rates.js";         // <-- estaba sin "src/"
import { scheduleRatesCron, refreshRates } from "./src/src_rates/service.js"; // <-- estaba sin "src/"

const app = express();
const PORT = process.env.PORT || 3000;

// CORS flexible
const allowed = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "https://epicardo.netlify.app",
  "https://epicardo.vercel.app",
];
const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const ok = allowed.some(u => origin.startsWith(u)) || /\.netlify\.app$/.test(origin);
    cb(ok ? null : new Error("No permitido por CORS"), ok);
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/api", preciosRouter);
app.use("/api", ratesRouter);

app.get("/api/health", (_, res) => res.json({ ok: true }));

app.listen(PORT, async () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  try {
    await refreshRates();  // precarga cache
    console.log("💱 [rates] Warmup OK");
  } catch (e) {
    console.log("⚠️ [rates] Warmup falló:", e?.message);
  }
  scheduleRatesCron();     // auto-actualización
});
