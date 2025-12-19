const API_BASE = "http://localhost:3001";
let isSearching = false;


const PROVEEDOR_IMG_OVERRIDES = {
  41: "assets/proveedores/p1.jpg",
  38:  "assets/proveedores/p4.jpg",
  11:  "assets/proveedores/p3.jpg",
  34: "assets/proveedores/p5.jpg",
  37:  "assets/proveedores/p6.jpg",
  42:  "assets/proveedores/p7.jpg",
  18:  "assets/proveedores/p8.jpg",
  17:  "assets/proveedores/p9.jpg",
  57:  "assets/proveedores/p9.jpg",
  16:  "assets/proveedores/p10.jpg",
  59:  "assets/proveedores/p10.jpg",
  36:  "assets/proveedores/p11.jpg",
  8:  "assets/proveedores/p12.jpg",
  39:  "assets/proveedores/p13.jpg",
  9:  "assets/proveedores/p14.jpg",
  33:  "assets/proveedores/p15.jpg",
  32:  "assets/proveedores/p16.jpg",
};

const PROVEEDOR_IMGS = Array.from({ length: 20 }, (_, i) => `assets/proveedores/p${i + 1}.jpg`);



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
    .map((p) => {
      const img = imgParaProveedor(p);

      return `
        <article class="proveedor">
          <img class="proveedor-img" src="${img}" alt="${p.nombre_comercial}" loading="lazy">
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
      `;
    })
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

 
  if (initial.q || initial.where) {
    runSearch(initial);
  } else {
    clearResultadosUI();
  }
}






function imgParaProveedor(p) {
  const id = Number(p.id_proveedor);

  if (!Number.isFinite(id)) return IMG_FALLBACK;

  // 1️⃣ Override manual
  if (PROVEEDOR_IMG_OVERRIDES[id]) {
    return PROVEEDOR_IMG_OVERRIDES[id];
  }

  // 2️⃣ Reparto automático
  const index = id % PROVEEDOR_IMGS.length;
  return PROVEEDOR_IMGS[index] || IMG_FALLBACK;
}
const cards = document.querySelectorAll(".summary-card-lugares");

  cards.forEach(card => {
    card.addEventListener("click", () => {
      const categoria = card.dataset.categoria;

      if (!categoria) return;

      // Limpia inputs visualmente
      const qInput = document.getElementById("search-q");
      const whereInput = document.getElementById("search-where");
      if (qInput) qInput.value = categoria;
      if (whereInput) whereInput.value = "";

      // Lanza búsqueda
      runSearch({
        q: categoria,
        where: ""
      });
    });
  });

document.addEventListener("DOMContentLoaded", setupBuscadorProveedores);