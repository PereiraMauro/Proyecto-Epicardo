// ================================
// epic.js (Frontend)
// ================================

// IVA e impuestos
const IVA = 0.21;
const impuestoProvincial = 0.02;

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

    // Mostrar en la UI
    document.getElementById("mercadopago").innerText = `$ ${data.mercadopago}`;
    document.getElementById("astroplay").innerText = `$ ${data.astroplay}`;
    document.getElementById("tarjeta-pesos").innerText = `$ ${data.tarjeta_pesos}`;
    document.getElementById("tarjeta-usd").innerText = `$ ${data.tarjeta_usd}`;

    document.getElementById("fecha").innerText = new Date().toLocaleString();
  } catch (err) {
    console.error("⚠️ Error al cargar cotizaciones:", err);
  }
}

// ================================
// Calcular precio en pesos
// ================================
async function calcularPrecio() {
  const usd = parseFloat(document.getElementById("usd").value);
  const tipo = document.getElementById("tipo-pago").value;

  if (!usd || usd <= 0) {
    mostrarResultado(`<p class="alerta">⚠️ Ingresá un valor válido en USD.</p>`);
    return;
  }

  try {
    // Pido al backend que haga el cálculo con impuestos
    const resp = await fetch(`http://localhost:3000/api/precio/${usd}?tipo=${tipo}`);
    const data = await resp.json();

    if (data.error) {
      mostrarResultado(`<p class="alerta">⚠️ ${data.error}</p>`);
      return;
    }

    // Mostrar resultado
    const html = `
      <h3>📑 Resultado</h3>
      <p><b>${formatearNombre(tipo)}</b> ($ ${cotizaciones[tipo]})</p>
      <p>💵 Base: $ ${data.base}</p>
      <p>🏛️ IVA (21%): $ ${data.iva}</p>
      <p>🌐 Impuesto PAÍS (30%): $ ${data.pais}</p>
      <p>📊 Percepción (45%): $ ${data.percepcion}</p>
      <hr>
      <p class="precio-final">✅ Precio Final: $ ${data.total}</p>
    `;

    mostrarResultado(html);
  } catch (err) {
    console.error("⚠️ Error en calcularPrecio:", err);
    mostrarResultado(`<p class="alerta">⚠️ Error en la consulta</p>`);
  }
}

// ================================
// Mostrar resultado
// ================================
function mostrarResultado(html) {
  const div = document.getElementById("resultado");
  div.innerHTML = html;
}

// ================================
// Helper nombres bonitos
// ================================
function formatearNombre(tipo) {
  switch (tipo) {
    case "mercadopago": return "Mercado Pago";
    case "astroplay": return "AstroPay";
    case "tarjeta_pesos": return "Tarjeta en pesos";
    case "tarjeta_usd": return "Tarjeta en dólares";
    default: return tipo;
  }
}

// ================================
// Inicializar
// ================================
document.addEventListener("DOMContentLoaded", () => {
  cargarCotizaciones();

  // Animaciones de aparición
  const faders = document.querySelectorAll(".fade-in");
  const appearOptions = {
    threshold: 0.2,
    rootMargin: "0px 0px -50px 0px"
  };

  const appearOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("appear");
      observer.unobserve(entry.target);
    });
  }, appearOptions);

  faders.forEach(fader => appearOnScroll.observe(fader));
});
