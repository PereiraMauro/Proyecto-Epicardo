// services/impuestos.js
export function calcularPrecioFinal(usd, cotizacion, tipo = "tarjeta_pesos") {
  if (!cotizacion) {
    return { base: null, iva: null, pais: null, percepcion: null, total: null };
  }

  const precioBase = usd * Number(cotizacion);

  let iva = 0, pais = 0, percepcion = 0;

  // ✅ Solo aplicamos impuestos a MercadoPago y Tarjeta en pesos
  if (tipo === "mercadopago" || tipo === "tarjeta_pesos") {
    iva = precioBase * 0.21;
    pais = precioBase * 0.30;
    percepcion = precioBase * 0.45;
  }

  // ✅ AstroPay y Tarjeta en dólares → sin impuestos
  // (ya quedan todos en 0)

  const total = precioBase + iva + pais + percepcion;

  return {
    base: precioBase.toFixed(2),
    iva: iva.toFixed(2),
    pais: pais.toFixed(2),
    percepcion: percepcion.toFixed(2),
    total: total.toFixed(2)
  };
}

