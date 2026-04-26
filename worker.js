/**
 * Cloudflare Worker — proxy CORS pour Yahoo Finance
 * ------------------------------------------------------------------
 * Déploiement (5 min) :
 *   1. Créer un compte gratuit sur https://dash.cloudflare.com (sans carte bancaire).
 *   2. Menu "Workers & Pages" -> "Create" -> "Create Worker".
 *   3. Coller le contenu de ce fichier, cliquer "Deploy".
 *   4. Copier l'URL fournie (ex: https://ifa-yahoo.xxxxx.workers.dev).
 *   5. Coller cette URL dans simulateur.js, variable CLOUDFLARE_WORKER_URL.
 *
 * Suppression :
 *   - Vider CLOUDFLARE_WORKER_URL dans simulateur.js (le site refonctionne aussitôt avec les proxies publics).
 *   - Et/ou supprimer le Worker depuis le dashboard Cloudflare.
 *
 * Quota gratuit : 100 000 requêtes/jour. Le cache 5 min ci-dessous réduit
 * massivement la consommation pour les recherches répétées.
 */
export default {
    async fetch(request) {
        const url = new URL(request.url);
        const target = url.searchParams.get('url');

        if (!target) {
            return new Response('Missing ?url= parameter', {
                status: 400,
                headers: { 'access-control-allow-origin': '*' }
            });
        }

        // Anti-abus : on n'accepte QUE les URLs Yahoo Finance.
        if (!/^https:\/\/query[12]\.finance\.yahoo\.com\//.test(target)) {
            return new Response('Only Yahoo Finance URLs are allowed', {
                status: 403,
                headers: { 'access-control-allow-origin': '*' }
            });
        }

        try {
            const upstream = await fetch(target, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; IFA-Simulateur/1.0)',
                    'Accept': 'application/json'
                },
                cf: { cacheTtl: 300, cacheEverything: true }
            });

            const body = await upstream.arrayBuffer();
            return new Response(body, {
                status: upstream.status,
                headers: {
                    'content-type': upstream.headers.get('content-type') || 'application/json',
                    'access-control-allow-origin': '*',
                    'access-control-allow-methods': 'GET, OPTIONS',
                    'cache-control': 'public, max-age=300'
                }
            });
        } catch (e) {
            return new Response('Upstream fetch failed: ' + e.message, {
                status: 502,
                headers: { 'access-control-allow-origin': '*' }
            });
        }
    }
};
