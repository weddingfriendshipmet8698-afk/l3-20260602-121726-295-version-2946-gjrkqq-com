(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var opened = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    show(0);
    startTimer();
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var textInput = scope.querySelector('[data-card-filter]');
    var regionSelect = scope.querySelector('[data-region-filter]');
    var yearSelect = scope.querySelector('[data-year-filter]');
    var resetButton = scope.querySelector('[data-reset-filter]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var quickButtons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-value]'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter(extraValue) {
      var query = normalize(extraValue || (textInput ? textInput.value : ''));
      var region = normalize(regionSelect ? regionSelect.value : '');
      var year = normalize(yearSelect ? yearSelect.value : '');

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-category'),
          card.textContent
        ].join(' '));
        var matchText = !query || haystack.indexOf(query) !== -1;
        var matchRegion = !region || normalize(card.getAttribute('data-region')) === region;
        var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
        card.classList.toggle('is-hidden', !(matchText && matchRegion && matchYear));
      });
    }

    if (textInput) {
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get('q');
      if (initialQuery) {
        textInput.value = initialQuery;
      }
      textInput.addEventListener('input', function () {
        applyFilter();
      });
    }

    if (regionSelect) {
      regionSelect.addEventListener('change', function () {
        applyFilter();
      });
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', function () {
        applyFilter();
      });
    }

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (textInput) {
          textInput.value = '';
        }
        if (regionSelect) {
          regionSelect.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        applyFilter();
      });
    }

    quickButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-filter-value') || '';
        if (textInput) {
          textInput.value = value;
        }
        applyFilter(value);
      });
    });

    applyFilter();
  });

  document.querySelectorAll('[data-video-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.player-start');
    var url = player.getAttribute('data-stream-url');
    var prepared = false;

    function begin() {
      if (!video || !url) {
        return;
      }

      if (!prepared) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          video.play().catch(function () {});
        } else {
          video.src = url;
          video.play().catch(function () {});
        }
        prepared = true;
      } else {
        video.play().catch(function () {});
      }

      player.classList.add('is-playing');
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        begin();
      });
    }

    player.addEventListener('click', function (event) {
      if (event.target === video) {
        return;
      }
      if (!player.classList.contains('is-playing')) {
        begin();
      }
    });
  });
})();
