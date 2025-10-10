document.addEventListener("DOMContentLoaded", () => {
    console.log("Main.js loaded ✅");

    // Initialize product loading
    if (document.getElementById("products-container")) {
        loadProducts();
    }

    // Initialize other sections if needed
    if (typeof loadServices === "function") loadServices();
    if (typeof loadAbout === "function") loadAbout();
    if (typeof loadTeam === "function") loadTeam();

    // Optional: Smooth scroll for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            const targetSelector = this.getAttribute("href");
            if (!targetSelector || targetSelector === "#") return; // skip invalid anchors

            e.preventDefault();
            const target = document.querySelector(targetSelector);
            if (target) target.scrollIntoView({ behavior: "smooth" });
        });
    });

});
