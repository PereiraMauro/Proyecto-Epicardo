// services/impuestos.js
export function calcularPrecioFinal(usd, cotizacion, tipo = "tarjeta_pesos") {
  if (!cotizacion) {
    return { base: null, iva: null, total: null };
  }

  const precioBase = usd * Number(cotizacion);

  let iva = 0;

  // ✅ Aplica IVA a MercadoPago, Tarjeta en pesos y Tarjeta en dólares
  if (tipo === "mercadopago" || tipo === "tarjeta_pesos" || tipo === "tarjeta_usd") {
    iva = precioBase * 0.21;
  }

  // ✅ AstroPay → sin impuestos

  const total = precioBase + iva;

  return {
    base: precioBase.toFixed(2),
    iva: iva.toFixed(2),
    total: total.toFixed(2)
  };
}


