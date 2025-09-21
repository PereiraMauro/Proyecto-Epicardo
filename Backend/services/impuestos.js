export function calcularPrecioFinal(usd, cotizacion) {
  if (!cotizacion) {
    return {
      base: null,
      iva: null,
      pais: null,
      percepcion: null,
      total: null
    };
  }

  const precioBase = usd * Number(cotizacion);
  const iva = precioBase * 0.21;
  const pais = precioBase * 0.30;
  const percepcion = precioBase * 0.45;
  const total = precioBase + iva + pais + percepcion;

  return {
    base: precioBase.toFixed(2),
    iva: iva.toFixed(2),
    pais: pais.toFixed(2),
    percepcion: percepcion.toFixed(2),
    total: total.toFixed(2)
  };
}
