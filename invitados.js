const API_BASE = "http://localhost:3001";

async function fetchMiBoda(id_usuario) {
  const res = await fetch(`${API_BASE}/api/bodas/mia/${id_usuario}`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Error obteniendo boda");
  return data.boda;
}

async function fetchInvitados(id_boda) {
  const res = await fetch(`${API_BASE}/api/bodas/${id_boda}/invitados`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Error obteniendo invitados");
  return data.invitados;
}

function estadoTexto(v) {
  return Number(v) === 1 ? "Confirmado" : "Pendiente";
}

function renderInvitados(invitados) {
  const list = document.getElementById("invitados-list");
  const info = document.getElementById("invitados-info");
  if (!list) return;

  const total = invitados.length;
  const confirmados = invitados.filter(i => Number(i.confirmacion_asistencia) === 1).length;

  if (info) info.textContent = `${confirmados} de ${total} confirmados`;

  if (total === 0) {
    list.innerHTML = `<p class="muted">Todavía no has añadido invitados.</p>`;
    return;
  }

  list.innerHTML = invitados.map(i => `
    <article class="invitado-card">
      <div class="invitado-main">
        <h3>${i.nombre}</h3>
        <p class="invitado-contacto">
          ${i.email ? `📩 ${i.email}` : ""}
          ${i.telefono ? ` · 📞 ${i.telefono}` : ""}
        </p>
      </div>
      <span class="badge ${Number(i.confirmacion_asistencia) === 1 ? "badge-ok" : "badge-pend"}">
        ${estadoTexto(i.confirmacion_asistencia)}
      </span>
    </article>
  `).join("");
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
      // si no tiene boda, lo mandas a crearla
      window.location.href = "/miBoda.html";
      return;
    }

    const invitados = await fetchInvitados(boda.id_boda);
    renderInvitados(invitados);
  } catch (e) {
    console.error(e);
    const list = document.getElementById("invitados-list");
    if (list) list.innerHTML = `<p class="muted">No se pudieron cargar los invitados.</p>`;
  }
});