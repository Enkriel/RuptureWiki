// Injecter navbar sur chaque page
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("navbar-container");
    if (!container) return;

    fetch("/navbar.html")
        .then(res => res.text())
        .then(html => {
            container.innerHTML = html;
            setupMenuToggle();
        });
});

// Menu hamburger responsive
function setupMenuToggle() {
    const toggle = document.getElementById("menu-toggle");
    const ul = document.querySelector(".navbar ul");
    if (!toggle || !ul) return;

    toggle.addEventListener("click", () => {
        ul.classList.toggle("show");
    });

    // Dropdown mobile
    const dropdownParents = document.querySelectorAll(".navbar li");
    dropdownParents.forEach(li => {
        li.addEventListener("click", (e) => {
            if (window.innerWidth <= 768) {
                li.classList.toggle("open");
            }
        });
    });
}
