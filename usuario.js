document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));

  if (!usuario) {
    window.location.href = "/login.html";
    return;
  }

  document.getElementById("user-nombre").textContent = usuario.nombre || "-";
  document.getElementById("user-apellidos").textContent = usuario.apellidos || "-";
  document.getElementById("user-email").textContent = usuario.email || "-";
});