let cotizaciones = {}; // Objeto global con las cotizaciones

// === Cargar cotizaciones desde el backend ===
async function cargarCotizaciones() {
  try {
    const resp = await fetch("http://localhost:3000/api/cotizaciones");
    const raw = await resp.json();

    // Guardamos las cotizaciones tal cual vienen
    cotizaciones = raw;
    window.cotizaciones = cotizaciones; // Para debug en consola

    console.log("✅ Datos recibidos del backend:", cotizaciones);

    // Actualizar UI de referencia
    document.getElementById("dolar-oficial").innerText = `$${cotizaciones.oficial}`;
    document.getElementById("dolar-mayorista").innerText = `$${cotizaciones.mayorista}`;
    document.getElementById("fecha").innerText = new Date().toLocaleString();

  } catch (err) {
    console.error("❌ Error al cargar cotizaciones:", err);
  }
}

// === Calculadora de precios ===
function calcularPrecio() {
  const tipo = document.getElementById("tipo-dolar").value; // clave: oficial, tarjeta, blue...
  const usd = parseFloat(document.getElementById("usd").value);

  const resultadoDiv = document.getElementById("resultado");

  if (!usd || usd <= 0) {
    resultadoDiv.innerText = "⚠️ Ingresá un valor válido en USD.";
    return;
  }

  const valorDolar = cotizaciones[tipo];

  if (!valorDolar) {
    resultadoDiv.innerText = `⚠️ Cotización para "${tipo}" no disponible.`;
    return;
  }

  // Impuestos
  const IVA = 0.21;
  const IMP_PROV = 0.02;

  const baseArs = usd * valorDolar;
  const iva = baseArs * IVA;
  const prov = baseArs * IMP_PROV;
  const total = baseArs + iva + prov;

  resultadoDiv.innerHTML = `
    💵 Base: ARS $${baseArs.toFixed(0)} <br>
    🏛️ IVA (21%): ARS $${iva.toFixed(0)} <br>
    🏞️ Impuesto Provincial (2%): ARS $${prov.toFixed(0)} <br><br>
    ✅ <b>Precio Final: ARS $${total.toFixed(0)}</b>
  `;
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", cargarCotizaciones);
