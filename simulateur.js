/* ==========================================================
   Simulateur d'investissement IFA — logique
   ========================================================== */

(function () {
    'use strict';

    /* ---------- ÉTAT GLOBAL ---------- */
    const state = {
        portfolio: [],          // [{symbol, name, exch, cagr, weight, dca}]
        mode: 'weight',         // 'weight' | 'dca'
        params: {
            initial: 1000,
            monthly: 200,
            years: 10,
            inflation: 2.0,
            fees: 0.30,
            tax: 31.4
        },
        lastResult: null
    };

    /* ---------- HELPERS ---------- */
    const fmtEUR = (v, opts = {}) => {
        if (!isFinite(v)) return '—';
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency', currency: 'EUR',
            maximumFractionDigits: opts.decimals ?? 0,
            minimumFractionDigits: opts.decimals ?? 0
        }).format(v);
    };
    const fmtPct = (v, d = 2) => `${v >= 0 ? '' : ''}${(v).toFixed(d)} %`;
    const $ = sel => document.querySelector(sel);
    const $$ = sel => document.querySelectorAll(sel);

    function toast(msg, kind = 'info') {
        let t = document.querySelector('.toast');
        if (!t) {
            t = document.createElement('div');
            t.className = 'toast';
            document.body.appendChild(t);
        }
        t.textContent = msg;
        t.className = 'toast' + (kind === 'error' ? ' error' : '');
        requestAnimationFrame(() => t.classList.add('show'));
        clearTimeout(t._timer);
        t._timer = setTimeout(() => t.classList.remove('show'), 3200);
    }

    /* ==========================================================
       RECHERCHE YAHOO FINANCE
       Endpoints publics utilisés (CORS-friendly via query1):
         - search:  https://query1.finance.yahoo.com/v1/finance/search?q=...
         - history: https://query1.finance.yahoo.com/v8/finance/chart/SYMBOL?range=10y&interval=1mo
       Si bloqué, fallback proxy public r.jina.ai en lecture seule.
       ========================================================== */
    const Y_SEARCH = 'https://query1.finance.yahoo.com/v1/finance/search?quotesCount=8&newsCount=0&q=';
    const Y_CHART  = 'https://query1.finance.yahoo.com/v8/finance/chart/';

    /* ---------- PROXY DÉDIÉ (Cloudflare Worker) ----------
       Pour avoir une recherche quasi instantanée en production, déployer le
       Worker fourni dans worker.js puis coller son URL ci-dessous (sans slash final).
       Pour DÉSACTIVER : laisser une chaîne vide -> fallback automatique sur les
       proxies publics (comportement avant Cloudflare).                           */
    const CLOUDFLARE_WORKER_URL = 'https://ifa-yahoo.insa-finance.workers.dev';

    // Yahoo bloque très souvent les requêtes navigateur (CORS).
    // On lance le fetch direct + (le Worker s'il est configuré) + tous les proxies
    // EN PARALLÈLE et on garde la première réponse JSON valide (Promise.any).
    const PROXIES = [
        url => 'https://corsproxy.io/?' + encodeURIComponent(url),
        url => 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url),
        url => 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(url),
        url => 'https://thingproxy.freeboard.io/fetch/' + url,
        url => 'https://proxy.cors.sh/' + url,
        url => 'https://cors.eu.org/' + url
    ];

    const ATTEMPT_TIMEOUT_MS = 3500;
    const fetchCache = new Map(); // url -> Promise<json>

    function fetchWithTimeout(url, ms) {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), ms);
        return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(t));
    }

    async function tryFetchJson(url) {
        const r = await fetchWithTimeout(url, ATTEMPT_TIMEOUT_MS);
        if (!r.ok) throw new Error('http ' + r.status);
        const text = await r.text();
        const json = JSON.parse(text); // throws if invalid
        return json;
    }

    function fetchJson(url) {
        if (fetchCache.has(url)) return fetchCache.get(url);
        // Direct + Worker (si configuré) + tous les proxies en parallèle, premier OK gagne.
        const attempts = [tryFetchJson(url)];
        if (CLOUDFLARE_WORKER_URL) {
            attempts.push(tryFetchJson(CLOUDFLARE_WORKER_URL.replace(/\/$/, '') + '/?url=' + encodeURIComponent(url)));
        }
        for (const wrap of PROXIES) attempts.push(tryFetchJson(wrap(url)));
        const p = Promise.any(attempts).catch(err => {
            fetchCache.delete(url); // ne pas garder un échec en cache
            throw new Error('fetch failed: all sources down');
        });
        fetchCache.set(url, p);
        return p;
    }

    async function searchTickers(q) {
        if (!q || q.trim().length < 1) return [];
        try {
            const data = await fetchJson(Y_SEARCH + encodeURIComponent(q));
            const quotes = (data.quotes || []).filter(x => x.symbol && (x.shortname || x.longname));
            return quotes.slice(0, 8).map(q => ({
                symbol: q.symbol,
                name: q.shortname || q.longname || q.symbol,
                exch: q.exchDisp || q.exchange || '',
                type: q.quoteType || ''
            }));
        } catch (e) {
            console.warn('search failed', e);
            return [];
        }
    }

    /**
     * Calcule un CAGR robuste à partir des prix mensuels Yahoo.
     * Plafonné à des bornes raisonnables pour éviter les biais
     * (forte poussée court-terme vs vrai rendement long terme).
     */
    async function fetchCAGR(symbol) {
        // Cible : CAGR sur 10 ans. Fallback automatique sur 5y / max si données insuffisantes.
        const ranges = ['10y', '5y', 'max'];
        for (const range of ranges) {
            try {
                const url = `${Y_CHART}${encodeURIComponent(symbol)}?range=${range}&interval=1mo&includePrePost=false`;
                const data = await fetchJson(url);
                const result = data?.chart?.result?.[0];
                if (!result) continue;
                const ts = result.timestamp || [];
                const closes = result.indicators?.adjclose?.[0]?.adjclose
                            || result.indicators?.quote?.[0]?.close
                            || [];
                const pairs = ts.map((t, i) => [t, closes[i]])
                                .filter(p => p[1] != null && isFinite(p[1]) && p[1] > 0);
                if (pairs.length < 13) continue; // moins d'1 an : on tente le range suivant
                const first = pairs[0];
                const last = pairs[pairs.length - 1];
                const years = (last[0] - first[0]) / (365.25 * 24 * 3600);
                if (years < 1) continue;
                const ratio = last[1] / first[1];
                const cagr = (Math.pow(ratio, 1 / years) - 1) * 100;
                const capped = Math.max(-30, Math.min(40, cagr));
                return { cagr: capped, years, source: 'yahoo', range };
            } catch (e) {
                console.warn(`cagr ${range} failed for`, symbol, e);
            }
        }
        return null;
    }

    /* ==========================================================
       MODÈLE / CALCUL
       ========================================================== */

    /** Return weighted CAGR of the portfolio (decimal, e.g. 0.07 for 7%) */
    function weightedCAGR() {
        if (!state.portfolio.length) return 0;
        if (state.mode === 'dca') {
            // Effective weights derived from DCA per stock + initial weight from same DCA.
            const totalDCA = state.portfolio.reduce((s, p) => s + (Number(p.dca) || 0), 0);
            if (totalDCA <= 0) return 0;
            return state.portfolio.reduce((s, p) =>
                s + (Number(p.cagr) / 100) * ((Number(p.dca) || 0) / totalDCA), 0);
        } else {
            const totalW = state.portfolio.reduce((s, p) => s + (Number(p.weight) || 0), 0);
            if (totalW <= 0) return 0;
            return state.portfolio.reduce((s, p) =>
                s + (Number(p.cagr) / 100) * ((Number(p.weight) || 0) / totalW), 0);
        }
    }

    /**
     * Compose monthly with DCA. Annual rate r split into 12 monthly compounds.
     * Returns array of { year, contributedYear, contributedTotal, interestYear, balance, gainCum }
     * Plus the per-month monthly contribution actually used (for DCA mode it's the sum).
     */
    function projectGrowth(annualRateNetPct, years, initial, monthlyContrib) {
        const r = annualRateNetPct / 100;
        const m = Math.pow(1 + r, 1 / 12) - 1;
        let balance = initial;
        let totalContrib = initial;
        const rows = [];
        let lastYearBalance = initial;
        let lastYearContrib = initial;
        for (let y = 1; y <= years; y++) {
            for (let k = 0; k < 12; k++) {
                balance = balance * (1 + m) + monthlyContrib;
                totalContrib += monthlyContrib;
            }
            const contributedYear = totalContrib - lastYearContrib;
            const interestYear = (balance - lastYearBalance) - contributedYear;
            rows.push({
                year: y,
                contributedYear,
                contributedTotal: totalContrib,
                interestYear,
                balance,
                gainCum: balance - totalContrib
            });
            lastYearBalance = balance;
            lastYearContrib = totalContrib;
        }
        return rows;
    }

    /**
     * Applique la fiscalité sur la plus-value.
     * Les contributions ne sont pas taxées ; seul le gain l'est, comme à la sortie.
     * Recalcule balance, gainCum et interestYear de manière cohérente.
     */
    function applyTax(rows, taxRate) {
        if (!taxRate) return rows;
        let prevTaxedGain = 0;
        return rows.map(row => {
            const taxedGain = row.gainCum * (1 - taxRate);
            const newRow = {
                ...row,
                balance: row.contributedTotal + taxedGain,
                gainCum: taxedGain,
                interestYear: taxedGain - prevTaxedGain
            };
            prevTaxedGain = taxedGain;
            return newRow;
        });
    }

    function compute() {
        const wRate = weightedCAGR(); // decimal
        const fees = (Number(state.params.fees) || 0) / 100;
        const tax = (Number(state.params.tax) || 0) / 100;
        const netAnnualPct = (wRate - fees) * 100;
        const years = Number(state.params.years) || 10;
        const initial = Number(state.params.initial) || 0;

        // Monthly contribution used for projection
        let monthly;
        if (state.mode === 'dca') {
            monthly = state.portfolio.reduce((s, p) => s + (Number(p.dca) || 0), 0);
        } else {
            monthly = Number(state.params.monthly) || 0;
        }

        // Projection brute (avant fiscalité)
        const medianGross = projectGrowth(netAnnualPct, years, initial, monthly);
        const optimGross = projectGrowth(netAnnualPct + 2.0, years, initial, monthly); // +2pp
        const pessimGross = projectGrowth(Math.max(-50, netAnnualPct - 3.0), years, initial, monthly); // -3pp
        const lumpGross = projectGrowth(netAnnualPct, years, initial, 0);

        // Application de la fiscalité (PEA 18,6 % / CTO 31,4 % / aucune)
        const median = applyTax(medianGross, tax);
        const optim = applyTax(optimGross, tax);
        const pessim = applyTax(pessimGross, tax);
        const lump = applyTax(lumpGross, tax);

        // Livret A : exonéré d'impôts en France → pas de fiscalité appliquée
        const livret = projectGrowth(3.0, years, initial, monthly);
        const cashRows = (() => {
            // No interest, but add monthly contributions
            let bal = initial; let total = initial; const r = [];
            for (let y = 1; y <= years; y++) {
                bal += monthly * 12; total = bal;
                r.push({ year: y, balance: bal });
            }
            return r;
        })();

        const inflation = (Number(state.params.inflation) || 0) / 100;
        const realFactor = Math.pow(1 + inflation, years);
        const finalNominal = median[median.length - 1].balance;
        const totalContrib = median[median.length - 1].contributedTotal;
        const gain = finalNominal - totalContrib;

        return {
            wRate, netAnnualPct, monthly, years, initial,
            median, optim, pessim, lump, livret, cashRows,
            finalNominal,
            finalReal: finalNominal / realFactor,
            totalContrib,
            gain,
            gainPct: totalContrib > 0 ? (gain / totalContrib) * 100 : 0,
            lumpFinal: lump[lump.length - 1]?.balance ?? initial,
            livretFinal: livret[livret.length - 1]?.balance ?? initial,
            cashFinal: cashRows[cashRows.length - 1]?.balance ?? initial,
            dcaFinal: finalNominal
        };
    }

    /* ==========================================================
       UI — RECHERCHE
       ========================================================== */
    const searchInput = $('#search-input');
    const searchResults = $('#search-results');
    let searchTimer = null;
    let searchSeq = 0;

    searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim();
        clearTimeout(searchTimer);
        if (!q) { closeResults(); return; }
        searchResults.innerHTML = '<div class="search-loading"><i class="fas fa-spinner fa-spin"></i> Recherche...</div>';
        searchResults.classList.add('open');
        const seq = ++searchSeq;
        searchTimer = setTimeout(async () => {
            const items = await searchTickers(q);
            if (seq !== searchSeq) return; // stale
            renderResults(items);
        }, 280);
    });

    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim() && searchResults.children.length) searchResults.classList.add('open');
    });
    document.addEventListener('click', e => {
        if (!searchResults.contains(e.target) && e.target !== searchInput) closeResults();
    });

    function closeResults() {
        searchResults.classList.remove('open');
    }

    function renderResults(items) {
        if (!items.length) {
            searchResults.innerHTML = '<div class="search-empty">Aucun résultat. Essayez un autre ticker (ex : AAPL, CW8.PA).</div>';
            return;
        }
        searchResults.innerHTML = items.map(it => `
            <div class="search-result" data-symbol="${escapeAttr(it.symbol)}" data-name="${escapeAttr(it.name)}" data-exch="${escapeAttr(it.exch)}">
                <span class="search-result-symbol">${escapeHtml(it.symbol)}</span>
                <span class="search-result-name">${escapeHtml(it.name)}</span>
                <span class="search-result-meta">${escapeHtml(it.exch || it.type)}</span>
            </div>
        `).join('');
        searchResults.querySelectorAll('.search-result').forEach(el => {
            el.addEventListener('click', () => {
                addToPortfolio({
                    symbol: el.dataset.symbol,
                    name: el.dataset.name,
                    exch: el.dataset.exch
                });
                searchInput.value = '';
                closeResults();
            });
        });
    }

    function escapeHtml(s) {
        return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
    const escapeAttr = escapeHtml;

    // Suggestion chips
    $$('.chip').forEach(c => {
        c.addEventListener('click', () => {
            addToPortfolio({
                symbol: c.dataset.symbol,
                name: c.dataset.name,
                exch: ''
            });
        });
    });

    /* ==========================================================
       UI — PORTEFEUILLE
       ========================================================== */
    async function addToPortfolio(item) {
        if (state.portfolio.find(p => p.symbol === item.symbol)) {
            toast(`${item.symbol} est déjà dans votre portefeuille.`);
            return;
        }
        const entry = {
            symbol: item.symbol,
            name: item.name,
            exch: item.exch || '',
            cagr: null,         // % annuel
            weight: 0,          // % allocation
            dca: 0,             // €/mois
            loading: true
        };
        // Default weight: equally distribute
        const n = state.portfolio.length + 1;
        state.portfolio.push(entry);
        rebalanceWeightsEqually();
        renderPortfolio();
        recompute();

        // Fetch CAGR async
        const data = await fetchCAGR(item.symbol);
        entry.loading = false;
        if (data) {
            entry.cagr = Math.round(data.cagr * 100) / 100;
            const yrsLabel = data.range === '10y' ? '10 ans'
                          : data.range === '5y'  ? '5 ans (10 ans indispo)'
                          : `${data.years.toFixed(0)} ans (max dispo)`;
            toast(`${item.symbol} : ${entry.cagr.toFixed(2)} %/an sur ${yrsLabel} ✓`);
        } else {
            entry.cagr = 7.0; // sensible default
            toast(`Impossible de récupérer l'historique de ${item.symbol}. Rendement estimé à 7 % (modifiable).`, 'error');
        }
        renderPortfolio();
        recompute();
    }

    function rebalanceWeightsEqually() {
        const n = state.portfolio.length;
        if (!n) return;
        const w = +(100 / n).toFixed(2);
        state.portfolio.forEach((p, i) => p.weight = w);
        // Adjust last to make total exactly 100
        const total = state.portfolio.reduce((s, p) => s + p.weight, 0);
        if (state.portfolio.length) {
            state.portfolio[state.portfolio.length - 1].weight += (100 - total);
            state.portfolio[state.portfolio.length - 1].weight =
                Math.round(state.portfolio[state.portfolio.length - 1].weight * 100) / 100;
        }
    }

    function renderPortfolio() {
        const body = $('#portfolio-body');
        const footer = $('#portfolio-footer');
        if (!state.portfolio.length) {
            body.innerHTML = `<tr class="empty-row"><td colspan="5">
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>Votre portefeuille est vide. Recherchez un ticker ou cliquez sur une suggestion pour commencer.</p>
                </div>
            </td></tr>`;
            footer.hidden = true;
            updateAllocHeader();
            return;
        }
        footer.hidden = false;
        body.innerHTML = state.portfolio.map((p, idx) => {
            const cagrCell = p.loading
                ? `<span class="row-cagr-loading"><i class="fas fa-spinner fa-spin"></i> Calcul...</span>`
                : `<span class="cell-input-wrap">
                       <input class="cell-input" type="number" step="0.1" data-idx="${idx}" data-field="cagr" value="${(p.cagr ?? 0).toFixed(2)}">
                       <span class="suffix">%</span>
                   </span>`;
            const allocCell = state.mode === 'weight'
                ? `<span class="cell-input-wrap">
                       <input class="cell-input" type="number" step="0.1" min="0" max="100" data-idx="${idx}" data-field="weight" value="${(p.weight ?? 0).toFixed(2)}">
                       <span class="suffix">%</span>
                   </span>`
                : `<span class="cell-input-wrap">
                       <input class="cell-input" type="number" step="10" min="0" data-idx="${idx}" data-field="dca" value="${(p.dca ?? 0).toFixed(0)}">
                       <span class="suffix">€/mois</span>
                   </span>`;
            return `<tr class="row-enter">
                <td class="ticker-cell">${escapeHtml(p.symbol)}</td>
                <td class="name-cell">${escapeHtml(p.name)}<span class="name-meta">${escapeHtml(p.exch || '')}</span></td>
                <td class="cagr-cell">${cagrCell}</td>
                <td class="alloc-cell">${allocCell}</td>
                <td class="actions-cell"><button class="btn-row-remove" data-idx="${idx}" title="Retirer"><i class="fas fa-times"></i></button></td>
            </tr>`;
        }).join('');

        // Wire inputs
        body.querySelectorAll('.cell-input').forEach(inp => {
            inp.addEventListener('input', e => {
                const i = +e.target.dataset.idx;
                const field = e.target.dataset.field;
                const v = parseFloat(e.target.value);
                state.portfolio[i][field] = isNaN(v) ? 0 : v;
                updateAllocHeader();
                recompute();
            });
        });
        body.querySelectorAll('.btn-row-remove').forEach(btn => {
            btn.addEventListener('click', e => {
                const i = +e.currentTarget.dataset.idx;
                state.portfolio.splice(i, 1);
                if (state.mode === 'weight') rebalanceWeightsEqually();
                renderPortfolio();
                recompute();
            });
        });
        updateAllocHeader();
    }

    function updateAllocHeader() {
        const header = $('#alloc-header');
        const totalEl = $('#alloc-total-value');
        const status = $('#alloc-status');
        if (state.mode === 'weight') {
            header.textContent = 'Pondération';
            const total = state.portfolio.reduce((s, p) => s + (Number(p.weight) || 0), 0);
            totalEl.textContent = `${total.toFixed(2)} %`;
            if (Math.abs(total - 100) < 0.05) {
                status.textContent = 'OK'; status.className = 'alloc-status ok';
            } else {
                status.textContent = `≠ 100 %`; status.className = 'alloc-status warn';
            }
        } else {
            header.textContent = 'DCA mensuel';
            const total = state.portfolio.reduce((s, p) => s + (Number(p.dca) || 0), 0);
            totalEl.textContent = fmtEUR(total) + '/mois';
            status.textContent = ''; status.className = 'alloc-status';
        }
    }

    /* Mode toggle */
    $$('.mode-pill').forEach(b => {
        b.addEventListener('click', () => {
            $$('.mode-pill').forEach(x => { x.classList.remove('active'); x.setAttribute('aria-selected', 'false'); });
            b.classList.add('active'); b.setAttribute('aria-selected', 'true');
            state.mode = b.dataset.mode;
            const help = $('#mode-help');
            const monthlyParam = $('#p-monthly').closest('.param');
            if (state.mode === 'weight') {
                help.textContent = 'Le total doit faire 100 %. Le versement mensuel global sera réparti selon ces poids.';
                monthlyParam.style.opacity = '1';
                $('#p-monthly').disabled = false;
            } else {
                help.textContent = 'Vous saisissez un montant € par mois pour chaque action. Le versement mensuel global est calculé automatiquement.';
                monthlyParam.style.opacity = '0.5';
                $('#p-monthly').disabled = true;
                // Migrate weights → DCA proportionally to the global monthly
                const globalMonthly = Number(state.params.monthly) || 0;
                const totalW = state.portfolio.reduce((s, p) => s + (Number(p.weight) || 0), 0) || 1;
                state.portfolio.forEach(p => {
                    p.dca = +((p.weight / totalW) * globalMonthly).toFixed(2);
                });
            }
            renderPortfolio();
            recompute();
        });
    });

    /* Footer buttons */
    $('#normalize-btn').addEventListener('click', () => {
        if (state.mode !== 'weight') return;
        const total = state.portfolio.reduce((s, p) => s + (Number(p.weight) || 0), 0);
        if (total <= 0) return;
        state.portfolio.forEach(p => p.weight = +((p.weight / total) * 100).toFixed(2));
        renderPortfolio();
        recompute();
    });
    $('#clear-btn').addEventListener('click', () => {
        state.portfolio = [];
        renderPortfolio();
        recompute();
    });

    /* ==========================================================
       UI — PARAMS
       ========================================================== */
    function bindParam(id, key, parse = parseFloat) {
        $(id).addEventListener('input', e => {
            const v = parse(e.target.value);
            state.params[key] = isNaN(v) ? 0 : v;
            recompute();
        });
    }
    bindParam('#p-initial', 'initial');
    bindParam('#p-monthly', 'monthly');
    bindParam('#p-inflation', 'inflation');
    bindParam('#p-fees', 'fees');
    $('#p-tax').addEventListener('change', e => {
        const v = parseFloat(e.target.value);
        state.params.tax = isNaN(v) ? 0 : v;
        recompute();
    });

    $$('#years-pills button').forEach(b => {
        b.addEventListener('click', () => {
            $$('#years-pills button').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            state.params.years = +b.dataset.y;
            $('#p-years').value = state.params.years;
            recompute();
        });
    });

    /* Toggle real € */
    $('#toggle-scenarios').addEventListener('change', () => recompute());
    $('#toggle-real').addEventListener('change', () => recompute());

    /* ==========================================================
       UI — RÉSULTATS
       ========================================================== */
    let growthChart = null;
    let pieChart = null;

    function recompute() {
        const result = compute();
        state.lastResult = result;
        renderKPIs(result);
        renderGrowthChart(result);
        renderPieChart();
        renderComparison(result);
        renderYearTable(result);
        saveState();
    }

    /* ==========================================================
       PERSISTANCE & PARTAGE
       ========================================================== */
    const STORAGE_KEY = 'ifa-simulator-v1';
    let restoring = false; // évite de réécrire pendant la restauration

    function snapshot() {
        return {
            v: 1,
            portfolio: state.portfolio.map(p => ({
                symbol: p.symbol, name: p.name, exch: p.exch || '',
                cagr: p.cagr, weight: p.weight, dca: p.dca
            })),
            mode: state.mode,
            params: { ...state.params }
        };
    }

    function saveState() {
        if (restoring) return;
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot())); }
        catch (_) { /* quota / privacy mode → on ignore */ }
    }

    function loadFromStorage() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    }

    function loadFromHash() {
        const hash = location.hash.slice(1);
        if (!hash.startsWith('p=')) return null;
        try {
            const json = decodeURIComponent(escape(atob(hash.slice(2))));
            return JSON.parse(json);
        } catch { return null; }
    }

    function applyState(data) {
        if (!data || typeof data !== 'object') return false;
        restoring = true;
        try {
            if (Array.isArray(data.portfolio)) {
                state.portfolio = data.portfolio
                    .filter(p => p && p.symbol)
                    .map(p => ({
                        symbol: String(p.symbol),
                        name: String(p.name || p.symbol),
                        exch: String(p.exch || ''),
                        cagr: Number.isFinite(p.cagr) ? p.cagr : 7,
                        weight: Number.isFinite(p.weight) ? p.weight : 0,
                        dca: Number.isFinite(p.dca) ? p.dca : 0,
                        loading: false
                    }));
            }
            if (data.mode === 'weight' || data.mode === 'dca') state.mode = data.mode;
            if (data.params && typeof data.params === 'object') {
                ['initial', 'monthly', 'years', 'inflation', 'fees', 'tax'].forEach(k => {
                    if (data.params[k] != null && isFinite(data.params[k])) {
                        state.params[k] = +data.params[k];
                    }
                });
            }
            syncUIFromState();
            return true;
        } finally {
            restoring = false;
        }
    }

    function syncUIFromState() {
        $('#p-initial').value = state.params.initial;
        $('#p-monthly').value = state.params.monthly;
        $('#p-inflation').value = state.params.inflation;
        $('#p-fees').value = state.params.fees;
        $('#p-years').value = state.params.years;
        const taxSel = $('#p-tax');
        const want = String(state.params.tax);
        // Retrouver l'option dont la value correspond au taux numérique
        const match = Array.from(taxSel.options).find(o => parseFloat(o.value) === parseFloat(want));
        if (match) taxSel.value = match.value;
        $$('#years-pills button').forEach(b => b.classList.toggle('active', +b.dataset.y === state.params.years));
        $$('.mode-pill').forEach(b => {
            const isActive = b.dataset.mode === state.mode;
            b.classList.toggle('active', isActive);
            b.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        const monthlyParam = $('#p-monthly').closest('.param');
        if (state.mode === 'dca') {
            monthlyParam.style.opacity = '0.5';
            $('#p-monthly').disabled = true;
        } else {
            monthlyParam.style.opacity = '1';
            $('#p-monthly').disabled = false;
        }
    }

    function buildShareUrl() {
        const json = JSON.stringify(snapshot());
        const b64 = btoa(unescape(encodeURIComponent(json)));
        return location.origin + location.pathname + '#p=' + b64;
    }

    async function shareCurrent() {
        if (!state.portfolio.length) {
            toast('Ajoutez au moins une action avant de partager.', 'error');
            return;
        }
        const url = buildShareUrl();
        try {
            await navigator.clipboard.writeText(url);
            toast('Lien de partage copié dans le presse-papiers ✓');
        } catch {
            // Fallback : prompt — l'utilisateur peut copier manuellement
            window.prompt('Copiez ce lien pour partager votre simulation :', url);
        }
        // Met aussi à jour l'URL pour que l'utilisateur puisse la copier depuis la barre d'adresse
        history.replaceState(null, '', '#p=' + url.split('#p=')[1]);
    }

    $('#share-btn').addEventListener('click', shareCurrent);

    function renderKPIs(r) {
        $('#kpi-final').textContent = fmtEUR(r.finalNominal);
        $('#kpi-final-real').textContent = `≈ ${fmtEUR(r.finalReal)} en € constants`;
        $('#kpi-invested').textContent = fmtEUR(r.totalContrib);
        $('#kpi-gain').textContent = fmtEUR(r.gain);
        $('#kpi-gain-pct').textContent = `+${(r.gainPct).toFixed(1)} % sur le versé`;
        $('#kpi-cagr').textContent = `${(r.netAnnualPct).toFixed(2)} %`;
    }

    function renderComparison(r) {
        $('#cmp-dca').textContent = fmtEUR(r.dcaFinal);
        $('#cmp-lump').textContent = fmtEUR(r.lumpFinal);
        $('#cmp-livret').textContent = fmtEUR(r.livretFinal);
        $('#cmp-cash').textContent = fmtEUR(r.cashFinal);
    }

    function renderYearTable(r) {
        const tbody = $('#year-body');
        tbody.innerHTML = r.median.map(row => `
            <tr>
                <td>Année ${row.year}</td>
                <td>${fmtEUR(row.contributedYear)}</td>
                <td>${fmtEUR(row.contributedTotal)}</td>
                <td class="${row.interestYear >= 0 ? 'gain-pos' : ''}">${fmtEUR(row.interestYear)}</td>
                <td><strong>${fmtEUR(row.balance)}</strong></td>
                <td class="${row.gainCum >= 0 ? 'gain-pos' : ''}">${fmtEUR(row.gainCum)}</td>
            </tr>
        `).join('');
    }

    function renderGrowthChart(r) {
        const ctx = document.getElementById('growth-chart');
        const showScen = $('#toggle-scenarios').checked;
        const showReal = $('#toggle-real').checked;
        const labels = ['Aujourd\'hui', ...r.median.map(x => `An ${x.year}`)];

        const inflation = (Number(state.params.inflation) || 0) / 100;
        const adjust = (val, year) => showReal ? val / Math.pow(1 + inflation, year) : val;

        const balSeries = [adjust(state.params.initial, 0), ...r.median.map(x => adjust(x.balance, x.year))];
        const contribSeries = [adjust(state.params.initial, 0), ...r.median.map(x => adjust(x.contributedTotal, x.year))];
        const optimSeries = [adjust(state.params.initial, 0), ...r.optim.map(x => adjust(x.balance, x.year))];
        const pessimSeries = [adjust(state.params.initial, 0), ...r.pessim.map(x => adjust(x.balance, x.year))];

        const navy = '#1a2a5e';
        const gold = '#c9a227';
        const goldLight = 'rgba(201, 162, 39, 0.18)';
        const navyLight = 'rgba(26, 42, 94, 0.08)';

        const datasets = [];

        if (showScen) {
            datasets.push({
                label: 'Optimiste (+2 pts)',
                data: optimSeries,
                borderColor: 'rgba(72, 187, 120, 0.55)',
                backgroundColor: 'rgba(72, 187, 120, 0.0)',
                borderDash: [4, 4],
                fill: false,
                pointRadius: 0,
                tension: 0.3
            });
            datasets.push({
                label: 'Pessimiste (-3 pts)',
                data: pessimSeries,
                borderColor: 'rgba(237, 137, 54, 0.55)',
                backgroundColor: 'rgba(237, 137, 54, 0.0)',
                borderDash: [4, 4],
                fill: false,
                pointRadius: 0,
                tension: 0.3
            });
        }

        datasets.push({
            label: 'Capital projeté',
            data: balSeries,
            borderColor: navy,
            backgroundColor: navyLight,
            borderWidth: 3,
            fill: 'origin',
            pointRadius: 2,
            pointHoverRadius: 5,
            tension: 0.3
        });
        datasets.push({
            label: 'Total versé',
            data: contribSeries,
            borderColor: gold,
            backgroundColor: goldLight,
            borderWidth: 2,
            fill: false,
            pointRadius: 0,
            tension: 0.3
        });

        if (growthChart) growthChart.destroy();
        growthChart = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { font: { family: 'Montserrat', size: 12 }, usePointStyle: true, padding: 16 }
                    },
                    tooltip: {
                        backgroundColor: '#1a2a5e',
                        titleFont: { family: 'Playfair Display', size: 13 },
                        bodyFont: { family: 'Montserrat', size: 12 },
                        padding: 12,
                        callbacks: {
                            label: c => `${c.dataset.label}: ${fmtEUR(c.parsed.y)}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { family: 'Montserrat', size: 11 }, color: '#5d6b82' }
                    },
                    y: {
                        grid: { color: 'rgba(26, 42, 94, 0.06)' },
                        ticks: {
                            font: { family: 'Montserrat', size: 11 },
                            color: '#5d6b82',
                            callback: v => fmtEUR(v).replace(/\u00a0/g, ' ')
                        }
                    }
                }
            }
        });
    }

    function renderPieChart() {
        const ctx = document.getElementById('pie-chart');
        if (!state.portfolio.length) {
            if (pieChart) { pieChart.destroy(); pieChart = null; }
            return;
        }
        const labels = state.portfolio.map(p => p.symbol);
        let values;
        if (state.mode === 'dca') {
            values = state.portfolio.map(p => Number(p.dca) || 0);
        } else {
            values = state.portfolio.map(p => Number(p.weight) || 0);
        }
        // IFA palette: navy + gold variants
        const palette = ['#1a2a5e', '#c9a227', '#2a3d7a', '#d4af37', '#5d6b82', '#e6c85a', '#0f1a3d', '#7a5c00', '#4a5568', '#a89060'];
        const colors = labels.map((_, i) => palette[i % palette.length]);

        if (pieChart) pieChart.destroy();
        pieChart = new Chart(ctx, {
            type: 'doughnut',
            data: { labels, datasets: [{ data: values, backgroundColor: colors, borderColor: '#fff', borderWidth: 2 }] },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '55%',
                plugins: {
                    legend: { position: 'bottom', labels: { font: { family: 'Montserrat', size: 12 }, usePointStyle: true, padding: 12 } },
                    tooltip: {
                        backgroundColor: '#1a2a5e',
                        callbacks: {
                            label: c => {
                                const total = c.dataset.data.reduce((s, v) => s + v, 0) || 1;
                                const pct = (c.parsed / total) * 100;
                                if (state.mode === 'dca') return `${c.label}: ${fmtEUR(c.parsed)}/mois (${pct.toFixed(1)} %)`;
                                return `${c.label}: ${pct.toFixed(1)} %`;
                            }
                        }
                    }
                }
            }
        });
    }

    /* ==========================================================
       EXPORTS
       ========================================================== */
    function buildExportRows() {
        const r = state.lastResult;
        if (!r) return null;

        // Sheet 1: synthèse
        const synthese = [
            ['Simulateur d\'investissement IFA'],
            ['Date de simulation', new Date().toLocaleDateString('fr-FR')],
            [],
            ['PARAMÈTRES'],
            ['Capital initial', state.params.initial],
            ['Versement mensuel (€)', r.monthly],
            ['Horizon (années)', state.params.years],
            ['Inflation annuelle (%)', state.params.inflation],
            ['Frais annuels (%)', state.params.fees],
            ['Fiscalité (%)', state.params.tax],
            ['Mode', state.mode === 'weight' ? 'Pondération en %' : 'Montant € par mois'],
            [],
            ['RÉSULTATS'],
            ['Rendement pondéré net (% / an)', +(r.netAnnualPct).toFixed(2)],
            ['Capital final estimé (€)', +r.finalNominal.toFixed(2)],
            ['Capital final en € constants (€)', +r.finalReal.toFixed(2)],
            ['Total versé (€)', +r.totalContrib.toFixed(2)],
            ['Plus-value (€)', +r.gain.toFixed(2)],
            ['Plus-value (%)', +r.gainPct.toFixed(2)],
            [],
            ['COMPARAISONS (capital final)'],
            ['Avec DCA', +r.dcaFinal.toFixed(2)],
            ['Apport unique sans DCA', +r.lumpFinal.toFixed(2)],
            ['Livret A (3 %)', +r.livretFinal.toFixed(2)],
            ['Cash (sans investir)', +r.cashFinal.toFixed(2)]
        ];

        // Sheet 2: portefeuille
        const portfolio = [
            ['Ticker', 'Nom', 'Place', 'Rendement annuel (%)',
             state.mode === 'weight' ? 'Pondération (%)' : 'DCA mensuel (€)']
        ];
        state.portfolio.forEach(p => {
            portfolio.push([
                p.symbol, p.name, p.exch || '',
                +(p.cagr || 0).toFixed(2),
                state.mode === 'weight' ? +(p.weight || 0).toFixed(2) : +(p.dca || 0).toFixed(2)
            ]);
        });

        // Sheet 3: projection annuelle
        const proj = [
            ['Année', 'Versé sur l\'année (€)', 'Total versé (€)', 'Intérêts de l\'année (€)', 'Capital fin d\'année (€)', 'Plus-value cumulée (€)']
        ];
        r.median.forEach(row => {
            proj.push([
                row.year,
                +row.contributedYear.toFixed(2),
                +row.contributedTotal.toFixed(2),
                +row.interestYear.toFixed(2),
                +row.balance.toFixed(2),
                +row.gainCum.toFixed(2)
            ]);
        });

        // Sheet 4: scénarios
        const scen = [['Année', 'Pessimiste (-3 pts) (€)', 'Médian (€)', 'Optimiste (+2 pts) (€)']];
        r.median.forEach((row, i) => {
            scen.push([row.year, +r.pessim[i].balance.toFixed(2), +row.balance.toFixed(2), +r.optim[i].balance.toFixed(2)]);
        });

        return { synthese, portfolio, proj, scen };
    }

    $('#export-xlsx').addEventListener('click', () => {
        if (!state.portfolio.length) { toast('Ajoutez au moins une action.', 'error'); return; }
        const rows = buildExportRows();
        if (!rows) return;
        const wb = XLSX.utils.book_new();

        const ws1 = XLSX.utils.aoa_to_sheet(rows.synthese);
        const ws2 = XLSX.utils.aoa_to_sheet(rows.portfolio);
        const ws3 = XLSX.utils.aoa_to_sheet(rows.proj);
        const ws4 = XLSX.utils.aoa_to_sheet(rows.scen);

        // Column widths
        ws1['!cols'] = [{ wch: 36 }, { wch: 22 }];
        ws2['!cols'] = [{ wch: 12 }, { wch: 36 }, { wch: 14 }, { wch: 18 }, { wch: 18 }];
        ws3['!cols'] = [{ wch: 8 }, { wch: 22 }, { wch: 18 }, { wch: 22 }, { wch: 22 }, { wch: 22 }];
        ws4['!cols'] = [{ wch: 8 }, { wch: 22 }, { wch: 18 }, { wch: 22 }];

        XLSX.utils.book_append_sheet(wb, ws1, 'Synthèse');
        XLSX.utils.book_append_sheet(wb, ws2, 'Portefeuille');
        XLSX.utils.book_append_sheet(wb, ws3, 'Projection annuelle');
        XLSX.utils.book_append_sheet(wb, ws4, 'Scénarios');

        const filename = `IFA_Simulation_${new Date().toISOString().slice(0,10)}.xlsx`;
        XLSX.writeFile(wb, filename);
        toast('Fichier Excel généré ✓');
    });

    $('#export-csv').addEventListener('click', () => {
        if (!state.portfolio.length) { toast('Ajoutez au moins une action.', 'error'); return; }
        const rows = buildExportRows();
        if (!rows) return;
        const sections = [
            ['# SYNTHÈSE'], ...rows.synthese, [],
            ['# PORTEFEUILLE'], ...rows.portfolio, [],
            ['# PROJECTION ANNUELLE'], ...rows.proj, [],
            ['# SCÉNARIOS'], ...rows.scen
        ];
        const csv = sections.map(r =>
            r.map(c => {
                if (c == null) return '';
                const s = String(c);
                if (s.includes(';') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
                return s;
            }).join(';')
        ).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `IFA_Simulation_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
        toast('CSV exporté ✓');
    });

    /* ==========================================================
       INIT
       ========================================================== */
    function init() {
        // Priorité : URL hash > localStorage > portefeuille par défaut
        const fromHash = loadFromHash();
        const fromStorage = loadFromStorage();
        const seed = fromHash || fromStorage;

        if (seed && Array.isArray(seed.portfolio) && seed.portfolio.length) {
            applyState(seed);
            renderPortfolio();
            recompute();
            if (fromHash) {
                toast('Portefeuille restauré depuis le lien partagé ✓');
                // Nettoie l'URL pour ne pas réimporter à chaque rechargement
                history.replaceState(null, '', location.pathname);
            }
        } else {
            renderPortfolio();
            recompute();
            // Premier passage : on charge un portefeuille de démonstration
            addToPortfolio({ symbol: 'CW8.PA', name: 'Amundi MSCI World UCITS ETF', exch: 'Paris' });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
