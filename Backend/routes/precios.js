// routes/precios.js
import express from "express";
import { obtenerCotizacion } from "../services/apiCotizacion.js";
import { calcularPrecioFinal } from "../services/impuestos.js";

const router = express.Router();

// Calcula un precio final según método de pago
router.get("/precio/:usd", async (req, res) => {
  try {
    const usd = parseFloat(req.params.usd);
    if (isNaN(usd)) {
      return res.status(400).json({ error: "El valor debe ser un número" });
    }

    const tipo = req.query.tipo || "tarjeta_pesos";
    const cotizacion = await obtenerCotizacion(tipo);
    if (!cotizacion) {
      return res.status(500).json({ error: "No se pudo obtener la cotización" });
    }

    const resultado = calcularPrecioFinal(usd, cotizacion, tipo);
    res.json({ tipo, cotizacion, ...resultado });
  } catch (error) {
    console.error("Error en /precio:", error);
    res.status(500).json({ error: "Error en el cálculo" });
  }
});

// Cotizaciones de referencia (para el panel derecho)
router.get("/cotizaciones", async (_req, res) => {
  try {
    const oficial = await obtenerCotizacion("tarjeta_pesos"); // base oficial
    const mercadopago = await obtenerCotizacion("mercadopago");
    const astroplay = await obtenerCotizacion("astroplay");

    const refs = {
      mercadopago: mercadopago ?? null,
      astroplay: astroplay ?? null,
      // mostramos las referencias ya con impuestos integrados
      tarjeta_pesos: oficial != null ? Number((oficial * (1 + 0.21 + 0.30 + 0.45)).toFixed(2)) : null,
      tarjeta_usd:   oficial != null ? Number((oficial * (1 + 0.21)).toFixed(2)) : null,
    };

    res.json(refs);
  } catch (error) {
    console.error("Error en /cotizaciones:", error);
    res.status(500).json({ error: "No se pudieron obtener las cotizaciones" });
  }
});

export default router;
