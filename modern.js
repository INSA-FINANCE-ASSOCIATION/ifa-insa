/* IFA — Modern interactions layer
   Scroll reveals, stat counters, subtle parallax. */

(function () {
    'use strict';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    // ---------- Scroll reveal ----------
    const revealSelectors = [
        '.section-header',
        '.about-content',
        '.about-card',
        '.articles-grid',
        '.membership-card',
        '.newsletter-content',
        '.events-list',
        '.team-grid',
        '.contact-content',
        '.stat-item',
        '.partenaire-card',
        '.soutenir-card',
        '.intervenant-content',
        '.footer-content'
    ];

    document.addEventListener('DOMContentLoaded', () => {
        const toReveal = document.querySelectorAll(revealSelectors.join(','));
        toReveal.forEach(el => {
            if (el.classList.contains('stats-grid') || el.classList.contains('articles-grid') ||
                el.classList.contains('membership-types') || el.classList.contains('team-grid')) {
                el.classList.add('reveal-stagger');
            } else {
                el.classList.add('reveal');
            }
        });

        // Also stagger grid containers directly
        document.querySelectorAll('.stats-grid, .articles-grid, .membership-types, .team-grid, .partenaires-grid, .events-list').forEach(el => {
            el.classList.add('reveal-stagger');
        });

        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

        document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => io.observe(el));

        initStatCounters();
        initHeroParallax();
    });

    // ---------- Stat counter animation ----------
    function initStatCounters() {
        const stats = document.querySelectorAll('.stat-number');
        if (!stats.length) return;

        const parse = (txt) => {
            const m = txt.match(/^(\D*)(\d+)(.*)$/);
            if (!m) return null;
            return { prefix: m[1], target: parseInt(m[2], 10), suffix: m[3] };
        };

        const animate = (el, prefix, target, suffix, duration = 1600) => {
            const start = performance.now();
            const step = (now) => {
                const t = Math.min(1, (now - start) / duration);
                const eased = 1 - Math.pow(1 - t, 3);
                const val = Math.round(target * eased);
                el.textContent = prefix + val + suffix;
                if (t < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        };

        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const parsed = parse(el.textContent.trim());
                    if (parsed) {
                        el.textContent = parsed.prefix + '0' + parsed.suffix;
                        animate(el, parsed.prefix, parsed.target, parsed.suffix);
                    }
                    io.unobserve(el);
                }
            });
        }, { threshold: 0.4 });

        stats.forEach(s => io.observe(s));
    }

    // ---------- Hero parallax (subtle) ----------
    function initHeroParallax() {
        const hero = document.querySelector('.hero');
        const content = document.querySelector('.hero-content');
        if (!hero || !content) return;

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const y = window.scrollY;
                if (y < window.innerHeight) {
                    content.style.transform = `translateY(${y * 0.25}px)`;
                    content.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.8)));
                }
                ticking = false;
            });
        }, { passive: true });
    }
})();
