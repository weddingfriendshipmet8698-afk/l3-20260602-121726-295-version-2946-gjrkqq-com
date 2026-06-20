const body = document.body;
const menuButton = document.querySelector("[data-menu-button]");

if (menuButton) {
  menuButton.addEventListener("click", () => {
    body.classList.toggle("is-menu-open");
  });
}

const hero = document.querySelector("[data-hero]");

if (hero) {
  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  let current = 0;

  const showSlide = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  };

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => showSlide(dotIndex));
  });

  if (slides.length > 1) {
    window.setInterval(() => showSlide(current + 1), 5200);
  }
}

const searchInputs = document.querySelectorAll("[data-search-input]");

searchInputs.forEach((input) => {
  const cards = Array.from(document.querySelectorAll("[data-card]"));
  input.addEventListener("input", () => {
    const keyword = input.value.trim().toLowerCase();
    cards.forEach((card) => {
      const haystack = [
        card.dataset.title || "",
        card.dataset.year || "",
        card.dataset.type || "",
        card.dataset.region || "",
        card.textContent || ""
      ].join(" ").toLowerCase();
      card.classList.toggle("is-hidden", keyword !== "" && !haystack.includes(keyword));
    });
  });
});

const params = new URLSearchParams(window.location.search);
const query = params.get("q");

if (query) {
  searchInputs.forEach((input) => {
    input.value = query;
    input.dispatchEvent(new Event("input"));
  });
}
