const API_BASE = "http://localhost:3001";
let isSearching = false;

// Imágenes por id de proveedor
const NOVIA_IMG_OVERRIDES = {
  43: "assets/novias/traje1.jpg",       // La Bohème 1994
  44: "assets/novias/traje2.jpg",       // NBlanc Novies
  45: "assets/novias/traje3.jpg",       // Innupcial
  46: "assets/novias/traje4.jpg",       // Sedka Novias
  47: "assets/novias/traje5.jpg",      // Art Nupcial
  48: "assets/novias/zapatos1.jpg",    // Paco Gil
  49: "assets/novias/zapatos2.jpg",    // Miss Honolulu Shoes
  50: "assets/novias/zapatos3.jpg",    // Larranga Shoes
  51: "assets/novias/zapatos4.jpg",    // Uniqshoes
  52: "assets/novias/complementos1.jpg",
  53: "assets/novias/complementos2.jpg",
  54: "assets/novias/complementos3.jpg",
  55: "assets/novias/complementos4.jpg",
  56: "assets/novias/joyeria1.jpg",    // Bardisa Atelier
  57: "assets/novias/joyeria2.jpg",    // De Dios Joyas
  58: "assets/novias/joyeria3.jpg",    // Eme Jewels
  59: "assets/novias/joyeria4.jpg",    // Irene Zaera
  60: "assets/novias/joyeria5.jpg",    // Vazón
  61: "assets/novias/belleza1.jpg",    // El tocador de Jesús Sáez
  62: "assets/novias/belleza2.jpg",    // Goa Makeup
  63: "assets/novias/belleza3.jpg",    // Natalia Anaya
  64: "assets/novias/belleza4.jpg",    // Clara Muñoz
  74: "assets/novios/complementos5.jpg",  // Botones de Plata (joyería compartida)
};

function imgParaNovia(p) {
  const id = Number(p.id_proveedor);
  return NOVIA_IMG_OVERRIDES[id] || "assets/novias/default.jpg";
}

/* =============================
   UI Helpers
============================= */
function clearResultadosUI() {
  const cont = document.getElementById("proveedores-list");
  const info = document.getElementById("proveedores-info");
  if (cont) cont.innerHTML = "";
  if (info) info.textContent = "";
}

function renderNovias(items) {
  const cont = document.getElementById("proveedores-list");
  const info = document.getElementById("proveedores-info");
  if (!cont) return;

  if (info) info.textContent = `${items.length} resultados para novia`;

  cont.innerHTML = items
    .map((p) => {
      const img = imgParaNovia(p);
      return `
        <article class="proveedor">
          <img class="proveedor-img" src="${img}" alt="${p.nombre_comercial}" loading="lazy">
          <div class="info">
            <h2>${p.nombre_comercial}</h2>
            <p class="ubicacion">${p.ubicacion ?? "Ubicación no indicada"}</p>
            <p class="descripcion">${p.descripcion ?? "Especialistas en servicios para novia"}</p>
            <p class="precio">Desde ${p.tarifa_minima ?? "-"}€</p>
            <a href="proveedor.html?id=${p.id_proveedor}" class="boton">Ver detalles</a>
          </div>
        </article>
      `;
    })
    .join("");
}

/* =============================
   API
============================= */
async function buscarServiciosNovia({ q, where }) {
  const url = `${API_BASE}/api/buscar-proveedores?q=${encodeURIComponent(
    q
  )}&where=${encodeURIComponent(where)}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.ok) throw new Error(data.error || "Error al buscar servicios para novia");

  return data.data;
}

/* =============================
   Search flow
============================= */
async function runSearch({ q, where }) {
  if (isSearching) return;
  isSearching = true;

  if (!q && !where) {
    clearResultadosUI();
    isSearching = false;
    return;
  }

  setQueryParams({ q, where });

  try {
    const items = await buscarServiciosNovia({ q, where });
    renderNovias(items);
  } catch (err) {
    console.error(err);
    clearResultadosUI();
    const info = document.getElementById("proveedores-info");
    if (info) info.textContent = "No se pudieron cargar los servicios de novia";
  } finally {
    isSearching = false;
  }
}

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    q: (params.get("q") || "").trim(),
    where: (params.get("where") || "").trim(),
  };
}

function setQueryParams({ q, where }) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (where) params.set("where", where);

  const newUrl =
    window.location.pathname + (params.toString() ? "?" + params.toString() : "");
  window.history.replaceState({}, "", newUrl);
}

/* =============================
   Init
============================= */
function setupBuscadorNovias() {
  const form = document.querySelector(".hero-search");
  if (!form) return;

  const qInput = document.getElementById("search-q");
  const whereInput = document.getElementById("search-where");

  const initial = getQueryParams();
  if (qInput) qInput.value = initial.q;
  if (whereInput) whereInput.value = initial.where;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopPropagation();
    runSearch({ q: qInput.value.trim(), where: whereInput.value.trim() });
  });

  const cards = document.querySelectorAll(".summary-card-lugares");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const categoria = card.dataset.categoria;
      if (!categoria) return;
      if (qInput) qInput.value = categoria;
      if (whereInput) whereInput.value = "";
      runSearch({ q: categoria, where: "" });
    });
  });

  if (initial.q || initial.where) runSearch(initial);
  else clearResultadosUI();
}

document.addEventListener("DOMContentLoaded", setupBuscadorNovias);