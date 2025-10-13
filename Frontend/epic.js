// ================================
// epic.js (Frontend)
// ================================

// IVA fijo
const IVA = 0.21;

// Cotizaciones globales
let cotizaciones = {};

// ================================
// Cargar cotizaciones desde backend
// ================================
async function cargarCotizaciones() {
  try {
    const resp = await fetch("http://localhost:3000/api/cotizaciones");
    const data = await resp.json();
    cotizaciones = data;

    console.log("💲 Cotizaciones cargadas:", data);

    // Mostrar en la UI (formato argentino)
    document.getElementById("mercadopago").innerText = `$ ${Number(data.mercadopago).toLocaleString("es-AR")}`;
    document.getElementById("astroplay").innerText   = `$ ${Number(data.astroplay).toLocaleString("es-AR")}`;
    document.getElementById("tarjeta-pesos").innerText = `$ ${Number(data.tarjeta_pesos).toLocaleString("es-AR")}`;
    document.getElementById("tarjeta-usd").innerText   = `$ ${Number(data.tarjeta_usd).toLocaleString("es-AR")}`;

    document.getElementById("fecha").innerText = new Date().toLocaleString("es-AR");
  } catch (err) {
    console.error("⚠️ Error al cargar cotizaciones:", err);
  }
}

// ================================
// Calcular precio en pesos
// ================================
async function calcularPrecio() {
  const usd  = parseFloat(document.getElementById("usd").value);
  const tipo = document.getElementById("tipo-pago").value;

  if (!usd || usd <= 0) {
    mostrarResultado(`<p class="alerta">⚠️ Ingresá un valor válido en USD.</p>`, "");
    return;
  }

  try {
    const resp = await fetch(`http://localhost:3000/api/precio/${usd}?tipo=${tipo}`);
    const data = await resp.json();

    if (data.error) {
      mostrarResultado(`<p class="alerta">⚠️ ${data.error}</p>`, "");
      return;
    }

    const cotizacion = Number(data.cotizacion);
    const base = Number(data.base);
    const iva  = Number(data.iva);
    const total = Number(data.total);

    // Render condicional del IVA: solo si es mayor a 0
    const ivaLine = iva > 0
      ? `<p>🏛️ IVA (21%): $ ${iva.toLocaleString("es-AR")}</p>`
      : "";

    const html = `
      <h3>📑 Resultado</h3>
      <p><b>${formatearNombre(tipo)}</b> ($ ${cotizacion.toLocaleString("es-AR")})</p>
      <p>💵 Base: $ ${base.toLocaleString("es-AR")}</p>
      ${ivaLine}
      <hr>
      <p class="precio-final">✅ Precio Final: $ ${total.toLocaleString("es-AR")}</p>
    `;

    mostrarResultado(html, tipo);
  } catch (err) {
    console.error("⚠️ Error en calcularPrecio:", err);
    mostrarResultado(`<p class="alerta">⚠️ Error en la consulta</p>`, "");
  }
}

// ================================
// Mostrar resultado con clase dinámica
// ================================
function mostrarResultado(html, tipo) {
  const div = document.getElementById("resultado");
  div.innerHTML = html;

  // Resetear clases anteriores y aplicar color por tipo
  div.className = "";
  div.classList.add("resultado", tipo);
}

// ================================
// Helper nombres bonitos
// ================================
function formatearNombre(tipo) {
  switch (tipo) {
    case "mercadopago":  return "Mercado Pago";
    case "astroplay":    return "AstroPay";
    case "tarjeta_pesos":return "Tarjeta en pesos";
    case "tarjeta_usd":  return "Tarjeta en dólares";
    default:             return tipo;
  }
}

// ================================
// Inicializar
// ================================
document.addEventListener("DOMContentLoaded", () => {
  cargarCotizaciones();

  // Animaciones de aparición (si las usás)
  const faders = document.querySelectorAll(".fade-in");
  const appearOptions = { threshold: 0.2, rootMargin: "0px 0px -50px 0px" };

  const appearOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("appear");
      observer.unobserve(entry.target);
    });
  }, appearOptions);

  faders.forEach(fader => appearOnScroll.observe(fader));
});
// Detectar cuando el usuario hace scroll para mostrar la sección
window.addEventListener("scroll", function () {
  const section = document.querySelector(".como-funciona");
  const rect = section.getBoundingClientRect();

  // Cuando la sección esté visible en el viewport
  if (rect.top < window.innerHeight - 150) {
    section.classList.add("visible");
  }
});
