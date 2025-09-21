import fetch from "node-fetch";

export async function obtenerCotizacion(tipo = "tarjeta") {
  const url = "https://criptoya.com/api/dolar";
  const resp = await fetch(url);
  const data = await resp.json();

  console.log("Cotizaciones disponibles:", data);

  switch (tipo) {
    case "oficial":
      return data.oficial?.price || null;
    case "blue":
      return data.blue?.ask || null;
    case "tarjeta":
      return data.tarjeta?.price || null;
    default:
      return data.tarjeta?.price || null; // fallback
  }
}


