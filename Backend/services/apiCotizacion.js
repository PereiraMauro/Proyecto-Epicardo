// services/apiCotizacion.js
import fetch from "node-fetch";

export async function obtenerCotizacion(tipo = "tarjeta_pesos") {
  const url = "https://criptoya.com/api/dolar";
  const resp = await fetch(url);
  const data = await resp.json();

  // Fuentes principales
  const oficial = data?.oficial?.price ?? null;
  const usdt = data?.usdt?.ask ?? data?.cripto?.usdt?.ask ?? null;

  switch (tipo) {
    case "mercadopago":
      // base oficial + 12% (suele ser el recargo de la pasarela)
      return oficial != null ? Number((oficial * 1.12).toFixed(2)) : null;

    case "astroplay":
      // dólar cripto (USDT)
      return usdt != null ? Number(usdt.toFixed(2)) : null;

    case "tarjeta_pesos":
      // devolvemos OFICIAL; los impuestos los aplica impuestos.js
      return oficial != null ? Number(oficial.toFixed(2)) : null;

    case "tarjeta_usd":
      // devolvemos OFICIAL; en impuestos.js aplicamos SOLO 21% (IVA)
      return oficial != null ? Number(oficial.toFixed(2)) : null;

    default:
      return oficial != null ? Number(oficial.toFixed(2)) : null;
  }
}
