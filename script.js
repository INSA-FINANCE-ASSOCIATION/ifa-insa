/* =============================================
   IFA - INSA Finance Association
   JavaScript principal
   ============================================= */

// =========================================
// Données dynamiques depuis Google Sheet
// =========================================
const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycby2-LIVHfWSChiuc8gYC42BlfFClFIkgNKRcIgp3KzQNZYWj27xIHclL_40YhbsAMZmYg/exec';

// Mois de la dernière mise à jour du site — à modifier manuellement à chaque mise à jour significative
const SITE_LAST_UPDATE = 'Mai 2026';
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('#site-last-update, .site-last-update').forEach(function (el) {
        el.textContent = SITE_LAST_UPDATE;
    });
});

function toTypeCode(typeNom) {
    return (typeNom || '').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-');
}

// --- Événements ---
(function loadEvents() {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    fetch(SHEET_API_URL + '?sheet=Ev%C3%A9nements')
        .then(r => r.json())
        .then(rawRows => {
            const rows = rawRows.map(normalizeRow);
            if (!rows.length) {
                container.innerHTML = `
                    <div class="events-empty">
                        <i class="fas fa-calendar-alt"></i>
                        <p>Aucun événement à venir pour le moment.</p>
                        <span>Suivez-nous sur les réseaux pour ne rien manquer !</span>
                    </div>`;
                return;
            }

            // Séparer à venir / passés à partir de la colonne unique "Date"
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const upcoming = [], past = [];
            rows.forEach(ev => {
                ev._date = parseEventDate(ev['Date']);
                if (!ev._date || ev._date >= todayStart) upcoming.push(ev);
                else past.push(ev);
            });

            // Tri : à venir = du plus proche au plus lointain, passés = du plus récent au plus ancien
            upcoming.sort((a, b) => (a._date || 0) - (b._date || 0));
            past.sort((a, b) => (b._date || 0) - (a._date || 0));

            // Abréviation des mois — index 0 = janvier
            const moisAbbr = ['JAN','FÉV','MAR','AVR','MAI','JUI','JUI','AOÛ','SEP','OCT','NOV','DÉC'];

            function renderTimeline(list, isPast) {
                return list.map(ev => {
                    const typeNom  = (ev['typeNom'] || ev['Type'] || '').trim();
                    const typeCode = toTypeCode(typeNom);
                    const imgUrl   = getDriveImageUrl(ev['Image'] || '');
                    const imgUrl2  = getDriveImageUrl(ev['Image 2'] || ev['Image2'] || '');
                    const intervenant = ev['Intervenant'] ? `<div class="tl-meta"><i class="fas fa-user-tie"></i><span>${ev['Intervenant']}</span></div>` : '';
                    const heure       = ev['Heure']       ? `<div class="tl-meta"><i class="fas fa-clock"></i><span>${ev['Heure']}</span></div>` : '';
                    const lieuTexte   = ev['Lieu'] || '';
                    const lieuUrl     = lieuTexte ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lieuTexte)}` : '';
                    const lieu        = lieuTexte ? `<div class="tl-meta"><i class="fas fa-map-marker-alt"></i><a href="${lieuUrl}" target="_blank" rel="noopener" class="tl-lieu-link">${lieuTexte}</a></div>` : '';
                    const titre       = (ev['Titre'] || '').trim();
                    const infosRaw    = (ev['Infos'] || '').trim();
                    const infos       = (infosRaw && infosRaw !== titre) ? `<div class="tl-meta"><i class="fas fa-info-circle"></i><span>${infosRaw}</span></div>` : '';
                    const lienBtn     = ev['Lien']        ? `<a href="${ev['Lien']}" class="tl-btn" target="_blank" rel="noopener">S'inscrire <i class="fas fa-arrow-right"></i></a>` : '';
                    const jourNum     = ev._date ? ev._date.getDate() : '—';
                    const moisText    = ev._date ? moisAbbr[ev._date.getMonth()] : '';

                    // Cercles photos (haut droite) — uniquement si photo existe
                    const circle1 = imgUrl  ? `<div class="tl-circle" style="background-image:url('${imgUrl}')"></div>`  : '';
                    const circle2 = imgUrl2 ? `<div class="tl-circle" style="background-image:url('${imgUrl2}')"></div>` : '';

                    const annee = (isPast && ev._date) ? `<span class="tl-year">${ev._date.getFullYear()}</span>` : '';

                    return `
                    <div class="tl-item${isPast ? ' tl-past' : ''}">
                        <div class="tl-date">
                            <span class="tl-day">${jourNum}</span>
                            <span class="tl-month">${moisText}</span>
                            ${annee}
                        </div>
                        <div class="tl-dot"></div>
                        <div class="tl-content">
                            <span class="tl-badge ${typeCode}">${typeNom}</span>
                            ${(circle1 || circle2) ? `<div class="tl-circles">${circle1}${circle2}</div>` : ''}
                            <h3 class="tl-title">${titre}</h3>
                            <div class="tl-metas">${intervenant}${heure}${lieu}${infos}</div>
                            ${lienBtn}
                        </div>
                    </div>`;
                }).join('');
            }

            let html = '';
            if (upcoming.length) {
                html += `<div class="tl-section-label"><i class="fas fa-calendar-check"></i> Événements à venir</div>
                         <div class="tl-timeline">${renderTimeline(upcoming, false)}</div>`;
            }
            if (past.length) {
                html += `<div class="tl-section-label tl-past-label"><i class="fas fa-history"></i> Événements passés</div>
                         <div class="tl-timeline">${renderTimeline(past, true)}</div>`;
            }
            container.innerHTML = html;
        })
        .catch(() => {
            container.innerHTML = '<p style="text-align:center;color:#888;">Impossible de charger les événements.</p>';
        });
})();

