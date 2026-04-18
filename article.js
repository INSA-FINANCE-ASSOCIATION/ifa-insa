// Page article individuelle : charge l'article par slug depuis Google Sheets
(function loadArticlePage() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('id');
    const container = document.getElementById('article-full');
    const titleEl = document.getElementById('article-title');
    const metaEl = document.getElementById('article-meta');
    const breadcrumbEl = document.getElementById('article-breadcrumb');
    const suggestionsEl = document.getElementById('article-suggestions');
    const suggestionsGrid = document.getElementById('article-suggestions-grid');

    if (!container) return;
    if (!slug) {
        container.innerHTML = '<p style="text-align:center;color:#888;">Aucun article demandé. <a href="index.html#articles">Retour aux articles</a>.</p>';
        return;
    }

    fetch(SHEET_API_URL + '?sheet=Articles')
        .then(r => r.json())
        .then(rawRows => {
            const rows = rawRows.map(normalizeRow).sort((a, b) => {
                const da = new Date(a['Date'] || 0), db = new Date(b['Date'] || 0);
                return db - da;
            });

            const article = rows.find(a => slugify(a['Titre'] || '') === slug);
            if (!article) {
                titleEl.textContent = 'Article introuvable';
                breadcrumbEl.textContent = 'Introuvable';
                container.innerHTML = '<p style="text-align:center;color:#888;">Cet article n\'existe plus ou a été déplacé. <a href="index.html#articles">Voir tous les articles</a>.</p>';
                return;
            }

            const titre = article['Titre'] || '';
            const auteur = article['Auteur'] || '';
            const dateFmt = formatDate(article['Date']);
            const imgUrl = getDriveImageUrl(article['Image'] || '');
            const texte = article['Texte'] || '';

            // SEO : met à jour title et meta description
            document.title = `${titre} | INSA Finance Association`;
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                const excerpt = texte.replace(/<[^>]+>/g, '').slice(0, 160);
                metaDesc.setAttribute('content', excerpt || `Article rédigé par ${auteur} pour l'INSA Finance Association.`);
            }

            titleEl.textContent = titre;
            metaEl.innerHTML = [
                auteur ? `<i class="fas fa-user-edit"></i> ${auteur}` : '',
                dateFmt ? `<i class="far fa-calendar"></i> ${dateFmt}` : ''
            ].filter(Boolean).join(' &nbsp;·&nbsp; ');
            breadcrumbEl.textContent = titre;

            const imgBlock = imgUrl
                ? `<figure class="article-cover"><img src="${imgUrl}" alt="${titre}" loading="eager"></figure>`
                : '';

            container.innerHTML = `
                ${imgBlock}
                <div class="article-body">${formatArticleText(texte)}</div>
                <div class="article-share">
                    <span>Partager :</span>
                    <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}" target="_blank" rel="noopener" aria-label="Partager sur LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                    <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(titre)}" target="_blank" rel="noopener" aria-label="Partager sur X/Twitter"><i class="fab fa-x-twitter"></i></a>
                    <a href="mailto:?subject=${encodeURIComponent(titre)}&body=${encodeURIComponent(window.location.href)}" aria-label="Partager par email"><i class="fas fa-envelope"></i></a>
                </div>
            `;

            // Suggestions : 3 autres articles les plus récents
            const autres = rows.filter(a => slugify(a['Titre'] || '') !== slug).slice(0, 3);
            if (autres.length) {
                suggestionsGrid.innerHTML = autres.map(a => {
                    const t = a['Titre'] || '';
                    const s = slugify(t);
                    const img = getDriveImageUrl(a['Image'] || '');
                    const excerpt = (a['Texte'] || '').replace(/<[^>]+>/g, '').slice(0, 160);
                    const imageBlock = img
                        ? `<div class="article-image"><img src="${img}" alt="${t}" loading="lazy"><span class="article-category">${a['Auteur'] || ''}</span></div>`
                        : `<div class="article-no-image"><span class="article-category">${a['Auteur'] || ''}</span></div>`;
                    return `
                        <article class="article-card" onclick="window.location.href='article.html?id=${encodeURIComponent(s)}'" style="cursor:pointer;">
                            ${imageBlock}
                            <div class="article-content">
                                <span class="article-date"><i class="far fa-calendar"></i> ${formatDate(a['Date'])}</span>
                                <h3>${t}</h3>
                                <p class="article-description">${excerpt}${excerpt.length >= 160 ? '…' : ''}</p>
                                <a href="article.html?id=${encodeURIComponent(s)}" class="read-more" onclick="event.stopPropagation()">Lire l'article <i class="fas fa-arrow-right"></i></a>
                            </div>
                        </article>`;
                }).join('');
                suggestionsEl.hidden = false;
            }
        })
        .catch(() => {
            container.innerHTML = '<p style="text-align:center;color:#888;">Impossible de charger cet article. <a href="index.html#articles">Retour aux articles</a>.</p>';
        });

    // Préserve les retours à la ligne du Google Sheet (les transforme en <p>)
    function formatArticleText(txt) {
        if (!txt) return '';
        // Si déjà du HTML (contient des balises), on laisse tel quel
        if (/<(p|br|h[1-6]|ul|ol|strong|em)\b/i.test(txt)) return txt;
        return txt
            .split(/\n\s*\n/)
            .map(block => `<p>${block.trim().replace(/\n/g, '<br>')}</p>`)
            .join('');
    }
})();
