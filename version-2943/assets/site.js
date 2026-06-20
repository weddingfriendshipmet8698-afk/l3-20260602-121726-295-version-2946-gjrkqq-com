(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function initMobileMenu() {
        var button = document.querySelector('[data-mobile-menu-button]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }

        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var nextButton = hero.querySelector('[data-hero-next]');
        var previousButton = hero.querySelector('[data-hero-prev]');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        if (previousButton) {
            previousButton.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        var cardList = document.querySelector('[data-card-list]');
        if (!panel || !cardList) {
            return;
        }

        var input = panel.querySelector('[data-filter-input]');
        var region = panel.querySelector('[data-filter-region]');
        var year = panel.querySelector('[data-filter-year]');
        var type = panel.querySelector('[data-filter-type]');
        var count = panel.querySelector('[data-filter-count]');
        var emptyState = document.querySelector('[data-empty-state]');
        var cards = Array.prototype.slice.call(cardList.querySelectorAll('[data-card]'));
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query && input) {
            input.value = query;
        }

        function apply() {
            var keyword = normalize(input && input.value);
            var selectedRegion = normalize(region && region.value);
            var selectedYear = normalize(year && year.value);
            var selectedType = normalize(type && type.value);
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search') || card.textContent);
                var cardRegion = normalize(card.getAttribute('data-region'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var cardType = normalize(card.getAttribute('data-type'));
                var match = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    match = false;
                }
                if (selectedRegion && cardRegion !== selectedRegion) {
                    match = false;
                }
                if (selectedYear && cardYear !== selectedYear) {
                    match = false;
                }
                if (selectedType && cardType !== selectedType) {
                    match = false;
                }

                card.hidden = !match;
                if (match) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = visible;
            }
            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        }

        [input, region, year, type].forEach(function (control) {
            if (!control) {
                return;
            }
            control.addEventListener('input', apply);
            control.addEventListener('change', apply);
        });

        apply();
    }

    function initImageFallback() {
        document.addEventListener('error', function (event) {
            var target = event.target;
            if (!target || target.tagName !== 'IMG') {
                return;
            }
            target.style.opacity = '0';
            target.setAttribute('aria-hidden', 'true');
        }, true);
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initFilters();
        initImageFallback();
    });
})();
