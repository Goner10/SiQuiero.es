document.addEventListener("DOMContentLoaded", () => {
  pintarUsuarios();
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