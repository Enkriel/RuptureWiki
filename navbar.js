document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("navbar-container");
  if (!container) return;

  // Chemin de base du site = /RuptureWiki/
  const basePath = "/RuptureWiki/";

  // Chemin relatif depuis la page actuelle vers la base
  const depth = window.location.pathname
    .replace(basePath, "")
    .split("/")
    .length - 1;

  const relativePrefix = depth > 0 ? "../".repeat(depth) : "";

  const fetchPath = relativePrefix + "navbar.html";

  fetch(fetchPath)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })
    .then(html => {
      container.innerHTML = html;
      setupMenuToggle();
    })
    .catch(err => console.error("Erreur lors du chargement de la navbar :", err));
});

function setupMenuToggle() {
  const toggle = document.getElementById("menu-toggle");
  const ul = document.querySelector(".navbar ul");
  if (toggle && ul) {
    toggle.addEventListener("click", () => ul.classList.toggle("show"));
  }

  document.querySelectorAll(".navbar li.nav-dropdown").forEach(li => {
    li.addEventListener("click", () => {
      if (window.innerWidth <= 768) li.classList.toggle("open");
    });
  });
}
