document.addEventListener("DOMContentLoaded", () => {
  //pintarUsuarios();
  actualizarHeader();
  marcarNavActivo();
  
  const bienvenida = document.getElementById("welcome-msg");
  const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));
  const loginReciente = sessionStorage.getItem("loginReciente");

  if (bienvenida && usuario && loginReciente) {
    bienvenida.textContent = `Bienvenido de vuelta ${usuario.nombre}!👋`;
    bienvenida.style.color = "#5EE089";
    bienvenida.style.fontSize = "1.5rem";
    sessionStorage.removeItem("loginReciente");
  }

  setupRegistroForm();
  setupLoginForm();
  initCarousel();
});


function setupRegistroForm() {
  const form = document.getElementById("register-form");
  const msg = document.getElementById("register-msg");

  // Si no estoy en registro.html, no hago nada
  if (!form || !msg) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = form.nombre.value;
    const apellidos = form.apellidos.value;
    const email = form.email.value;
    const password = form.password.value;
    const telefono = form.telefono.value;

    try {
      const res = await fetch("http://localhost:3001/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, apellidos, email, password, telefono })
      });

      const data = await res.json();

      if (data.ok) {
       msg.textContent = "¡Te has registrado!";
       msg.style.color = "green";
       form.reset();
       //  más adelante aquí haremos: window.location.href = "/usuario.html";
      } else {
      msg.textContent = data.error || "Error al registrar.";
      msg.style.color = "red";
      }
    } catch (err) {
      console.error(err);
      msg.textContent = "Error al registrar. Inténtalo de nuevo.";
      msg.style.color = "red";
    }
  });
}




 function setupLoginForm() {
  const form = document.getElementById("login-form");
  const msg = document.getElementById("login-msg");

  if (!form || !msg) return; // si no estoy en login.html, nada

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.email.value;
    const password = form.password.value;

    try {
      const res = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.ok) {
        // Guardamos el usuario en localStorage
        localStorage.setItem("usuarioLogueado", JSON.stringify(data.usuario));
        sessionStorage.setItem("loginReciente", "true");
        // Redirigimos al index (más adelante a usuario.html)
        window.location.href = "/index.html";
      } else {
        msg.textContent = data.error || "Email o contraseña incorrectos";
        msg.style.color = "red";
      }
    } catch (err) {
      console.error(err);
      msg.textContent = "Error al conectar con el servidor";
      msg.style.color = "red";
    }
  });
}




// Actualizar header según si el usuario está logueado
function actualizarHeader() {
  const header = document.querySelector(".header-right");
   if (!header) return;
  header.innerHTML = "";

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
    logoutBtn.style.padding = "10px";
    logoutBtn.style.border = "1px solid #fff";
    logoutBtn.style.color = "#ffffff";
    logoutBtn.style.backgroundColor = "#5EE089"
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




function marcarNavActivo() {
  const links = document.querySelectorAll(".main-nav .nav-link");
  if (!links.length) return;

  const current = window.location.pathname.split("/").pop() || "index.html";

  links.forEach(link => {
    link.classList.remove("nav-link--active");

    const href = link.getAttribute("href");
    if (!href) return;

    if (href.split("/").pop() === current) {
      link.classList.add("nav-link--active");
    }
  });
}




function initCarousel() {
  const track = document.querySelector(".carousel-track");
  const prevBtn = document.querySelector(".carousel-btn--prev");
  const nextBtn = document.querySelector(".carousel-btn--next");
  const cards = document.querySelectorAll(".carousel-card");

  if (!track || cards.length === 0) return;

  let currentIndex = 0;
  let cardsPerView = getCardsPerView(); // 3 / 2 / 1 según la pantalla

  function getCardsPerView() {
    if (window.innerWidth <= 550) return 1;
    if (window.innerWidth <= 850) return 2;
    return 3;
  }

  function updateCarousel() {
    const cardWidth = cards[0].offsetWidth;
    const gap = 16; // 1rem en píxeles aprox
    const moveAmount = currentIndex * (cardWidth + gap) * -1;

    track.style.transform = `translateX(${moveAmount}px)`;
  }

  // Botón siguiente
  nextBtn.addEventListener("click", () => {
    const maxIndex = cards.length - cardsPerView;

    if (currentIndex < maxIndex) {
      currentIndex++;
      updateCarousel();
    }
  });

  // Botón anterior
  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  });

  // Reajustar en responsive
  window.addEventListener("resize", () => {
    const newCardsPerView = getCardsPerView();

    if (newCardsPerView !== cardsPerView) {
      cardsPerView = newCardsPerView;
      currentIndex = 0;
      updateCarousel();
    }
  });

  updateCarousel(); // primera carga
}




/*
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

*/ 

/*
 FUTURO: Cargar proveedores destacados desde la BD
=============================================

async function cargarProveedoresDestacados() {
  const res = await fetch("http://localhost:3001/api/proveedores/destacados");
  const data = await res.json();

  const track = document.querySelector(".carousel-track");
  track.innerHTML = ""; // limpiar las cards estáticas

  data.proveedores.forEach(p => {
    const card = document.createElement("article");
    card.classList.add("carousel-card");

    card.innerHTML = `
      <div class="carousel-card-image">
        <img src="${p.imagen_url}" alt="${p.nombre}">
      </div>
      <div class="carousel-card-body">
        <h3>${p.nombre}</h3>
        <p class="carousel-card-category">${p.categoria}</p>
        <p class="carousel-card-rating">⭐ ${p.rating} · ${p.num_opiniones} opiniones</p>
      </div>
    `;

    track.appendChild(card);
  });

  // Re-inicializar carrusel porque ahora tiene nuevas cards
  initCarousel();
}


*/ 