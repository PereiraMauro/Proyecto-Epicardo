// IVA e impuestos
const IVA = 0.21;
let impuestoProvincial = 0.02; // 2%

// Variable global para cotizaciones
let cotizaciones = {};

// ================================
// Cargar cotizaciones desde backend
// ================================
async function cargarCotizaciones() {
  try {
    const resp = await fetch("http://localhost:3000/api/cotizaciones");
    const data = await resp.json();
    cotizaciones = data;

    console.log("Datos recibidos del backend:", data);

    // Mostrar en la interfaz
    document.getElementById("dolar-oficial").innerText = `$ ${data.oficial}`;
    document.getElementById("dolar-blue").innerText = `$ ${data.blue}`;
    document.getElementById("dolar-tarjeta").innerText = `$ ${data.tarjeta}`;
    document.getElementById("dolar-mayorista").innerText = `$ ${data.mayorista}`;
    document.getElementById("dolar-cripto").innerText = `$ ${data.cripto}`;

    document.getElementById("fecha").innerText = new Date().toLocaleString();
  } catch (err) {
    console.error("Error al cargar cotizaciones:", err);
  }
}

// ================================
// Calcular precio en pesos
// ================================
function calcularPrecio() {
  const usd = parseFloat(document.getElementById("usd").value);
  const tipo = document.getElementById("tipo-dolar").value;

  if (!usd || usd <= 0) {
    mostrarResultado(
      `<p class="alerta">⚠️ Ingresá un valor válido en USD.</p>`,
      null
    );
    return;
  }

  // Verificar cotización
  const cotizacion = cotizaciones[tipo];
  if (!cotizacion) {
    mostrarResultado(
      `<p class="alerta">⚠️ Cotización para "${tipo}" no disponible.</p>`,
      null
    );
    return;
  }

  // Cálculos
  const baseArs = usd * cotizacion;
  const iva = baseArs * IVA;
  const prov = baseArs * impuestoProvincial;
  const precioFinal = baseArs + iva + prov;

  // Generar HTML del resultado
  const html = `
    <h3>📑 Resultado</h3>
    <p><b class="dolar-${tipo}">${tipo.toUpperCase()}</b> ($ ${cotizacion})</p>
    <p>💵 Base: $ ${baseArs.toLocaleString()}</p>
    <p>🏛️ IVA (21%): $ ${iva.toLocaleString()}</p>
    <p>🌐 Impuesto Provincial (2%): $ ${prov.toLocaleString()}</p>
    <hr>
    <p class="precio-final">✅ Precio Final: $ ${precioFinal.toLocaleString()}</p>
  `;

  mostrarResultado(html, tipo);
}

// ================================
// Mostrar resultado con clase según tipo
// ================================
function mostrarResultado(html, tipo) {
  const div = document.getElementById("resultado");
  div.innerHTML = html;

  // Resetear clases previas
  div.className = "card resultado";
  if (tipo) {
    div.classList.add(tipo.toLowerCase());
  }
}

// ================================
// Inicializar
// ================================
document.addEventListener("DOMContentLoaded", cargarCotizaciones);


// Animaciones al hacer scroll
document.addEventListener("DOMContentLoaded", () => {
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

  faders.forEach(fader => {
    appearOnScroll.observe(fader);
  });
});
// ================================