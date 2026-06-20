const state = {
  hlsClass: null,
  hlsLoading: null
};

function initMobileMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener('click', () => {
    panel.classList.toggle('is-open');
    toggle.classList.toggle('is-open');
  });
}

function initHeroSlider() {
  const slider = document.querySelector('[data-hero-slider]');

  if (!slider) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
  const prev = slider.querySelector('[data-hero-prev]');
  const next = slider.querySelector('[data-hero-next]');
  let current = 0;
  let timer = null;

  function setActive(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function restart() {
    window.clearInterval(timer);
    timer = window.setInterval(() => setActive(current + 1), 5000);
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      setActive(index);
      restart();
    });
  });

  if (prev) {
    prev.addEventListener('click', () => {
      setActive(current - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      setActive(current + 1);
      restart();
    });
  }

  restart();
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || '';
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function initFilters() {
  const scopes = document.querySelectorAll('[data-filter-scope]');

  scopes.forEach((scope) => {
    const textInput = scope.querySelector('[data-filter-text]');
    const yearSelect = scope.querySelector('[data-filter-year]');
    const typeSelect = scope.querySelector('[data-filter-type]');
    const categorySelect = scope.querySelector('[data-filter-category]');
    const countTarget = scope.querySelector('[data-filter-count]');
    const cards = Array.from(scope.querySelectorAll('[data-card]'));
    const query = getQueryParam('q');

    if (textInput && query) {
      textInput.value = query;
    }

    function applyFilters() {
      const term = normalize(textInput ? textInput.value : '');
      const year = normalize(yearSelect ? yearSelect.value : '');
      const type = normalize(typeSelect ? typeSelect.value : '');
      const category = normalize(categorySelect ? categorySelect.value : '');
      let visible = 0;

      cards.forEach((card) => {
        const searchable = normalize([
          card.dataset.title,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.type,
          card.dataset.category,
          card.textContent
        ].join(' '));

        const matchesTerm = !term || searchable.includes(term);
        const matchesYear = !year || normalize(card.dataset.year) === year;
        const matchesType = !type || normalize(card.dataset.type) === type;
        const matchesCategory = !category || normalize(card.dataset.category) === category;
        const show = matchesTerm && matchesYear && matchesType && matchesCategory;

        card.classList.toggle('is-hidden', !show);

        if (show) {
          visible += 1;
        }
      });

      if (countTarget) {
        countTarget.textContent = `${visible} 部影片`;
      }

      let empty = scope.querySelector('[data-empty-results]');

      if (visible === 0) {
        if (!empty) {
          empty = document.createElement('div');
          empty.className = 'no-results';
          empty.dataset.emptyResults = 'true';
          empty.textContent = '没有找到匹配的影片，请调整关键词或筛选条件。';
          scope.appendChild(empty);
        }
      } else if (empty) {
        empty.remove();
      }
    }

    [textInput, yearSelect, typeSelect, categorySelect].forEach((control) => {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  });
}

async function loadHlsClass() {
  if (state.hlsClass) {
    return state.hlsClass;
  }

  if (!state.hlsLoading) {
    state.hlsLoading = import('./hls-vendor-dru42stk.js')
      .then((module) => module.H)
      .catch((error) => {
        console.warn('HLS library failed to load.', error);
        return null;
      });
  }

  state.hlsClass = await state.hlsLoading;
  return state.hlsClass;
}

async function preparePlayer(container) {
  const video = container.querySelector('video');
  const message = container.querySelector('[data-player-message]');
  const source = container.dataset.src;

  if (!video || !source) {
    return null;
  }

  if (video.dataset.ready === 'true') {
    return video;
  }

  if (message) {
    message.textContent = '正在加载播放源...';
  }

  const Hls = await loadHlsClass();

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hls.loadSource(source);
    hls.attachMedia(video);
    container._hls = hls;

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      if (message) {
        message.textContent = '';
      }
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      if (!data || !data.fatal) {
        return;
      }

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
      } else if (message) {
        message.textContent = '播放源加载失败，请稍后重试。';
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
  } else if (message) {
    message.textContent = '当前浏览器不支持 HLS 播放，请使用最新版 Chrome、Safari 或 Edge。';
  }

  video.dataset.ready = 'true';
  container.classList.add('is-ready');
  return video;
}

function initPlayers() {
  const players = document.querySelectorAll('[data-player]');

  players.forEach((container) => {
    const button = container.querySelector('[data-player-button]');
    const video = container.querySelector('video');

    async function startPlayback() {
      const preparedVideo = await preparePlayer(container);

      if (!preparedVideo) {
        return;
      }

      try {
        await preparedVideo.play();
      } catch (error) {
        const message = container.querySelector('[data-player-message]');

        if (message) {
          message.textContent = '播放已就绪，请再次点击视频播放按钮。';
        }
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', () => {
        if (video.dataset.ready !== 'true') {
          startPlayback();
        }
      });
    }
  });

  document.querySelectorAll('[data-scroll-player]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const player = document.querySelector('[data-player]');

      if (player) {
        player.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const button = player.querySelector('[data-player-button]');

        if (button) {
          button.click();
        }
      }
    });
  });
}

function initHeaderSearchState() {
  const query = getQueryParam('q');

  if (!query) {
    return;
  }

  document.querySelectorAll('.header-search input[name="q"], .mobile-search input[name="q"]').forEach((input) => {
    input.value = query;
  });
}

window.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initHeroSlider();
  initFilters();
  initPlayers();
  initHeaderSearchState();
});
