const API_BASE = "http://localhost:3001";

function formatFechaES(isoDate) {
  const d = new Date(isoDate);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
}

function getCountdownParts(fechaISO) {
  const target = new Date(fechaISO).getTime();
  const now = Date.now();
  let diff = Math.max(0, target - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * (1000 * 60 * 60 * 24);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * (1000 * 60 * 60);
  const mins = Math.floor(diff / (1000 * 60));
  diff -= mins * (1000 * 60);
  const secs = Math.floor(diff / 1000);

  return { days, hours, mins, secs };
}

async function fetchMiBoda(id_usuario) {
  const res = await fetch(`${API_BASE}/api/bodas/mia/${id_usuario}`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Error obteniendo boda");
  return data.boda; // puede ser null
}

async function fetchResumen(id_boda) {
  const res = await fetch(`${API_BASE}/api/bodas/${id_boda}/resumen`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Error obteniendo resumen");
  return data.resumen;
}

function showForm() {
  const crear = document.getElementById("crear-boda");
  const dash = document.getElementById("boda-dashboard");
  if (crear) crear.style.display = "block";
  if (dash) dash.style.display = "none";
}

function renderDashboard({ usuarioNombre, boda, resumen }) {
  const crear = document.getElementById("crear-boda");
  const dash = document.getElementById("boda-dashboard");

  if (crear) crear.style.display = "none";
  if (!dash) return;

  dash.style.display = "block";

  const fechaTxt = formatFechaES(boda.fecha_evento);
  const c = getCountdownParts(boda.fecha_evento);

  dash.innerHTML = `
    <section class="wedding-summary">
      <h2>Todo sobre tu boda</h2>

      <div class="summary-cards">
        <div class="summary-card">
          <h3>${usuarioNombre}</h3>
          <p class="summary-date">${fechaTxt}</p>
          <div class="summary-countdown" id="countdown">
            <div>${c.days}</strong><span>días</span></div>
            <div>${c.hours}</strong><span>horas</span></div>
            <div>${c.mins}</strong><span>min</span></div>
            <div>${c.secs}</strong><span>s</span></div>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon">📋</div>
          <p><strong>${resumen.serviciosContratados}</strong></p>
          <span class="summary-label"><a href="servicios.html">Servicios contratados</a></span>
        </div>

        <div class="summary-card">
          <div class="summary-icon">📑</div>
          <p><strong>${resumen.tareasCompletadas} de ${resumen.tareasTotal}</strong></p>
          <span class="summary-label"><a href="tareas.html">Tareas completadas</a></span>
        </div>

        <div class="summary-card">
          <div class="summary-icon">🧍‍♀️</div>
          <p><strong>${resumen.invitadosConfirmados} de ${resumen.invitadosTotal}</strong></p>
          <span class="summary-label"><a href="invitados.html">Invitados confirmados</a></span>
        </div>

        <div class="summary-card">
          <div class="summary-icon">🧮</div>
          <p><strong>${resumen.presupuestoGastado.toLocaleString("es-ES")} €</strong></p>
          <span class="summary-label"><a href="presupuesto.html">Presupuesto gastado</a></span>
        </div>
      </div>
    </section>
  `;

  // Actualiza countdown cada segundo
  const countdownEl = document.getElementById("countdown");
  const timer = setInterval(() => {
    if (!countdownEl) return clearInterval(timer);
    const p = getCountdownParts(boda.fecha_evento);
    countdownEl.innerHTML = `
      <div><strong>${p.days}</strong><span>días</span></div>
      <div><strong>${p.hours}</strong><span>horas</span></div>
      <div><strong>${p.mins}</strong><span>min</span></div>
      <div><strong>${p.secs}</strong><span>s</span></div>
    `;
  }, 1000);
}

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("form-boda");
  const msg = document.getElementById("msg");

  const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));
  if (!usuario) {
    window.location.href = "/login.html";
    return;
  }

  // 1) Si ya existe boda -> dashboard
  try {
    const boda = await fetchMiBoda(usuario.id_usuario);
    if (boda) {
      const resumen = await fetchResumen(boda.id_boda);
      renderDashboard({ usuarioNombre: usuario.nombre || "Usuario", boda, resumen });
    } else {
      showForm();
    }
  } catch (err) {
    console.error(err);
    showForm();
  }

  if (!form) return;

  // 2) Crear boda -> quedarse aquí y pintar dashboard
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const payload = {
      id_usuario: usuario.id_usuario,
      nombre_evento: fd.get("nombre_evento"),
      fecha_evento: fd.get("fecha_evento"),
      ubicacion: fd.get("ubicacion") || null,
      num_invitados: fd.get("num_invitados") ? Number(fd.get("num_invitados")) : null,
      presupuesto_total: fd.get("presupuesto_total") ? Number(fd.get("presupuesto_total")) : null,
    };

    try {
      const res = await fetch(`${API_BASE}/api/bodas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error creando boda");

     if (msg) {
     msg.textContent = "✅ Has creado tu boda correctamente";
     msg.classList.add("success");
      }

    const crear = document.getElementById("crear-boda");

    // pequeña pausa para que el usuario lo lea
     setTimeout(async () => {
      if (crear) crear.classList.add("fade-out");

    // espera a que termine la animación
      setTimeout(async () => {
      const boda = await fetchMiBoda(usuario.id_usuario);
      const resumen = await fetchResumen(boda.id_boda);

      renderDashboard({
      usuarioNombre: usuario.nombre || "Usuario",
      boda,
      resumen
    });

    const dash = document.getElementById("boda-dashboard");
    if (dash) dash.classList.add("fade-in");
     }, 350);
    }, 900);
    } catch (err) {
      console.error(err);
      if (msg) msg.textContent = "❌ No se pudo crear la boda";
    }
  });
});