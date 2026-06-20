(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      const expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      mobileNav.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let heroIndex = 0;
  let heroTimer = null;

  const showSlide = (index) => {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, idx) => slide.classList.toggle('active', idx === heroIndex));
    dots.forEach((dot, idx) => dot.classList.toggle('active', idx === heroIndex));
  };

  const startHero = () => {
    if (slides.length <= 1) {
      return;
    }

    heroTimer = window.setInterval(() => {
      showSlide(heroIndex + 1);
    }, 5200);
  };

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      window.clearInterval(heroTimer);
      showSlide(idx);
      startHero();
    });
  });

  startHero();

  const liveInput = document.getElementById('movieSearch');
  const clearButton = document.getElementById('clearSearch');
  const results = Array.from(document.querySelectorAll('[data-search]'));
  const empty = document.getElementById('searchEmpty');

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';

  const applySearch = (value) => {
    const query = value.trim().toLowerCase();
    let visible = 0;

    results.forEach((item) => {
      const haystack = item.getAttribute('data-search') || '';
      const matched = !query || haystack.includes(query);
      item.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  };

  if (liveInput) {
    liveInput.value = initialQuery;
    applySearch(initialQuery);
    liveInput.addEventListener('input', () => applySearch(liveInput.value));
  }

  if (clearButton && liveInput) {
    clearButton.addEventListener('click', () => {
      liveInput.value = '';
      applySearch('');
      liveInput.focus();
    });
  }
})();
