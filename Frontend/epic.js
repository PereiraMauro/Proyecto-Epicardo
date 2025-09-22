// Cotización dólar oficial (ejemplo, reemplazar con API real)
const dolarOficial = 1500;

// IVA actual
const IVA = 0.21;

// Impuesto provincial (ejemplo: 2% = 0.02)
let impuestoProvincial = 0.02; // configurable

// Calculadora manual
function calcularPrecio() {
  let usd = parseFloat(document.getElementById("usd").value);
  if (!usd || usd <= 0) {
    document.getElementById("resultado").innerText = "⚠️ Ingresá un valor válido en USD.";
    return;
  }

  let baseArs = usd * dolarOficial;
  let iva = baseArs * IVA;
  let prov = baseArs * impuestoProvincial;
  let precioFinal = baseArs + iva + prov;

  document.getElementById("resultado").innerHTML = `
    💵 Base: ARS $${baseArs.toFixed(0)} <br>
    🏛️ IVA (21%): ARS $${iva.toFixed(0)} <br>
    🏞️ Impuesto Provincial (${(impuestoProvincial * 100).toFixed(1)}%): ARS $${prov.toFixed(0)} <br><br>
    ✅ <b>Precio Final: ARS $${precioFinal.toFixed(0)}</b>
  `;
}

// Integración básica con la API de Epic
async function getEpicPrice(offerId, namespace) {
  try {
    const url = `https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=es-ES&country=AR`;
    const res = await fetch(url);
    const data = await res.json();

    let oferta = data.data.Catalog.searchStore.elements.find(
      e => e.title.toLowerCase().includes("fortnite")
    );

    if (oferta) {
      let usdPrice = oferta.price.totalPrice.originalPrice / 100;
      let baseArs = usdPrice * dolarOficial;
      let iva = baseArs * IVA;
      let prov = baseArs * impuestoProvincial;
      let precioFinal = baseArs + iva + prov;

      document.getElementById("epic-precio").innerHTML =
        `🎯 Fortnite: USD $${usdPrice} → ARS $${precioFinal.toFixed(0)}`;
    } else {
      document.getElementById("epic-precio").innerText = "Juego no encontrado en la API.";
    }
  } catch (error) {
    document.getElementById("epic-precio").innerText = "❌ Error al conectar con la API de Epic.";
    console.error(error);
  }
}
// === Conectar con Backend ===
async function cargarCotizaciones() {
  try {
    const resp = await fetch("http://localhost:3000/cotizaciones");
    const data = await resp.json();

    // Actualizar valores en la interfaz
    document.getElementById("dolar-oficial").innerText = `$${data.oficial.price}`;
    document.getElementById("dolar-mayorista").innerText = `$${data.mayorista.price}`;
    document.getElementById("fecha").innerText = new Date().toLocaleString();

    // Usar la cotización oficial real en la calculadora
    window.dolarOficial = data.oficial.price;

  } catch (err) {
    console.error("Error al cargar cotizaciones:", err);
  }
}

// Llamar apenas cargue la página
document.addEventListener("DOMContentLoaded", cargarCotizaciones);
