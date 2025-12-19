const API_BASE = "http://localhost:3001";

/* ==============================
   IMÁGENES
================================ */
const IMAGEN_POR_LUGAR = {
  "complejo miravalle": "assets/lugares/lugarmadrid1.jpg",
  "hotel palace madrid": "assets/lugares/lugarmadrid2.jpg",
  "finca la alquería": "assets/lugares/lugarmadrid3.jpg",
  "masía san antonio de poyo": "assets/lugares/lugarvalencia1.jpg",
  "nou racó": "assets/lugares/lugarvalencia2.jpg",
  "vistalegre": "assets/lugares/lugarvalencia3.jpg",
  "masía campo aníbal": "assets/lugares/lugarvalencia4.jpg",
  "finca mas solers": "assets/lugares/lugarbarcelona1.jpg",
  "hotel w barcelona": "assets/lugares/lugarbarcelona2.jpg",
  "masía can cortada": "assets/lugares/lugarbarcelona3.jpg",
  "hacienda san rafael": "assets/lugares/lugarsevilla1.jpg",
  "masía san javier": "assets/lugares/lugarmurcia1.jpg",
  "finca la torre": "assets/lugares/lugarmurcia2.jpg",
  "hacienda el palmar": "assets/lugares/lugarmurcia3.jpg",
  "hotel bonalba alicante": "assets/lugares/lugaralicante1.jpg",
  "hacienda la vega": "assets/lugares/lugaralicante2.jpg",
  "finca villa antonia": "assets/lugares/lugaralicante3.jpg",
  "cortijo el maizal": "assets/lugares/lugargranada1.jpg",
  "bodega gonzález byass": "assets/lugares/lugarcadiz1.jpg",
  "finca el molino": "assets/lugares/lugaroviedo1.jpg",
  "palacio de la concepción": "assets/lugares/lugarzaragoza1.jpg"
};

const IMG_DEFAULT = "assets/lugares/default.jpg";


/* ==============================
   URL PARAMS
================================ */

function getParams() {
  const p = new URLSearchParams(window.location.search);
  return {
    q: (p.get("q") || "").trim(),
    where: (p.get("where") || "").trim()
  };
}

function setParams({ q = "", where = "" }) {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (where) p.set("where", where);
  history.replaceState({}, "", `${location.pathname}?${p.toString()}`);
}

/* ==============================
   HELPERS
================================ */
function imagenLugar(lugar) {
  if (!lugar.nombre) return IMG_DEFAULT;

  const nombre = lugar.nombre.toLowerCase().trim();

  return IMAGEN_POR_LUGAR[nombre] || IMG_DEFAULT;
}

function limpiarResultados(mensaje = "") {
  const list = document.getElementById("lugares-list");
  const info = document.getElementById("lugares-info");

  if (list) list.innerHTML = "";
  if (info) info.textContent = mensaje;
}

/* ==============================
   RENDER
================================ */
function renderLugares(items) {
  const list = document.getElementById("lugares-list");
  const info = document.getElementById("lugares-info");

  if (!list || !info) return;

  if (!items.length) {
    limpiarResultados("No se encontraron resultados");
    return;
  }

  info.textContent = `${items.length} resultados`;

  list.innerHTML = items.map(l => `
    <article class="lugar">
     <img src="${imagenLugar(l)}"
  alt="${l.nombre}"
  loading="lazy"
  onerror="this.src='assets/lugares/default.jpg'"
>
      <div class="info">
        <h2>${l.nombre}</h2>
        <p class="ubicacion">${l.ubicacion || ""}</p>
        <p class="descripcion">${l.descripcion || ""}</p>
        <p class="precio">Desde ${l.precio_minimo ?? "-"}€</p>
        <a href="lugar.html?id=${l.id_lugar}" class="boton">
          Solicitar Presupuesto
        </a>
      </div>
    </article>
  `).join("");
}

/* ==============================
   API
================================ */
async function buscarLugares({ q, where }) {
  const params = new URLSearchParams();
  if (q) params.append("q", q);
  if (where) params.append("where", where);

  const res = await fetch(`${API_BASE}/api/buscar-lugares?${params}`);
  const data = await res.json();

  if (!data.ok) {
    throw new Error(data.error || "Error en búsqueda");
  }

  return data.data;
}

/* ==============================
   INIT
================================ */
document.addEventListener("DOMContentLoaded", () => {

  /* CONTADORES DE CIUDADES */
  async function cargarContadoresCiudades() {
    try {
      const res = await fetch(`${API_BASE}/api/contador-lugares`);
      const data = await res.json();
      if (!data.ok) return;

      data.data.forEach(row => {
        const ciudad = row.ciudad.trim(); // SIN TILDES
        const el = document.querySelector(
          `.contador-ciudad[data-ciudad="${ciudad}"]`
        );
        if (el) el.textContent = row.total;
      });
    } catch (err) {
      console.error("Error cargando contadores:", err);
    }
  }

  /* BUSCADOR */
  const form = document.querySelector(".hero-search");
  if (form) {
    const inputs = form.querySelectorAll("input");
    if (inputs.length >= 2) {
      const [qInput, whereInput] = inputs;
      const initial = getParams();

      qInput.value = initial.q;
      whereInput.value = initial.where;

      form.addEventListener("submit", e => {
        e.preventDefault();
        setParams({
          q: qInput.value.trim(),
          where: whereInput.value.trim()
        });
        ejecutarBusqueda();
      });
    }
  }

  /* CLICK EN CIUDADES */
  document.querySelectorAll(".summary-card-lugares").forEach(card => {
    card.addEventListener("click", () => {
      const where = card.dataset.where;
      if (!where) return;
      setParams({ where });
      ejecutarBusqueda();
    });
  });

  async function ejecutarBusqueda() {
    const params = getParams();
    try {
      const lugares = await buscarLugares(params);
      renderLugares(lugares);
    } catch {
      limpiarResultados("No se pudieron cargar los resultados");
    }
  }

  /* BÚSQUEDA INICIAL */
  const initial = getParams();
  if (initial.q || initial.where) {
    ejecutarBusqueda();
  }

  cargarContadoresCiudades();
});