// Parse une date d'événement depuis la colonne "Date" du Google Sheet.
// Accepte : objet Date, ISO 8601, "Mon Apr 27 2026 ...", "27/04/2026",
// ou texte français "lundi 27 avril" / "27 avril 2026".
// Si l'année est absente, prend l'année courante (et passe à l'année suivante
// si la date résultante est >6 mois dans le passé, pour gérer la bascule fin/début d'année).
function parseEventDate(raw) {
    if (raw === null || raw === undefined || raw === '') return null;
    if (raw instanceof Date) return isNaN(raw) ? null : raw;

    const s = String(raw).trim();

    // Format DD/MM/YYYY (jamais ambigu avec ISO car ISO commence par 4 chiffres)
    const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (dmy) return new Date(parseInt(dmy[3]), parseInt(dmy[2]) - 1, parseInt(dmy[1]));

    // Texte français : "lundi 27 avril" ou "27 avril 2026" (avec ou sans jour de semaine)
    const moisMap = {janvier:0,fevrier:1,mars:2,avril:3,mai:4,juin:5,juillet:6,aout:7,septembre:8,octobre:9,novembre:10,decembre:11};
    const fr = stripAccents(s.toLowerCase()).match(/(\d{1,2})\s+([a-z]+)(?:\s+(\d{4}))?/);
    if (fr && moisMap[fr[2]] !== undefined) {
        const jour = parseInt(fr[1]);
        const moisIdx = moisMap[fr[2]];
        if (fr[3]) return new Date(parseInt(fr[3]), moisIdx, jour);
        const now = new Date();
        let d = new Date(now.getFullYear(), moisIdx, jour);
        if ((d - now) / 86400000 < -180) d = new Date(now.getFullYear() + 1, moisIdx, jour);
        return d;
    }

    // Fallback JS Date (ISO 8601, "Mon Apr 27 2026 00:00:00 GMT+...")
    const parsed = new Date(s);
    return isNaN(parsed) ? null : parsed;
}

// Convertit un lien Google Drive "view" en lien image direct
function getDriveImageUrl(url) {
    if (!url) return '';
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) return `https://lh3.googleusercontent.com/d/${match[1]}=w800`;
    return url; // URL directe (non-Drive) : on la retourne telle quelle
}

// Formate une date en "Mardi ; 8 ; avril 2026"
function formatDate(raw) {
    if (!raw) return '';
    const jours = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
    const mois  = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
    let d = null;
    // Format DD/MM/YYYY
    const dmyMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (dmyMatch) d = new Date(parseInt(dmyMatch[3]), parseInt(dmyMatch[2]) - 1, parseInt(dmyMatch[1]));
    // Format YYYY-MM-DD
    if (!d) { const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/); if (isoMatch) d = new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3])); }
    // Format JS toString : "Wed Oct 22 2025 00:00:00 GMT+..."
    if (!d) { const parsed = new Date(raw); if (!isNaN(parsed)) d = parsed; }
    if (d && !isNaN(d)) return `${jours[d.getDay()]} ${d.getDate()} ${mois[d.getMonth()]} ${d.getFullYear()}`;
    return raw;
}

