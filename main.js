

document.addEventListener("DOMContentLoaded", () => {
  const p = document.createElement("p");
  p.textContent = "Comprobando API...";
  document.body.appendChild(p);

  fetch("http://localhost:3001/api/status")
    .then(res => res.json())
    .then(data => {
      console.log("Respuesta de la API:", data);
      p.textContent = data.message;
    })
    .catch(err => {
      console.error("Error llamando a la API:", err);
      p.textContent = "Error conectando con la API";
    });
});