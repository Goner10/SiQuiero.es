document.addEventListener("DOMContentLoaded", () => {
  pintarUsuarios();
  actualizarHeader();
});

function pintarUsuarios() {
  // Creamos una sección debajo del h1
  const section = document.createElement("section");
  const title = document.createElement("h2");
  title.textContent = "Usuarios registrados:";
  section.appendChild(title);

  const info = document.createElement("p");
  info.textContent = "Cargando usuarios...";
  section.appendChild(info);

  document.body.appendChild(section);

  fetch("http://localhost:3001/api/usuarios")
    .then(res => res.json())
    .then(usuarios => {
      if (!Array.isArray(usuarios) || usuarios.length === 0) {
        info.textContent = "No hay usuarios para mostrar.";
        return;
      }

      info.remove(); // quitamos el "Cargando usuarios..."

      const ul = document.createElement("ul");
      usuarios.forEach(u => {
        const li = document.createElement("li");
        li.textContent = `${u.nombre} ${u.apellidos} — ${u.email}`;
        ul.appendChild(li);
      });

      section.appendChild(ul);
    })
    .catch(err => {
      console.error("Error usuarios:", err);
      info.textContent = "Error cargando usuarios.";
    });
}

// Actualizar header según si el usuario está logueado
function actualizarHeader() {
  const header = document.querySelector(".header-right");
  header.innerHTML = ""; // Limpiamos botones por defecto

  const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));
  if (usuario) {
    // Si está logueado, mostrar iconos
    const heart = document.createElement("span");
    heart.textContent = "💜";
    heart.style.fontSize = "1.5rem";
    heart.style.marginRight = "0.8rem";

    const userIcon = document.createElement("span");
    userIcon.textContent = "👤";
    userIcon.style.fontSize = "1.5rem";
    userIcon.style.cursor = "pointer";

    const logoutBtn = document.createElement("button");
    logoutBtn.textContent = "Cerrar sesión";
    logoutBtn.style.marginLeft = "1rem";
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("usuarioLogueado");
      window.location.href = "/index.html";
    });

    header.appendChild(heart);
    header.appendChild(userIcon);
    header.appendChild(logoutBtn);
  } else {
    // Si no hay usuario logueado, mostrar botones normales
    const loginLink = document.createElement("a");
    loginLink.href = "/login.html";
    loginLink.textContent = "Accede";
    loginLink.className = "auth-link";

    const registerLink = document.createElement("a");
    registerLink.href = "/registro.html";
    registerLink.textContent = "Regístrate";
    registerLink.className = "auth-link auth-link--primary";

    header.appendChild(loginLink);
    header.appendChild(registerLink);
  }
}