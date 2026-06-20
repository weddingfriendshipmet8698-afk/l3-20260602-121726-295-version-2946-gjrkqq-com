(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function restartTimer() {
    if (timer) {
      window.clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      restartTimer();
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      restartTimer();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      restartTimer();
    });
  }

  showSlide(0);
  restartTimer();

  var search = document.getElementById('siteSearch');
  var yearFilter = document.getElementById('yearFilter');
  var regionFilter = document.getElementById('regionFilter');
  var typeFilter = document.getElementById('typeFilter');
  var reset = document.querySelector('[data-filter-reset]');
  var count = document.querySelector('[data-visible-count]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card[data-title]'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    if (!cards.length) {
      if (count) {
        count.textContent = '0';
      }
      return;
    }

    var keyword = normalize(search ? search.value : '');
    var year = normalize(yearFilter ? yearFilter.value : '');
    var region = normalize(regionFilter ? regionFilter.value : '');
    var type = normalize(typeFilter ? typeFilter.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre')
      ].join(' '));
      var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;
      var matchesRegion = !region || normalize(card.getAttribute('data-region')) === region;
      var matchesType = !type || haystack.indexOf(type) !== -1;
      var shouldShow = matchesKeyword && matchesYear && matchesRegion && matchesType;

      card.classList.toggle('hidden-card', !shouldShow);
      if (shouldShow) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = String(visible);
    }
  }

  [search, yearFilter, regionFilter, typeFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  if (reset) {
    reset.addEventListener('click', function () {
      if (search) {
        search.value = '';
      }
      if (yearFilter) {
        yearFilter.value = '';
      }
      if (regionFilter) {
        regionFilter.value = '';
      }
      if (typeFilter) {
        typeFilter.value = '';
      }
      applyFilters();
    });
  }

  applyFilters();
})();
