const API_BASE = "http://localhost:3001";

async function fetchMiBoda(id_usuario) {
  const res = await fetch(`${API_BASE}/api/bodas/mia/${id_usuario}`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Error obteniendo boda");
  return data.boda;
}

async function fetchPresupuesto(id_boda) {
  const res = await fetch(`${API_BASE}/api/bodas/${id_boda}/presupuesto`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Error obteniendo presupuesto");
  return data.presupuesto;
}

async function updateLinea(id_presupuesto, cantidad_real) {
  const res = await fetch(`${API_BASE}/api/presupuesto/${id_presupuesto}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cantidad_real }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Error actualizando");
  return data;
}
async function addConcepto(id_boda, concepto) {
  const res = await fetch(`${API_BASE}/api/bodas/${id_boda}/presupuesto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ concepto }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Error añadiendo concepto");
  return data;
}
async function deleteLinea(id_presupuesto) {
  const res = await fetch(`${API_BASE}/api/presupuesto/${id_presupuesto}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Error eliminando");
  return data;
}

function euros(n) {
  return Number(n || 0).toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function renderPresupuesto(boda, items) {
  const info = document.getElementById("presupuesto-info");
  const list = document.getElementById("presupuesto-list");
  if (!list) return;

   const gastado = items.reduce((acc, x) => acc + Number(x.cantidad_real || 0), 0);
  const estimado = items.reduce((acc, x) => acc + Number(x.cantidad_estimada || 0), 0);
  const totalBoda = Number(boda?.presupuesto_total || 0);

  if (info) {
    info.textContent = `Presupuesto total: ${euros(totalBoda)} € · Gastado: ${euros(gastado)} €`;
  }

  list.innerHTML = items
    .map(
      (x) => `
    <article class="presupuesto-item" data-id="${x.id_presupuesto}">
      <div>
        <h3>${x.concepto}</h3>
        <p class="muted">Estimado: ${x.cantidad_estimada == null ? "-" : euros(x.cantidad_estimada)} €</p>
      </div>

   <div class="presupuesto-real">
  <label class="muted">Gastado (€)</label>
  <div class="presupuesto-actions">
    <input class="presupuesto-input" type="number" min="0" step="0.01"
      value="${x.cantidad_real == null ? "" : Number(x.cantidad_real)}"
      placeholder="0.00" />
    <button class="btn-save" type="button">Guardar</button>
    <button class="btn-delete" type="button" title="Eliminar">❌</button>
  </div>
  <small class="save-hint muted"></small>
</div>
    </article>
  `
    )
    .join("");
}

function hookInputs(boda) {
  const id_boda = boda.id_boda;

  document.querySelectorAll(".presupuesto-item").forEach((card) => {
    const id = Number(card.dataset.id);
    const input = card.querySelector(".presupuesto-input");
    const btnSave = card.querySelector(".btn-save");
    const btnDelete = card.querySelector(".btn-delete");
    const hint = card.querySelector(".save-hint");

    if (btnSave && input) {
      btnSave.addEventListener("click", async () => {
        const value = input.value === "" ? null : Number(input.value);

        try {
          btnSave.disabled = true;
          if (hint) hint.textContent = "Guardando...";
          await updateLinea(id, value);
          if (hint) hint.textContent = "✅ Guardado";

          const refreshed = await fetchPresupuesto(id_boda);
          renderPresupuesto(boda, refreshed);
          hookInputs(boda);
        } catch (e) {
          console.error(e);
          if (hint) hint.textContent = "❌ Error";
        } finally {
          btnSave.disabled = false;
          setTimeout(() => { if (hint) hint.textContent = ""; }, 1200);
        }
      });
    }

    if (btnDelete) {
      btnDelete.addEventListener("click", async () => {
        if (!confirm("¿Eliminar este concepto del presupuesto?")) return;

        try {
          btnDelete.disabled = true;
          if (hint) hint.textContent = "Eliminando...";
          await deleteLinea(id);
          if (hint) hint.textContent = "✅ Eliminado";

          const refreshed = await fetchPresupuesto(id_boda);
          renderPresupuesto(boda, refreshed);
          hookInputs(boda);
        } catch (e) {
          console.error(e);
          if (hint) hint.textContent = "❌ Error";
        } finally {
          btnDelete.disabled = false;
          setTimeout(() => { if (hint) hint.textContent = ""; }, 1200);
        }
      });
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));
  if (!usuario) {
    window.location.href = "/login.html";
    return;
  }

  try {
    const boda = await fetchMiBoda(usuario.id_usuario);
    if (!boda) {
      window.location.href = "/miBoda.html";
      return;
    }

    const items = await fetchPresupuesto(boda.id_boda);
    renderPresupuesto(boda, items);
    hookInputs(boda);
    const select = document.getElementById("nuevo-concepto");
    const btnAdd = document.getElementById("btn-add-concepto");

if (btnAdd && select) {
  btnAdd.addEventListener("click", async () => {
    const concepto = select.value;
    if (!concepto) return;

    try {
      await addConcepto(boda.id_boda, concepto);
      const refreshed = await fetchPresupuesto(boda.id_boda);
      renderPresupuesto(boda, refreshed);
      hookInputs(boda);
      select.value = "";
    } catch (e) {
      console.error(e);
      alert("No se pudo añadir el concepto");
    }
  });
}
    hookInputs(boda.id_boda);
  } catch (e) {
    console.error(e);
    const list = document.getElementById("presupuesto-list");
    if (list) list.innerHTML = `<p class="muted">No se pudo cargar el presupuesto.</p>`;
  }
});