// Supprime les accents d'une chaîne (robustesse multi-plateforme)
function stripAccents(str) {
    return (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Convertit un titre en slug URL-safe
function slugify(str) {
    return stripAccents(str || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
}

// Normalise les clés JSON (supprime les espaces) et force NFC sur les valeurs
// NFC = forme composée standard (ex: é = \u00e9 et non e + \u0301)
// Certains mobiles/WebView reçoivent du NFD depuis Google Sheets → les lookups échouent
function normalizeRow(row) {
    const n = {};
    Object.keys(row).forEach(k => {
        n[k.trim()] = typeof row[k] === 'string' ? row[k].trim().normalize('NFC') : row[k];
    });
    return n;
}

// --- Actualités ---
(function loadActualites() {
    const container = document.getElementById('actualites-container');
    if (!container) return;

    fetch(SHEET_API_URL + '?sheet=Actualit%C3%A9s')
        .then(r => r.json())
        .then(rawRows => {
            const rows = rawRows.map(normalizeRow).sort((a, b) => {
                const da = new Date(a['Date'] || 0), db = new Date(b['Date'] || 0);
                return db - da;
            });
            if (!rows.length) {
                container.innerHTML = '<p style="text-align:center;color:#888;">Aucune actualité pour le moment.</p>';
                return;
            }

            const cards = rows.map(actu => {
                const imgUrl = getDriveImageUrl(actu['Image']);
                const lien   = actu['Lien'] || '#';
                const imageBlock = imgUrl
                    ? `<div class="article-image"><img src="${imgUrl}" alt="${actu['Titre']}" loading="lazy"><span class="article-category">${actu['Catégorie'] || ''}</span></div>`
                    : `<div class="article-no-image"><span class="article-category">${actu['Catégorie'] || ''}</span></div>`;
                return `
                    <article class="article-card" onclick="window.open('${lien}','_blank')" style="cursor:pointer;">
                        ${imageBlock}
                        <div class="article-content">
                            <span class="article-date"><i class="far fa-calendar"></i> ${formatDate(actu['Date'])}</span>
                            <h3>${actu['Titre'] || ''}</h3>
                            <p class="article-description">${actu['Description'] || ''}</p>
                            <a href="${lien}" class="read-more" target="_blank" rel="noopener" onclick="event.stopPropagation()">Lire la suite <i class="fas fa-arrow-right"></i></a>
                        </div>
                    </article>`;
            }).join('');

            container.style.display = 'block'; // override articles-grid
            container.innerHTML = `
                <div class="actu-carousel-outer">
                    <button class="actu-nav-btn actu-prev" id="actuPrev" aria-label="Précédent"><i class="fas fa-chevron-left"></i></button>
                    <div class="actu-track-wrapper" id="actuTrackWrapper">
                        <div class="actu-track" id="actuTrack">${cards}</div>
                    </div>
                    <button class="actu-nav-btn actu-next" id="actuNext" aria-label="Suivant"><i class="fas fa-chevron-right"></i></button>
                </div>
                <div class="actu-dots" id="actuDots"></div>`;

            initCarousel('actuTrackWrapper', 'actuTrack', 'actuPrev', 'actuNext', 'actuDots', rows.length);
        })
        .catch(() => {
            container.innerHTML = '<p style="text-align:center;color:#888;">Impossible de charger les actualités.</p>';
        });
})();

// --- Articles ---
(function loadArticles() {
    const container = document.getElementById('articles-container');
    if (!container) return;

    fetch(SHEET_API_URL + '?sheet=Articles')
        .then(r => r.json())
        .then(rawRows => {
            const rows = rawRows.map(normalizeRow).sort((a, b) => {
                const da = new Date(a['Date'] || 0), db = new Date(b['Date'] || 0);
                return db - da;
            });
            if (!rows.length) {
                container.innerHTML = '<p style="text-align:center;color:#888;">Aucun article pour le moment.</p>';
                return;
            }

            const cards = rows.map(article => {
                const imgUrl = getDriveImageUrl(article['Image'] || '');
                const titre = article['Titre'] || '';
                const slug = slugify(titre);
                const href = `article.html?id=${encodeURIComponent(slug)}`;
                const imageBlock = imgUrl
                    ? `<div class="article-image"><img src="${imgUrl}" alt="${titre}" loading="lazy"><span class="article-category">${article['Auteur'] || ''}</span></div>`
                    : `<div class="article-no-image"><span class="article-category">${article['Auteur'] || ''}</span></div>`;
                const excerpt = (article['Texte'] || '').replace(/<[^>]+>/g, '').slice(0, 220);
                return `
                    <article class="article-card" onclick="window.location.href='${href}'" style="cursor:pointer;">
                        ${imageBlock}
                        <div class="article-content">
                            <span class="article-date"><i class="far fa-calendar"></i> ${formatDate(article['Date'])}</span>
                            <h3>${titre}</h3>
                            <p class="article-description">${excerpt}${excerpt.length >= 220 ? '…' : ''}</p>
                            <a href="${href}" class="read-more" onclick="event.stopPropagation()">Lire l'article <i class="fas fa-arrow-right"></i></a>
                        </div>
                    </article>`;
            }).join('');

            container.style.display = 'block';
            container.innerHTML = `
                <div class="actu-carousel-outer">
                    <button class="actu-nav-btn actu-prev" id="artPrev" aria-label="Précédent"><i class="fas fa-chevron-left"></i></button>
                    <div class="actu-track-wrapper" id="artTrackWrapper">
                        <div class="actu-track" id="artTrack">${cards}</div>
                    </div>
                    <button class="actu-nav-btn actu-next" id="artNext" aria-label="Suivant"><i class="fas fa-chevron-right"></i></button>
                </div>
                <div class="actu-dots" id="artDots"></div>`;

            initCarousel('artTrackWrapper', 'artTrack', 'artPrev', 'artNext', 'artDots', rows.length);
        })
        .catch(() => {
            container.innerHTML = '<p style="text-align:center;color:#888;">Impossible de charger les articles.</p>';
        });
})();

// Carousel générique (utilisé pour Actus et Articles)
function initCarousel(wrapperId, trackId, prevId, nextId, dotsId, total) {
    const wrapper  = document.getElementById(wrapperId);
    const track    = document.getElementById(trackId);
    const prevBtn  = document.getElementById(prevId);
    const nextBtn  = document.getElementById(nextId);
    const dotsWrap = document.getElementById(dotsId);
    if (!wrapper || !track) return;

    let current = 0;
    let autoTimer = null;

    function getVisible() {
        if (window.innerWidth < 640)  return 1;
        if (window.innerWidth < 1024) return 2;
        return 3;
    }
    function getMax() { return Math.max(0, total - getVisible()); }

    function goTo(idx) {
        const max = getMax();
        if (idx < 0) idx = max;
        if (idx > max) idx = 0;
        current = idx;
        const cards = track.querySelectorAll('.article-card');
        if (!cards.length) return;
        const gap  = parseInt(getComputedStyle(track).gap) || 24;
        const step = cards[0].offsetWidth + gap;
        track.style.transform = `translateX(-${current * step}px)`;
        dotsWrap.querySelectorAll('.actu-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function startAuto() { stopAuto(); autoTimer = setInterval(() => goTo(current + 1), 5000); }
    function stopAuto()  { clearInterval(autoTimer); }

    dotsWrap.innerHTML = '';
    for (let i = 0; i <= getMax(); i++) {
        const dot = document.createElement('span');
        dot.className = 'actu-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => { goTo(i); startAuto(); });
        dotsWrap.appendChild(dot);
    }

    prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
    nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });

    // Retourne la position translateX de base (slide courant)
    function getBaseX() {
        const cards = track.querySelectorAll('.article-card');
        if (!cards.length) return 0;
        const gap = parseInt(getComputedStyle(track).gap) || 24;
        return -(current * (cards[0].offsetWidth + gap));
    }

    // ── Touch (mobile) ──────────────────────────────────────────
    let touchStartX = 0, touchStartY = 0;
    let swipeDir = null; // null=indécis, true=horizontal, false=vertical

    // passive: false OBLIGATOIRE pour que preventDefault() dans touchmove soit respecté
    wrapper.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
        swipeDir = null;
        stopAuto();
    }, { passive: false });

    wrapper.addEventListener('touchmove', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;

        // Décision initiale : horizontal ou vertical ?
        if (swipeDir === null) {
            swipeDir = Math.abs(dx) > Math.abs(dy);
        }
        if (!swipeDir) return; // scroll vertical → laisser faire

        e.preventDefault();
        track.style.transition = 'none';
        track.style.transform = `translateX(${getBaseX() + dx}px)`;
    }, { passive: false });

    wrapper.addEventListener('touchend', e => {
        if (!swipeDir) { startAuto(); return; }
        const diff = touchStartX - e.changedTouches[0].clientX;
        track.style.transition = '';
        goTo(Math.abs(diff) > 50 ? (diff > 0 ? current + 1 : current - 1) : current);
        swipeDir = null;
        startAuto();
    });

    // ── Drag souris (desktop) ────────────────────────────────────
    let mouseStartX = 0, mouseDown = false, mouseDragged = false;

    wrapper.addEventListener('mousedown', e => {
        if (e.button !== 0) return; // clic gauche uniquement
        mouseDown = true;
        mouseDragged = false;
        mouseStartX = e.clientX;
        track.style.transition = 'none';
        wrapper.style.cursor = 'grabbing';
        stopAuto();
        e.preventDefault();
    });

    window.addEventListener('mousemove', e => {
        if (!mouseDown) return;
        const dx = e.clientX - mouseStartX;
        if (Math.abs(dx) > 5) mouseDragged = true;
        track.style.transform = `translateX(${getBaseX() + dx}px)`;
    });

    window.addEventListener('mouseup', e => {
        if (!mouseDown) return;
        mouseDown = false;
        wrapper.style.cursor = '';
        track.style.transition = '';
        if (mouseDragged) {
            const diff = mouseStartX - e.clientX;
            goTo(Math.abs(diff) > 50 ? (diff > 0 ? current + 1 : current - 1) : current);
        }
        startAuto();
    });

    // Empêche les clics sur les liens après un drag
    track.addEventListener('click', e => {
        if (mouseDragged) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    window.addEventListener('resize', () => {
        const newMax = getMax();
        if (dotsWrap.children.length !== newMax + 1) {
            dotsWrap.innerHTML = '';
            for (let i = 0; i <= newMax; i++) {
                const dot = document.createElement('span');
                dot.className = 'actu-dot' + (i === 0 ? ' active' : '');
                dot.addEventListener('click', () => { goTo(i); startAuto(); });
                dotsWrap.appendChild(dot);
            }
        }
        goTo(Math.min(current, newMax));
    });

    goTo(0);
    startAuto();
}

// --- Partenaires ---
(function loadPartenaires() {
    const container = document.getElementById('partenaires-container');
    if (!container) return;

    fetch(SHEET_API_URL + '?sheet=Partenaires')
        .then(r => r.json())
        .then(rawRows => {
            const rows = rawRows.map(normalizeRow);
            if (!rows.length) {
                container.innerHTML = `
                    <div class="partenaires-empty">
                        <i class="fas fa-handshake"></i>
                        <p>Aucun partenaire pour le moment.</p>
                    </div>`;
                return;
            }

            const escapeHtml = s => String(s || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
            const nl2br = s => escapeHtml(s).replace(/\r\n|\r|\n/g, '<br>');

            const cards = rows.map(p => {
                const logoUrl = getDriveImageUrl(p['Logo'] || '');
                const logoBlock = logoUrl
                    ? `<img src="${logoUrl}" alt="${escapeHtml(p['Nom'])}" class="partenaire-logo" loading="lazy">`
                    : `<div class="partenaire-logo-placeholder"><i class="fas fa-building"></i></div>`;
                return `
                    <div class="partenaire-card">
                        ${logoBlock}
                        <div class="partenaire-nom">${escapeHtml(p['Nom'])}</div>
                        <p class="partenaire-description">${nl2br(p['Description'])}</p>
                    </div>`;
            }).join('');

            container.innerHTML = `<div class="partenaires-grid">${cards}</div>`;
        })
        .catch(() => {
            container.innerHTML = '<p style="text-align:center;color:#888;">Impossible de charger les partenaires.</p>';
        });
})();

// --- Équipe ---
(function loadEquipe() {
    const carousel = document.getElementById('bureauCarousel');
    if (!carousel) return;

    fetch(SHEET_API_URL + '?sheet=%C3%89quipe')
        .then(r => r.json())
        .then(rawRows => {
            const rows = rawRows.map(normalizeRow);
            if (!rows || !rows.length) {
                initBureauCarousel();
                return;
            }
            carousel.innerHTML = rows.map((member, index) => {
                const photo = member['Photo']
                    ? `<img src="${member['Photo']}" alt="${member['Nom'] || 'Membre'}" loading="lazy">`
                    : `<div class="member-placeholder"><i class="fas fa-user fa-3x" style="color:var(--primary-color);"></i></div>`;
                return `
                    <div class="bureau-member${index === 0 ? ' active' : ''}">
                        <div class="member-image">${photo}</div>
                        <div class="member-info">
                            <h3>${member['Nom'] || ''}</h3>
                            <span class="member-role">${member['Rôle'] || ''}</span>
                            <blockquote class="member-quote">
                                <i class="fas fa-quote-left"></i>
                                <p>« ${member['Citation'] || ''} »</p>
                            </blockquote>
                        </div>
                    </div>`;
            }).join('');

            const indicatorsContainer = document.querySelector('.carousel-indicators');
            if (indicatorsContainer) {
                indicatorsContainer.innerHTML = rows.map((_, i) =>
                    `<span class="indicator${i === 0 ? ' active' : ''}" data-index="${i}"></span>`
                ).join('');
            }
            initBureauCarousel();
        })
        .catch(() => initBureauCarousel());
})();

// --- Stats ---
(function loadStats() {
    const grid = document.getElementById('stats-grid');
    if (!grid) return;

    fetch(SHEET_API_URL + '?sheet=Stats')
        .then(r => r.json())
        .then(rawRows => {
            const rows = rawRows.map(normalizeRow);
            if (!rows || !rows.length) return;
            grid.innerHTML = rows.map(stat => `
                <div class="stat-item">
                    <span class="stat-number">${stat['Valeur'] || ''}</span>
                    <span class="stat-label">${stat['Label'] || ''}</span>
                </div>`
            ).join('');
        })
        .catch(() => {}); // Garde les stats codées en dur si erreur
})();

// --- Conseil d'Administration ---
(function loadCA() {
    const grid = document.getElementById('ca-grid');
    if (!grid) return;

    fetch(SHEET_API_URL + '?sheet=CA')
        .then(r => r.json())
        .then(rawRows => {
            const rows = (rawRows || []).map(normalizeRow);
            if (!rows.length) return;

            const pick = (obj, ...keys) => {
                const map = {};
                Object.keys(obj).forEach(k => { map[k.toLowerCase()] = obj[k]; });
                for (const k of keys) {
                    const v = map[k.toLowerCase()];
                    if (v) return v;
                }
                return '';
            };

            // Convertit un lien Drive (partage ou open) en URL d'image directe
            const driveUrl = (url) => {
                if (!url) return '';
                const m = String(url).match(/(?:\/d\/|id=|\/file\/d\/)([A-Za-z0-9_-]{15,})/);
                if (m) return `https://lh3.googleusercontent.com/d/${m[1]}=w800`;
                return url;
            };

            const members = rows.map(m => ({
                photo: driveUrl(pick(m, 'Photo', 'Image', 'photo', 'image')),
                nom: pick(m, 'Nom', 'Nom et prénom', 'Nom et Prénom', 'nom'),
                poste: pick(m, 'Poste', 'Rôle', 'poste')
            }));

            // z-index décroissant à partir du centre : la personne centrale passe devant,
            // puis chaque voisin glisse derrière son voisin plus central.
            const centerIdx = (members.length - 1) / 2;
            const figures = members.map((m, i) => {
                const visual = m.photo
                    ? `<img src="${m.photo}" alt="${m.nom}" loading="lazy">`
                    : `<div class="ca-figure-placeholder"><i class="fas fa-user" aria-hidden="true"></i></div>`;
                const zi = members.length - Math.round(Math.abs(i - centerIdx));
                return `<div class="ca-figure" style="z-index:${zi}">${visual}</div>`;
            }).join('');

            const legend = members.map(m => `
                <div class="ca-legend-item">
                    <span class="ca-nom">${m.nom}</span>
                    <span class="ca-poste">${m.poste}</span>
                </div>`
            ).join('');

            grid.innerHTML = `
                <div class="ca-showcase">
                    <div class="ca-band">
                        <h3 class="ca-band-title">Notre Conseil d'Administration</h3>
                        <div class="ca-lineup">${figures}</div>
                    </div>
                    <div class="ca-legend">${legend}</div>
                </div>`;
        })
        .catch(() => {}); // Garde le bandeau "en construction" si erreur
})();

// =========================================
// Bureau Members Carousel - initialisation
// =========================================
function initBureauCarousel() {
    const carousel = document.getElementById('bureauCarousel');
    if (!carousel) return;

    const members = carousel.querySelectorAll('.bureau-member');
    const indicators = document.querySelectorAll('.carousel-indicators .indicator');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    let currentIndex = 0;
    let autoSlideInterval;
    const autoSlideDelay = 3000;

    function showMember(index) {
        if (index < 0) index = members.length - 1;
        if (index >= members.length) index = 0;
        currentIndex = index;
        members.forEach(m => m.classList.remove('active'));
        members[currentIndex].classList.add('active');
        indicators.forEach((ind, i) => ind.classList.toggle('active', i === currentIndex));
    }

    function nextMember() { showMember(currentIndex + 1); }
    function prevMember() { showMember(currentIndex - 1); }

    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(nextMember, autoSlideDelay);
    }
    function stopAutoSlide() {
        if (autoSlideInterval) clearInterval(autoSlideInterval);
    }

    if (prevBtn) prevBtn.addEventListener('click', function() { prevMember(); startAutoSlide(); });
    if (nextBtn) nextBtn.addEventListener('click', function() { nextMember(); startAutoSlide(); });

    indicators.forEach((indicator, idx) => {
        indicator.addEventListener('click', function() { showMember(idx); startAutoSlide(); });
    });

    let touchStartX = 0, touchEndX = 0;
    carousel.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoSlide();
    }, { passive: true });
    carousel.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) { diff > 0 ? nextMember() : prevMember(); }
        startAutoSlide();
    }, { passive: true });

    carousel.addEventListener('mouseenter', stopAutoSlide);
    carousel.addEventListener('mouseleave', startAutoSlide);

    showMember(0);
    startAutoSlide();
}

