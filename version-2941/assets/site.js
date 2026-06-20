(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                var open = panel.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        var backTop = document.querySelector("[data-back-top]");
        if (backTop) {
            backTop.addEventListener("click", function () {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            });
        }
    }

    function initFilters() {
        var form = document.querySelector("[data-filter-form]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        if (!form || cards.length === 0) {
            return;
        }

        var search = form.querySelector("[data-filter-search]");
        var category = form.querySelector("[data-filter-category]");
        var year = form.querySelector("[data-filter-year]");
        var type = form.querySelector("[data-filter-type]");
        var empty = document.querySelector("[data-empty-message]");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";

        if (search && query) {
            search.value = query;
        }

        function matches(card) {
            var q = search ? search.value.trim().toLowerCase() : "";
            var cardText = (card.getAttribute("data-search") || "").toLowerCase();
            var cardCategory = card.getAttribute("data-category") || "";
            var cardYear = card.getAttribute("data-year") || "";
            var cardType = card.getAttribute("data-type") || "";
            var categoryValue = category ? category.value : "all";
            var yearValue = year ? year.value : "all";
            var typeValue = type ? type.value : "all";

            if (q && cardText.indexOf(q) === -1) {
                return false;
            }
            if (categoryValue !== "all" && cardCategory !== categoryValue) {
                return false;
            }
            if (yearValue !== "all" && cardYear !== yearValue) {
                return false;
            }
            if (typeValue !== "all" && cardType !== typeValue) {
                return false;
            }
            return true;
        }

        function apply() {
            var shown = 0;
            cards.forEach(function (card) {
                var ok = matches(card);
                card.classList.toggle("is-hidden", !ok);
                if (ok) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.hidden = shown !== 0;
            }
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            apply();
        });

        [search, category, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        apply();
    }

    function initHeroFocus() {
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-hero-card]"));
        if (cards.length < 2) {
            return;
        }
        var index = 0;
        cards[index].classList.add("is-focused");
        window.setInterval(function () {
            cards[index].classList.remove("is-focused");
            index = (index + 1) % cards.length;
            cards[index].classList.add("is-focused");
        }, 4200);
    }

    function initPlayer(streamUrl) {
        var video = document.getElementById("movie-player");
        var layer = document.getElementById("play-layer");
        if (!video || !streamUrl) {
            return;
        }

        var attached = false;
        var hlsInstance = null;

        function attachStream() {
            if (attached) {
                return;
            }
            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        try {
                            hlsInstance.destroy();
                        } catch (error) {
                            hlsInstance = null;
                        }
                        video.src = streamUrl;
                    }
                });
                return;
            }

            video.src = streamUrl;
        }

        function startPlayback() {
            attachStream();
            if (layer) {
                layer.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (layer) {
                        layer.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (layer) {
            layer.addEventListener("click", startPlayback);
        }

        video.addEventListener("play", function () {
            if (layer) {
                layer.classList.add("is-hidden");
            }
        });

        video.addEventListener("ended", function () {
            if (layer) {
                layer.classList.remove("is-hidden");
            }
        });
    }

    window.MovieSite = {
        initPlayer: initPlayer
    };

    onReady(function () {
        initNavigation();
        initFilters();
        initHeroFocus();
    });
}());
