(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    function startAutoPlay() {
      stopAutoPlay();
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    function stopAutoPlay() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        startAutoPlay();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(activeIndex - 1);
        startAutoPlay();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(activeIndex + 1);
        startAutoPlay();
      });
    }

    hero.addEventListener("mouseenter", stopAutoPlay);
    hero.addEventListener("mouseleave", startAutoPlay);
    showSlide(0);
    startAutoPlay();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initStaticFilters() {
    var grid = document.querySelector("[data-filter-grid]");
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var keywordInput = document.querySelector("[data-card-search]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var typeSelect = document.querySelector("[data-filter-type]");
    var emptyState = document.querySelector("[data-empty-state]");

    function applyFilters() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" "));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesYear = !year || normalize(card.getAttribute("data-year")) === year;
        var matchesType = !type || normalize(card.getAttribute("data-type")) === type;
        var visible = matchesKeyword && matchesYear && matchesType;
        card.style.display = visible ? "" : "none";
        if (visible) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visibleCount === 0);
      }
    }

    [keywordInput, yearSelect, typeSelect].forEach(function (element) {
      if (element) {
        element.addEventListener("input", applyFilters);
        element.addEventListener("change", applyFilters);
      }
    });
  }

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<a class=\"movie-card\" href=\"" + escapeAttribute(movie.url) + "\" data-title=\"" + escapeAttribute(movie.title) + "\" data-year=\"" + escapeAttribute(movie.year) + "\" data-type=\"" + escapeAttribute(movie.type) + "\" data-region=\"" + escapeAttribute(movie.region) + "\" data-tags=\"" + escapeAttribute((movie.tags || []).join(" ")) + "\">",
      "  <div class=\"poster-wrap\">",
      "    <img src=\"" + escapeAttribute(movie.cover) + "\" alt=\"" + escapeAttribute(movie.title) + "\" loading=\"lazy\">",
      "    <span class=\"year-badge\">" + escapeHtml(movie.year) + "</span>",
      "  </div>",
      "  <div class=\"card-body\">",
      "    <h3>" + escapeHtml(movie.title) + "</h3>",
      "    <p>" + escapeHtml(movie.oneLine) + "</p>",
      "    <div class=\"movie-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>",
      "    <div class=\"tag-row\">" + tags + "</div>",
      "  </div>",
      "</a>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }

  function initGlobalSearch() {
    var data = window.MovieSearchData || [];
    var results = document.getElementById("search-results");
    var input = document.getElementById("global-search-input");
    var yearFilter = document.getElementById("global-year-filter");
    var typeFilter = document.getElementById("global-type-filter");
    var summary = document.getElementById("search-summary");
    var form = document.getElementById("search-workbench");
    var hotSection = document.getElementById("search-hot-section");
    if (!results || !input || !summary) {
      return;
    }

    var initialQuery = getQueryParam("q");
    input.value = initialQuery;

    function render() {
      var keyword = normalize(input.value);
      var year = normalize(yearFilter && yearFilter.value);
      var type = normalize(typeFilter && typeFilter.value);
      var matches = data.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(" "),
          movie.oneLine
        ].join(" "));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesYear = !year || normalize(movie.year) === year;
        var matchesType = !type || normalize(movie.type) === type;
        return matchesKeyword && matchesYear && matchesType;
      });

      var limited = matches.slice(0, 160);
      results.innerHTML = limited.map(cardTemplate).join("");
      summary.classList.add("is-visible");
      if (!keyword && !year && !type) {
        summary.textContent = "输入关键词或选择筛选条件后显示匹配内容。";
        results.innerHTML = "";
        if (hotSection) {
          hotSection.style.display = "";
        }
        return;
      }
      summary.textContent = matches.length ? "已匹配 " + matches.length + " 部内容。" : "没有匹配到符合条件的内容。";
      if (hotSection) {
        hotSection.style.display = matches.length ? "none" : "";
      }
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        render();
      });
    }

    [input, yearFilter, typeFilter].forEach(function (element) {
      if (element) {
        element.addEventListener("input", render);
        element.addEventListener("change", render);
      }
    });

    render();
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initStaticFilters();
    initGlobalSearch();
  });
})();