document.addEventListener('DOMContentLoaded', function() {

    // =========================================
    // Modal Functions for Adhesion
    // =========================================
    window.openAdhesionModal = function(type) {
        const modal = document.getElementById('adhesion-modal');
        const hiddenInput = document.getElementById('type-membre-hidden');
        const title = document.getElementById('modal-form-title');
        const poleGroup = document.getElementById('pole-group');
        const poleInput = document.getElementById('pole-choisi');
        
        if(modal) {
            modal.classList.add('active');
            
            // Set dynamic title and hidden field based on button clicked
            if(type) {
                hiddenInput.value = type;
                title.textContent = "Candidature : Membre " + type;
            } else {
                hiddenInput.value = "Adhérent"; // Fallback default
                title.textContent = "Formulaire d'adhésion";
            }
            
            // Handle display and requirement of Pole dropdown
            if (hiddenInput.value === 'Actif' && poleGroup && poleInput) {
                poleGroup.style.display = 'block';
                poleInput.required = true;
            } else if (poleGroup && poleInput) {
                poleGroup.style.display = 'none';
                poleInput.required = false;
                poleInput.value = ''; // Reset value
            }
            
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeAdhesionModal = function() {
        const modal = document.getElementById('adhesion-modal');
        if(modal) {
            modal.classList.remove('active');
            // Restore body scroll
            document.body.style.overflow = 'auto';
            // Clear messages
            document.getElementById('form-message').style.display = 'none';
        }
    };

    // Close modal on click outside
    const modalOverlay = document.getElementById('adhesion-modal');
    if(modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if(e.target === modalOverlay) {
                closeAdhesionModal();
            }
        });
    }

    // =========================================
    // Navigation
    // =========================================
    
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    // Scroll effect on navbar (throttled)
    window.addEventListener('scroll', throttle(function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, 100));
    
    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
    
    // =========================================
    // Smooth scroll for anchor links
    // =========================================
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || href.length < 2) return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();

            const computeOffset = () => {
                const rect = target.getBoundingClientRect();
                const absoluteTop = window.pageYOffset + rect.top;
                if (target.id === 'newsletter-inscription') {
                    return Math.max(0, absoluteTop - (window.innerHeight / 2) + (rect.height / 2));
                }
                return Math.max(0, absoluteTop - 80);
            };

            window.scrollTo({ top: computeOffset(), behavior: 'smooth' });

            // Re-calibre si du contenu async (articles, partenaires, CA) modifie la
            // hauteur des sections au-dessus pendant l'animation.
            setTimeout(() => {
                window.scrollTo({ top: computeOffset(), behavior: 'smooth' });
            }, 700);
        });
    });
    
    // =========================================
    // Animate elements on scroll
    // =========================================
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements
    const animateElements = document.querySelectorAll('.timeline-item, .article-card, .video-card, .membership-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Add animate-in class styles
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
    
    // =========================================
    // Poll functionality
    // =========================================
    
    const pollForm = document.getElementById('poll-form');
    if (pollForm) {
        const pollOptions = pollForm.querySelectorAll('.poll-option');
        
        pollOptions.forEach(option => {
            const bar = option.querySelector('.poll-bar');
            const percentage = getComputedStyle(bar).getPropertyValue('--percentage');
            
            // Show results on hover
            option.addEventListener('mouseenter', function() {
                bar.style.width = percentage;
            });
            
            option.addEventListener('mouseleave', function() {
                if (!option.querySelector('input').checked) {
                    bar.style.width = '0';
                }
            });
        });
        
        pollForm.addEventListener('submit', function(e) {
            const selected = pollForm.querySelector('input[name="reponse"]:checked');
            if (!selected) {
                e.preventDefault();
                alert('Veuillez sélectionner une option');
                return;
            }
            
            // Show all bars before submit
            pollOptions.forEach(option => {
                const bar = option.querySelector('.poll-bar');
                const percentage = getComputedStyle(bar).getPropertyValue('--percentage');
                bar.style.width = percentage;
            });
            
            // Change button text
            pollForm.querySelector('button').textContent = 'Envoi en cours...';
        });
    }
    
    // =========================================
    // Form validation and submission
    // =========================================
    
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        // Skip poll form and newsletter (handled separately with custom validation)
        if (form.id === 'poll-form') return;
        if (form.id === 'newsletter-inscription') return;
        
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                    field.style.borderColor = '#e53e3e';
                } else {
                    field.classList.remove('error');
                    field.style.borderColor = '';
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                return;
            }

            // Custom handling for contact form
            if (form.classList.contains('contact-form')) {
                e.preventDefault();

                // Sync _replyto with email field if present
                const emailField  = form.querySelector('input[type="email"]');
                const replytoField = form.querySelector('#replyto-field');
                if (emailField && replytoField) replytoField.value = emailField.value;

                const btn = form.querySelector('button[type="submit"]');
                const originalText = btn.textContent;
                btn.textContent = 'Envoi en cours...';
                btn.disabled = true;

                const formData = new FormData(form);

                fetch(form.action.replace("https://formsubmit.co/", "https://formsubmit.co/ajax/"), {
                    method: "POST",
                    body: formData
                })
                .then(response => {
                    if (!response.ok) throw new Error('http_' + response.status);
                    return response.json();
                })
                .then(data => {
                    // FormSubmit renvoie success comme string "true" ou booléen true
                    if (data.success === true || data.success === 'true') {
                        form.innerHTML = `
                            <div style="text-align:center; padding: 40px 20px;">
                                <i class="fas fa-check-circle" style="font-size:3rem; color:var(--gold); margin-bottom:16px; display:block;"></i>
                                <p style="font-size:1.2rem; font-weight:600; color:var(--primary-color); margin:0 0 8px;">Message envoyé !</p>
                                <p style="color:var(--text-light); margin:0;">Nous vous répondrons dans les plus brefs délais.</p>
                            </div>`;
                    } else {
                        throw new Error('formsubmit_error');
                    }
                })
                .catch(err => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                    let msg = 'Une erreur est survenue. Veuillez réessayer.';
                    if (err.message === 'formsubmit_error') {
                        msg = 'Envoi échoué. Vérifiez votre connexion ou réessayez.';
                    }
                    let errEl = form.querySelector('.contact-error');
                    if (!errEl) {
                        errEl = document.createElement('p');
                        errEl.className = 'contact-error';
                        errEl.style.cssText = 'color:#e53e3e; margin-top:12px; font-weight:600;';
                        btn.after(errEl);
                    }
                    errEl.textContent = msg;
                });
            }
        });
        
        // Remove error style on input
        form.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('input', function() {
                this.classList.remove('error');
                this.style.borderColor = '';
            });
        });
    });
    
    // Newsletter : le spinner est géré dans le handler de validation ci-dessous
    
    // =========================================
    // Membership form - type selection highlight
    // =========================================
    
    const membershipRadios = document.querySelectorAll('.radio-option input[name="type_membre"]');
    membershipRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            membershipRadios.forEach(r => {
                r.closest('.radio-option').style.borderColor = '';
                r.closest('.radio-option').style.background = '';
            });
            
            if (this.checked) {
                this.closest('.radio-option').style.borderColor = '#3182ce';
                this.closest('.radio-option').style.background = 'rgba(49, 130, 206, 0.05)';
            }
        });
    });
    
    // =========================================
    // Active navigation link on scroll
    // =========================================
    
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', throttle(function() {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;

            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }, 150));
    
    // =========================================
    // Video cards click handler
    // =========================================
    
    const videoCards = document.querySelectorAll('.video-card');
    videoCards.forEach(card => {
        card.addEventListener('click', function() {
            // You can add YouTube embed functionality here
            alert('La vidéo sera bientôt disponible !');
        });
    });
    
    // =========================================
    // Article read more functionality
    // =========================================
    // Les liens ouvrent directement l'URL définie dans Google Sheets
    
    // =========================================
    // Counter animation for stats
    // =========================================
    
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        function updateCounter() {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        }
        
        updateCounter();
    }
    
    // =========================================
    // Lazy loading for images
    // =========================================
    
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
    
    // =========================================
    // Print current year in footer
    // =========================================

    const yearSpan = document.querySelector('.footer-bottom p');
    if (yearSpan) {
        const currentYear = new Date().getFullYear();
        yearSpan.innerHTML = yearSpan.innerHTML.replace('2026', currentYear);
    }

    // =========================================
    // Scroll to Top Button
    // =========================================
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', throttle(function() {
            if (window.scrollY > 400) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        }, 100));

        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // =========================================
    // Mobile Menu Nav Overlay
    // =========================================
    const navOverlay = document.getElementById('navOverlay');
    if (navOverlay && hamburger) {
        hamburger.addEventListener('click', function() {
            navOverlay.classList.toggle('active');
        });

        navOverlay.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            navOverlay.classList.remove('active');
        });
    }

});

