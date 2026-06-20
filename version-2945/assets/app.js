(function () {
    var body = document.body;
    var basePath = body ? body.getAttribute("data-base") || "." : ".";

    function joinPath(path) {
        if (!path) {
            return basePath;
        }
        if (/^(https?:)?\/\//.test(path)) {
            return path;
        }
        return (basePath === "." ? "./" : basePath.replace(/\/$/, "") + "/") + path.replace(/^\.\//, "");
    }

    function setText(node, value) {
        node.textContent = value || "";
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var copies = Array.prototype.slice.call(document.querySelectorAll("[data-hero-copy]"));
        var thumbs = Array.prototype.slice.call(document.querySelectorAll("[data-hero-target]"));
        if (!slides.length || !copies.length || !thumbs.length) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(index) {
            active = index;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("is-active", current === index);
            });
            copies.forEach(function (copy, current) {
                copy.classList.toggle("is-active", current === index);
            });
            thumbs.forEach(function (thumb, current) {
                thumb.classList.toggle("is-active", current === index);
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show((active + 1) % slides.length);
            }, 5200);
        }

        thumbs.forEach(function (thumb) {
            thumb.addEventListener("click", function () {
                var index = parseInt(thumb.getAttribute("data-hero-target"), 10);
                if (!Number.isNaN(index)) {
                    show(index);
                    start();
                }
            });
        });
        start();
    }

    function initSearch() {
        var modal = document.querySelector("[data-search-modal]");
        var input = document.querySelector("[data-global-search-input]");
        var results = document.querySelector("[data-global-search-results]");
        var openers = Array.prototype.slice.call(document.querySelectorAll("[data-search-open]"));
        var closers = Array.prototype.slice.call(document.querySelectorAll("[data-search-close]"));
        var searchIndex = window.MOVIE_SEARCH_INDEX || [];
        if (!modal || !input || !results) {
            return;
        }

        function openSearch() {
            modal.classList.add("is-open");
            modal.setAttribute("aria-hidden", "false");
            document.body.classList.add("search-lock");
            setTimeout(function () {
                input.focus();
            }, 40);
            render("");
        }

        function closeSearch() {
            modal.classList.remove("is-open");
            modal.setAttribute("aria-hidden", "true");
            document.body.classList.remove("search-lock");
        }

        function createResult(movie) {
            var link = document.createElement("a");
            link.className = "search-result";
            link.href = joinPath(movie.url);

            var image = document.createElement("img");
            image.src = joinPath(movie.cover);
            image.alt = movie.title;
            image.loading = "lazy";

            var copy = document.createElement("span");
            var title = document.createElement("strong");
            var meta = document.createElement("span");
            setText(title, movie.title);
            setText(meta, [movie.year, movie.region, movie.type].filter(Boolean).join(" · "));
            copy.appendChild(title);
            copy.appendChild(meta);

            link.appendChild(image);
            link.appendChild(copy);
            return link;
        }

        function render(query) {
            var value = (query || "").trim().toLowerCase();
            results.innerHTML = "";
            var items = searchIndex;
            if (value) {
                items = searchIndex.filter(function (movie) {
                    return [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.oneLine, (movie.tags || []).join(" ")]
                        .join(" ")
                        .toLowerCase()
                        .indexOf(value) !== -1;
                });
            }
            items.slice(0, 24).forEach(function (movie) {
                results.appendChild(createResult(movie));
            });
            if (!items.length) {
                var empty = document.createElement("p");
                empty.className = "empty-state";
                empty.textContent = "没有匹配的影片";
                results.appendChild(empty);
            }
        }

        openers.forEach(function (button) {
            button.addEventListener("click", openSearch);
        });
        closers.forEach(function (button) {
            button.addEventListener("click", closeSearch);
        });
        input.addEventListener("input", function () {
            render(input.value);
        });
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && modal.classList.contains("is-open")) {
                closeSearch();
            }
        });
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var list = document.querySelector("[data-card-list]");
            var cards = list ? Array.prototype.slice.call(list.querySelectorAll("[data-card]")) : [];
            var input = scope.querySelector("[data-card-filter]");
            var year = scope.querySelector("[data-filter-year]");
            var type = scope.querySelector("[data-filter-type]");
            var empty = document.querySelector("[data-filter-empty]");
            if (!cards.length) {
                return;
            }

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var selectedYear = year ? year.value : "";
                var selectedType = type ? type.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var text = [card.dataset.title, card.dataset.tags, card.dataset.region, card.dataset.type, card.dataset.year]
                        .join(" ")
                        .toLowerCase();
                    var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchedYear = !selectedYear || card.dataset.year === selectedYear;
                    var matchedType = !selectedType || card.dataset.type === selectedType;
                    var matched = matchedKeyword && matchedYear && matchedType;
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [input, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initSearch();
        initFilters();
    });
})();
