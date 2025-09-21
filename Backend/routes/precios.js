import express from "express";
import { obtenerCotizacion } from "../services/apiCotizacion.js";
import { calcularPrecioFinal } from "../services/impuestos.js";
import fetch from "node-fetch";

const router = express.Router();

// ✅ Endpoint actual
router.get("/precio/:usd", async (req, res) => {
  try {
    const usd = parseFloat(req.params.usd);
    if (isNaN(usd)) {
      return res.status(400).json({ error: "El valor debe ser un número" });
    }

    const tipo = req.query.tipo || "tarjeta";
    const cotizacion = await obtenerCotizacion(tipo);
    console.log(`💲 Cotización usada (${tipo}):`, cotizacion);

    if (!cotizacion) {
      return res.status(500).json({ error: "No se pudo obtener la cotización" });
    }

    const resultado = calcularPrecioFinal(usd, cotizacion);
    res.json({ tipo, ...resultado });
  } catch (error) {
    console.error("Error en /precio:", error);
    res.status(500).json({ error: "Error en el cálculo" });
  }
});

// ✅ Nuevo endpoint: devuelve todas las cotizaciones crudas
router.get("/cotizaciones", async (req, res) => {
  try {
    const url = "https://criptoya.com/api/dolar";
    const resp = await fetch(url);
    const data = await resp.json();

    res.json({
      oficial: data.oficial?.price || null,
      blue: data.blue?.ask || null,
      tarjeta: data.tarjeta?.price || null,
      mayorista: data.mayorista?.price || null,
      cripto: data.cripto?.usdt?.ask || null
    });
  } catch (error) {
    console.error("Error en /cotizaciones:", error);
    res.status(500).json({ error: "No se pudieron obtener las cotizaciones" });
  }
});

export default router;