// =========================================
// Utility functions
// =========================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// =========================================
// Google Sheets Integration for Adhesion + Newsletter
// =========================================
document.addEventListener('DOMContentLoaded', function() {
    // =========================================
    // Google Sheets Integration for Adhesion
    // =========================================
    const adhesionForm = document.getElementById('adhesion-form');
    if (adhesionForm) {
        adhesionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = document.getElementById('submit-adhesion');
            const msg = document.getElementById('form-message');
            const memberTypeField = document.getElementById('type-membre-hidden');
            const memberType = memberTypeField ? memberTypeField.value : '';
            
            btn.textContent = 'Envoi en cours...';
            btn.disabled = true;
            
            const formData = new FormData(adhesionForm);

            // Membre Actif -> Google Sheet (Google Apps Script)
            if (memberType === 'Actif') {
                const sheetApiUrl = 'https://script.google.com/macros/s/AKfycbzVXGfwjoGDTK6bbewNBE3DAHk_ClOdrjmB2sXifkO3p4iuGM_IuzeNEfhp27sCIaCX/exec';
                const dataObject = {};

                formData.forEach((value, key) => {
                    dataObject[key] = value;
                });

                dataObject['Horodateur'] = new Date().toLocaleString('fr-FR');
                dataObject['Ajouter commu'] = '';

                fetch(sheetApiUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: JSON.stringify(dataObject)
                })
                    .then(() => {
                        msg.style.display = 'block';
                        msg.style.color = 'green';
                        msg.textContent = '✅ Votre candidature membre Actif a bien été envoyée !';
                        adhesionForm.reset();
                        btn.textContent = 'Envoyer ma candidature';
                        btn.disabled = false;

                        setTimeout(() => {
                            window.closeAdhesionModal();
                            msg.style.display = 'none';
                        }, 3000);
                    })
                    .catch(error => {
                        msg.style.display = 'block';
                        msg.style.color = 'red';
                        msg.textContent = '❌ Une erreur est survenue. Veuillez réessayer.';
                        btn.textContent = 'Envoyer ma candidature';
                        btn.disabled = false;
                        console.error('Error!', error.message);
                    });

                return;
            }

            // Membre Adhérent -> Google Sheet (Google Apps Script)
            const adherentApiUrl = 'https://script.google.com/macros/s/AKfycbwx-zvKOpyySTwMNuSS0xxxMbUpsq8IJKP0-a-uMLjMLEghZKUsuHS3Mx7T56kWuLro/exec';
            const adherentData = {};

            formData.forEach((value, key) => {
                adherentData[key] = value;
            });

            adherentData['Horodateur'] = new Date().toLocaleString('fr-FR');

            fetch(adherentApiUrl, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify(adherentData)
            })
                .then(() => {
                    msg.style.display = 'block';
                    msg.style.color = 'green';
                    msg.textContent = '✅ Votre demande d\'adhésion a bien été envoyée !';
                    adhesionForm.reset();
                    btn.textContent = 'Envoyer ma candidature';
                    btn.disabled = false;

                    setTimeout(() => {
                        window.closeAdhesionModal();
                        msg.style.display = 'none';
                    }, 3000);
                })
                .catch(error => {
                    msg.style.display = 'block';
                    msg.style.color = 'red';
                    msg.textContent = '❌ Une erreur est survenue. Veuillez réessayer.';
                    btn.textContent = 'Envoyer ma candidature';
                    btn.disabled = false;
                    console.error('Error!', error.message);
                });
        });
    }

    // =========================================
    // Custom Validation for Newsletter Form
    // =========================================
    const newsletterForm = document.getElementById('newsletter-inscription');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            let isValid = true;
            
            const emailInput = document.getElementById('newsletter-email');
            const rgpdCheckbox = document.getElementById('newsletter-rgpd');
            const emailError = document.getElementById('newsletter-email-error');
            const rgpdError = document.getElementById('newsletter-rgpd-error');
            
            // Reset errors
            emailError.style.display = 'none';
            rgpdError.style.display = 'none';
            emailInput.style.border = 'none';
            
            // Validate Email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailInput.value || !emailRegex.test(emailInput.value)) {
                emailError.style.display = 'block';
                emailInput.style.border = '2px solid #ff6b6b';
                isValid = false;
            }
            
            // Validate Checkbox
            if (!rgpdCheckbox.checked) {
                rgpdError.style.display = 'block';
                isValid = false;
            }
            
            // Toujours empêcher la redirection Brevo
            e.preventDefault();

            if (!isValid) return;

            // Validation OK : soumettre via fetch (pas de redirection)
            const btn = newsletterForm.querySelector('button[type="submit"]');
            if (btn) {
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                btn.disabled = true;
            }

            fetch(newsletterForm.action, {
                method: 'POST',
                mode: 'no-cors',
                body: new FormData(newsletterForm)
            })
            .then(() => {
                // Remplacer le contenu du formulaire par un message de succès
                newsletterForm.innerHTML = `
                    <div style="text-align:center; padding: 20px 0;">
                        <i class="fas fa-check-circle" style="font-size:2.5rem; color:#c9a227; margin-bottom:12px; display:block;"></i>
                        <p style="font-size:1.1rem; font-weight:600; color:#fff; margin:0 0 6px;">Inscription confirmée !</p>
                        <p style="color:#fff; margin:0;">Vous recevrez bientôt notre newsletter. Merci !</p>
                    </div>`;
            })
            .catch(() => {
                if (btn) {
                    btn.innerHTML = "S'inscrire";
                    btn.disabled = false;
                }
                alert('Erreur lors de l\'inscription. Veuillez réessayer.');
            });
        });

        // Hide error when user starts typing/clicking
        const emailInput = document.getElementById('newsletter-email');
        const rgpdCheckbox = document.getElementById('newsletter-rgpd');
        
        emailInput.addEventListener('input', function() {
            document.getElementById('newsletter-email-error').style.display = 'none';
            this.style.border = 'none';
        });
        
        rgpdCheckbox.addEventListener('change', function() {
            document.getElementById('newsletter-rgpd-error').style.display = 'none';
        });
    }
});
