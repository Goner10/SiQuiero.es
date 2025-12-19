const API_BASE = "http://localhost:3001";
let isSearching = false;

const NOVIO_IMG_OVERRIDES = {
  65: "assets/novios/traje1.jpg",    // Félix Ramiro
  66: "assets/novios/traje2.jpg",    // Innupcial
  67: "assets/novios/traje3.jpg",    // Sastrería Casanova
  68: "assets/novios/traje4.jpg",    // Roma Hombre
  69: "assets/novios/traje5.jpg",    // Paco Roca
  70: "assets/novios/complementos1.jpg",  // Protocolo
  71: "assets/novios/complementos2.jpg",  // Minerva & Co
  72: "assets/novios/complementos3.jpg",  // Fósforo Square
  73: "assets/novios/complementos4.jpg",  // Mr. Pajarita
  74: "assets/novios/complementos5.jpg",  // Botones de Plata (joyería compartida)
};

function imgParaNovio(p) {
  const id = Number(p.id_proveedor);
  return NOVIO_IMG_OVERRIDES[id] || "assets/novios/default.jpg";
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

function renderNovios(items) {
  const cont = document.getElementById("proveedores-list");
  const info = document.getElementById("proveedores-info");
  if (!cont) return;

  if (info) info.textContent = `${items.length} resultados para novio`;

  cont.innerHTML = items
    .map((p) => {
      const img = imgParaNovio(p);
      return `
        <article class="proveedor">
          <img class="proveedor-img" src="${img}" alt="${p.nombre_comercial}" loading="lazy">
          <div class="info">
            <h2>${p.nombre_comercial}</h2>
            <p class="ubicacion">${p.ubicacion ?? "Ubicación no indicada"}</p>
            <p class="descripcion">${p.descripcion ?? "Especialistas en servicios para novio"}</p>
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
async function buscarServiciosNovio({ q, where }) {
  const url = `${API_BASE}/api/buscar-proveedores?q=${encodeURIComponent(
    q
  )}&where=${encodeURIComponent(where)}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.ok) throw new Error(data.error || "Error al buscar servicios para novio");

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
    const items = await buscarServiciosNovio({ q, where });
    renderNovios(items);
  } catch (err) {
    console.error(err);
    clearResultadosUI();
    const info = document.getElementById("proveedores-info");
    if (info) info.textContent = "No se pudieron cargar los servicios de novio";
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
function setupBuscadorNovios() {
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

document.addEventListener("DOMContentLoaded", setupBuscadorNovios);