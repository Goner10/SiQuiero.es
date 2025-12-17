const API_BASE = "http://localhost:3001";
let isSearching = false;

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

function clearResultadosUI() {
  const cont = document.getElementById("proveedores-list");
  const info = document.getElementById("proveedores-info");
  if (cont) cont.innerHTML = "";
  if (info) info.textContent = "";
}

function renderProveedores(items) {
  const cont = document.getElementById("proveedores-list");
  const info = document.getElementById("proveedores-info");
  if (!cont) return;

  if (info) info.textContent = `${items.length} resultados`;

  cont.innerHTML = items
    .map(
      (p) => `
    <article class="proveedor">
      <div class="info">
        <h2>${p.nombre_comercial}</h2>
        <p class="ubicacion">${p.ubicacion ?? "-"}</p>
        <p class="descripcion">${p.descripcion ?? ""}</p>
        <p class="precio">Desde ${p.tarifa_minima ?? "-"}€</p>
        <a href="proveedor.html?id=${p.id_proveedor}" class="boton">
          Solicitar Presupuesto
        </a>
      </div>
    </article>
  `
    )
    .join("");
}

async function buscarProveedores({ q, where }) {
  const url = `${API_BASE}/api/buscar-proveedores?q=${encodeURIComponent(
    q
  )}&where=${encodeURIComponent(where)}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.ok) {
    throw new Error(data.error || "Error en búsqueda");
  }

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
    const items = await buscarProveedores({ q, where });
    renderProveedores(items);
  } catch (err) {
    console.error(err);
    clearResultadosUI();
    const info = document.getElementById("proveedores-info");
    if (info) info.textContent = "No se pudieron cargar los resultados";
  } finally {
    isSearching = false;
  }
}

function setupBuscadorProveedores() {
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

    const q = (qInput?.value || "").trim();
    const where = (whereInput?.value || "").trim();

    runSearch({ q, where });
  });

  // ✅ SOLO auto-busca si vienes desde index con parámetros
  if (initial.q || initial.where) {
    runSearch(initial);
  } else {
    clearResultadosUI();
  }
}

document.addEventListener("DOMContentLoaded", setupBuscadorProveedores);