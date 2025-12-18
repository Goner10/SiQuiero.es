const API_BASE = "http://localhost:3001";
let isSearching = false;

/**
 * Imágenes específicas para NOVIA
 * Puedes ajustar IDs según tus proveedores reales
 */
const NOVIA_IMG_OVERRIDES = {
  1: "assets/novia/traje1.jpg",
  2: "assets/novia/zapatos1.jpg",
  3: "assets/novia/complementos1.jpg",
  4: "assets/novia/anillos1.jpg",
  5: "assets/novia/belleza1.jpg",
};

const NOVIA_IMGS = [
  "assets/novia/traje2.jpg",
  "assets/novia/zapatos2.jpg",
  "assets/novia/complementos2.jpg",
  "assets/novia/anillos2.jpg",
  "assets/novia/belleza2.jpg",
];

/* ===========================
   Query params
=========================== */

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
    window.location.pathname +
    (params.toString() ? "?" + params.toString() : "");

  window.history.replaceState({}, "", newUrl);
}

/* ===========================
   UI helpers
=========================== */

function clearResultadosUI() {
  const cont = document.getElementById("proveedores-list");
  const info = document.getElementById("proveedores-info");
  if (cont) cont.innerHTML = "";
  if (info) info.textContent = "";
}

function imgParaNovia(p) {
  const id = Number(p.id_proveedor);
  if (Number.isFinite(id) && NOVIA_IMG_OVERRIDES[id]) {
    return NOVIA_IMG_OVERRIDES[id];
  }

  const index = Math.abs(id) % NOVIA_IMGS.length;
  return NOVIA_IMGS[index];
}

/* ===========================
   Render
=========================== */

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
          <img 
            class="proveedor-img"
            src="${img}" 
            alt="${p.nombre_comercial}" 
            loading="lazy"
          >
          <div class="info">
            <h2>${p.nombre_comercial}</h2>
            <p class="ubicacion">${p.ubicacion ?? "Ubicación no indicada"}</p>
            <p class="descripcion">
              ${p.descripcion ?? "Especialistas en servicios para novia"}
            </p>
            <p class="precio">
              Desde ${p.tarifa_minima ?? "-"}€
            </p>
            <a href="proveedor.html?id=${p.id_proveedor}" class="boton">
              Ver detalles
            </a>
          </div>
        </article>
      `;
    })
    .join("");
}

/* ===========================
   API
=========================== */

async function buscarServiciosNovia({ q, where }) {
  const url = `${API_BASE}/api/buscar-proveedores?q=${encodeURIComponent(
    q
  )}&where=${encodeURIComponent(where)}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.ok) {
    throw new Error(data.error || "Error al buscar servicios para novia");
  }

  return data.data;
}

/* ===========================
   Search flow
=========================== */

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

/* ===========================
   Init
=========================== */

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

    runSearch({
      q: (qInput?.value || "").trim(),
      where: (whereInput?.value || "").trim(),
    });
  });

  // Click en tarjetas de categorías de novia
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

  if (initial.q || initial.where) {
    runSearch(initial);
  } else {
    clearResultadosUI();
  }
}

document.addEventListener("DOMContentLoaded", setupBuscadorNovias);