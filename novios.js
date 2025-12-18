const API_BASE = "http://localhost:3001";
let isSearching = false;

// Para trajes y complementos de novio (ID categoria = 11 y 12)
const NOVIO_IMGS = {
  "Trajes de novio": "assets/novios/trajes.jpg",
  "Complementos de novio": "assets/novios/complementos.jpg",
  "Joyería": "assets/novias/joyeria.jpg"
};

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

  const newUrl = window.location.pathname + (params.toString() ? "?" + params.toString() : "");
  window.history.replaceState({}, "", newUrl);
}

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
      const img = NOVIO_IMGS[p.nombre_categoria] || "assets/novios/trajes.jpg";
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

async function buscarServiciosNovio({ q, where }) {
  const url = `${API_BASE}/api/buscar-proveedores?q=${encodeURIComponent(q)}&where=${encodeURIComponent(where)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Error al buscar servicios para novio");
  return data.data;
}

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