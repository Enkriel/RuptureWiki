document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("navbar-container");
  if (!container) return;

  // Détecte si on est sur GitHub Pages
  const isGithubPages = window.location.hostname === "enkriel.github.io";
  const basePath = isGithubPages ? "/RuptureWiki" : "";

  fetch(`${basePath}/navbar.html`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })
    .then(html => {
      container.innerHTML = html;
      setupMenuToggle();
      fixNavbarLinks(basePath); // 🔹 On corrige les liens avec le bon basePath
    })
    .catch(err => console.error("Erreur lors du chargement de la navbar :", err));
});

function setupMenuToggle() {
  const toggle = document.getElementById("nav-toggle"); // ou menu-toggle
  const ul = document.querySelector(".navbar ul");
  if (toggle && ul) {
    toggle.addEventListener("click", () => {
      const isOpen = ul.classList.toggle("show");
      toggle.setAttribute("aria-expanded", isOpen);
    });
  }

  document.querySelectorAll(".navbar li.nav-dropdown").forEach(li => {
    li.addEventListener("click", () => {
      if (window.innerWidth <= 768) li.classList.toggle("open");
    });
  });
}


function fixNavbarLinks(basePath) {
  document.querySelectorAll(".navbar a").forEach(link => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("http") || href.startsWith("#")) return;
    link.setAttribute("href", `${basePath}/${href.replace(/^\/+/, "")}`);
  });
}
