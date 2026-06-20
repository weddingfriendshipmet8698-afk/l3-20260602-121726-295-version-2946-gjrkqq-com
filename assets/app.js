(() => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  if (header && toggle) {
    toggle.addEventListener("click", () => {
      const open = header.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dots button"));
  let current = 0;
  const show = (index) => {
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("active", i === current));
    dots.forEach((dot, i) => dot.classList.toggle("active", i === current));
  };
  dots.forEach((dot, i) => dot.addEventListener("click", () => show(i)));
  if (slides.length > 1) {
    setInterval(() => show(current + 1), 5200);
  }

  const list = document.querySelector("[data-filter-list]");
  const form = document.querySelector("[data-filter-form]");
  if (list && form) {
    const cards = Array.from(list.querySelectorAll(".movie-card"));
    const run = () => {
      const q = (form.querySelector("[name='q']")?.value || "").trim().toLowerCase();
      const year = form.querySelector("[name='year']")?.value || "";
      const region = form.querySelector("[name='region']")?.value || "";
      const genre = form.querySelector("[name='genre']")?.value || "";
      cards.forEach((card) => {
        const hay = [card.dataset.title, card.dataset.year, card.dataset.region, card.dataset.genre].join(" ").toLowerCase();
        const ok = (!q || hay.includes(q)) && (!year || card.dataset.year === year) && (!region || card.dataset.region === region) && (!genre || card.dataset.genre.includes(genre));
        card.style.display = ok ? "" : "none";
      });
    };
    form.addEventListener("input", run);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      run();
    });
  }
})();
