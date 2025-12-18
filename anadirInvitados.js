const API_BASE = "http://localhost:3001";

async function fetchMiBoda(id_usuario) {
  const res = await fetch(`${API_BASE}/api/bodas/mia/${id_usuario}`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Error obteniendo boda");
  return data.boda;
}

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("form-invitado");
  const msg = document.getElementById("msg-invitado");

  const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));
  if (!usuario) {
    window.location.href = "/login.html";
    return;
  }

  let boda;
  try {
    boda = await fetchMiBoda(usuario.id_usuario);
    if (!boda) {
      window.location.href = "/miBoda.html";
      return;
    }
  } catch (e) {
    console.error(e);
    window.location.href = "/miBoda.html";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const payload = {
      nombre: fd.get("nombre"),
      email: fd.get("email") || null,
      telefono: fd.get("telefono") || null,
      // confirmacion_asistencia: 0 por defecto, no hace falta enviarlo
    };

    try {
      const res = await fetch(`${API_BASE}/api/bodas/${boda.id_boda}/invitados`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error creando invitado");

      if (msg) msg.textContent = "Invitado añadido ✅";

      // mini pausa y vuelta al listado
      setTimeout(() => {
        window.location.href = "/invitados.html";
      }, 600);
    } catch (err) {
      console.error(err);
      if (msg) msg.textContent = "❌ No se pudo añadir el invitado";
    }
  });
});