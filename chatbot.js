/* IFA Chatbot — rule-based finance assistant */

(function () {
    'use strict';

    // ---------- Disclaimers (rotated randomly) ----------
    const DISCLAIMERS = [
        "Rappel amical : je vulgarise, je ne conseille pas. Pour une décision financière, rapprochez-vous d'un professionnel.",
        "Ceci est une explication générale, pas un conseil personnalisé. Votre situation mérite une analyse sur mesure.",
        "Information pédagogique uniquement — aucune recommandation d'investissement. Consultez un conseiller avant d'agir.",
        "Je démystifie, je ne prescris pas. À vous de réfléchir (et idéalement d'en parler à un pro).",
        "L'IFA éduque, elle ne conseille pas. Pour votre argent, parlez à un conseiller financier agréé.",
        "Note : les marchés fluctuent, les performances passées ne préjugent pas des futures. À étudier avec un expert.",
        "Petit rappel : chaque placement comporte un risque. Cette réponse est générale — votre cas est unique.",
        "Avertissement : informations à titre indicatif. Un professionnel certifié (CIF/CGP) reste votre meilleur allié.",
        "Disclaimer IFA : on décrypte, on n'oriente pas. Votre argent, vos choix — mais éclairés de préférence.",
        "Pour info : cette réponse est pédagogique. Les décisions patrimoniales se prennent avec un expert de votre situation.",
    ];

    // ---------- Knowledge base ----------
    // Each entry: keywords (match any), answer (can be HTML).
    const KB = [
        // ===== Produits financiers =====
        {
            keys: ['action', 'actions', 'actionnaire', 'shares', 'stocks'],
            answer: "Une <strong>action</strong> représente une part du capital d'une entreprise. L'acheter, c'est devenir copropriétaire (très minoritaire 😄). Deux sources de gain : la hausse du cours (plus-value) et les dividendes versés par l'entreprise.<br><br>📈 Rendement potentiellement élevé, mais volatilité forte : le cours peut baisser fortement."
        },
        {
            keys: ['obligation', 'obligations', 'bond', 'bonds', 'emprunt'],
            answer: "Une <strong>obligation</strong> est un prêt que vous accordez à une entreprise ou à un État. En échange, vous recevez des intérêts (le coupon) et le remboursement du capital à l'échéance.<br><br>📊 Moins risqué que les actions, mais rendement généralement plus faible. Attention au risque de défaut (l'emprunteur ne rembourse pas) et au risque de taux."
        },
        {
            keys: ['etf', 'trackers', 'tracker', 'indiciel', 'indicielle'],
            answer: "Un <strong>ETF</strong> (ou tracker) est un fonds coté en bourse qui réplique un indice (ex : CAC 40, S&P 500, MSCI World). En une seule ligne, vous achetez des centaines d'entreprises.<br><br>✅ Avantages : diversification instantanée, frais très bas (0,1-0,3%/an), simplicité.<br>⚠️ L'ETF baisse quand l'indice baisse — pas magique."
        },
        {
            keys: ['pea', 'plan epargne action', 'plan epargne en action'],
            answer: "Le <strong>PEA</strong> (Plan d'Épargne en Actions) est une enveloppe fiscale française.<br><br>🎯 Plafond : 150 000 €<br>📅 Après 5 ans : exonération d'impôt sur les plus-values (seuls les prélèvements sociaux de 17,2% restent dus).<br>🌍 Limité aux actions européennes + ETF éligibles (mais on peut quand même accéder au monde via ETF synthétiques).<br><br>Excellent outil pour un étudiant qui veut investir long terme."
        },
        {
            keys: ['cto', 'compte titre', 'compte-titre', 'compte titres'],
            answer: "Le <strong>CTO</strong> (Compte-Titres Ordinaire) est l'enveloppe boursière classique. Pas de plafond, accès mondial à tous les actifs.<br><br>💰 Fiscalité : flat tax de 30% (PFU) sur les plus-values et dividendes.<br><br>Moins avantageux fiscalement que le PEA, mais plus souple."
        },
        {
            keys: ['assurance vie', 'assurance-vie', 'av'],
            answer: "L'<strong>assurance-vie</strong> est l'enveloppe préférée des Français.<br><br>📅 Après 8 ans : fiscalité avantageuse (abattement de 4 600 €/an sur les gains, 9 200 € en couple).<br>🎁 Transmission optimisée : jusqu'à 152 500 €/bénéficiaire exonérés de droits de succession.<br>💼 Deux compartiments : fonds en euros (sécurisé, ~2-3%/an) et unités de compte (UC, plus dynamiques mais risqués)."
        },
        {
            keys: ['livret a', 'livret jeune', 'ldds', 'epargne reglementee', 'livret'],
            answer: "Les <strong>livrets réglementés</strong> : épargne de précaution, 100% garantie.<br><br>• Livret A : plafond 22 950 €, taux 3% net (2026)<br>• LDDS : plafond 12 000 €, même taux<br>• Livret Jeune (12-25 ans) : plafond 1 600 €, taux ≥ Livret A<br><br>✅ Parfait pour votre épargne de précaution (3 à 6 mois de dépenses), mais pas pour investir long terme (l'inflation ronge le rendement)."
        },
        {
            keys: ['scpi', 'pierre papier'],
            answer: "Les <strong>SCPI</strong> (Sociétés Civiles de Placement Immobilier) permettent d'investir dans l'immobilier sans gérer de bien. Vous achetez des parts, une société gère les immeubles et vous verse des loyers.<br><br>💰 Rendement ~4-6%/an<br>⚠️ Frais d'entrée élevés (8-12%), liquidité faible, fiscalité lourde hors assurance-vie."
        },
        {
            keys: ['crypto', 'cryptomonnaie', 'cryptomonnaies', 'bitcoin', 'btc', 'ethereum', 'eth', 'blockchain'],
            answer: "Les <strong>cryptomonnaies</strong> sont des actifs numériques reposant sur la blockchain.<br><br>🪙 Bitcoin : la plus ancienne, souvent vue comme un \"or numérique\".<br>💠 Ethereum : plateforme pour les smart contracts.<br><br>⚠️ Classe d'actifs ultra-volatile (±50% en quelques mois possible). À considérer comme une petite portion (<5-10%) du patrimoine, jamais en levier, et uniquement de l'argent dont on peut se passer intégralement."
        },
        {
            keys: ['per', 'plan epargne retraite', 'retraite'],
            answer: "Le <strong>PER</strong> (Plan d'Épargne Retraite) permet de préparer sa retraite avec un avantage fiscal à l'entrée : les versements sont déductibles du revenu imposable (dans la limite d'un plafond).<br><br>🔒 Argent bloqué jusqu'à la retraite (sauf cas de déblocage : achat résidence principale, accident de la vie).<br>📊 À la sortie : capital ou rente, imposés."
        },
        // ===== Concepts =====
        {
            keys: ['bourse', 'marche boursier', 'marche financier'],
            answer: "La <strong>bourse</strong> est un marché où s'échangent les titres financiers (actions, obligations, ETF...). Les prix résultent de l'offre et de la demande en temps réel.<br><br>🏛️ Grandes places : NYSE, Nasdaq, Euronext (Paris), London Stock Exchange, Tokyo.<br><br>💡 La bourse n'est pas un casino : c'est un moyen de financer l'économie réelle en achetant des parts d'entreprises qui produisent de la valeur."
        },
        {
            keys: ['inflation'],
            answer: "L'<strong>inflation</strong> est la hausse générale des prix au fil du temps. 2% d'inflation = ce qui coûte 100 € aujourd'hui coûtera 102 € dans un an.<br><br>💸 Conséquence : votre argent sous le matelas perd du pouvoir d'achat. 10 000 € à 3% d'inflation pendant 10 ans = valent environ 7 441 € en pouvoir d'achat.<br><br>🛡️ C'est pourquoi investir est important : pour que votre argent \"batte l'inflation\"."
        },
        {
            keys: ['taux interet', 'taux d interet', 'taux directeur', 'bce', 'fed'],
            answer: "Les <strong>taux d'intérêt</strong> sont le prix de l'argent. Les banques centrales (BCE en zone euro, Fed aux USA) fixent les taux directeurs.<br><br>📈 Taux haut : crédits chers, épargne rémunérée, économie freinée, lutte contre l'inflation.<br>📉 Taux bas : crédits bon marché, épargne peu rémunérée, économie stimulée.<br><br>🎯 Les marchés actions et obligataires réagissent fortement aux décisions de taux."
        },
        {
            keys: ['interet compose', 'interets composes', 'capitalisation'],
            answer: "Les <strong>intérêts composés</strong>, qu'Einstein aurait qualifiés de \"8e merveille du monde\" : vos intérêts génèrent eux-mêmes des intérêts.<br><br>💥 Exemple : 100 €/mois investis à 7%/an pendant 40 ans = <strong>262 481 €</strong> (pour 48 000 € versés).<br>⏰ Temps = votre meilleur allié. Plus vous commencez tôt, plus la magie opère.<br><br>C'est LE concept à retenir quand on est étudiant."
        },
        {
            keys: ['diversification', 'diversifier'],
            answer: "La <strong>diversification</strong> consiste à ne pas mettre tous ses œufs dans le même panier.<br><br>🌍 Par zone géographique (Europe, USA, émergents)<br>🏭 Par secteur (tech, santé, énergie, conso...)<br>📊 Par classe d'actifs (actions, obligations, immobilier, cash)<br><br>✨ Un ETF World contient ~1500 entreprises de 23 pays — diversification instantanée en une ligne."
        },
        {
            keys: ['risque', 'volatilite', 'volatilité'],
            answer: "<strong>Risque et rendement</strong> vont de pair : plus on veut gagner, plus on accepte de perdre temporairement.<br><br>📉 Volatilité = amplitude des variations. Actions : élevée. Obligations : modérée. Livret A : nulle (mais rendement faible).<br><br>🧭 La règle d'or : n'investissez jamais plus que ce que vous pouvez laisser 5-10 ans sans y toucher."
        },
        {
            keys: ['dividende', 'dividendes'],
            answer: "Un <strong>dividende</strong> est la part du bénéfice qu'une entreprise reverse à ses actionnaires.<br><br>💶 Versé en général une à deux fois par an.<br>📊 Le rendement du dividende = dividende annuel / cours de l'action.<br><br>Attention : une entreprise qui verse un gros dividende peut être en déclin (peu de réinvestissement). La qualité > le rendement brut."
        },
        {
            keys: ['dca', 'dollar cost averaging', 'investissement programme'],
            answer: "Le <strong>DCA</strong> (Dollar Cost Averaging) consiste à investir un montant fixe régulièrement (ex : 100 €/mois), quel que soit le niveau du marché.<br><br>✅ Avantages : lisse les points d'entrée, évite de \"timer\" le marché, créé une discipline.<br><br>C'est souvent la meilleure stratégie pour un débutant. Mettez-le en place en automatique et oubliez."
        },
        {
            keys: ['bear market', 'bull market', 'marche haussier', 'marche baissier', 'krach', 'crash', 'correction'],
            answer: "Le jargon :<br><br>🐂 <strong>Bull market</strong> (marché haussier) : les prix montent durablement.<br>🐻 <strong>Bear market</strong> (marché baissier) : baisse > 20% depuis un pic.<br>📉 <strong>Correction</strong> : baisse de 10 à 20%.<br>💥 <strong>Krach</strong> : effondrement brutal (ex : 1929, 2008, mars 2020).<br><br>Les krachs font partie du jeu. Historiquement, les marchés finissent toujours par remonter — mais ça peut prendre des années."
        },
        {
            keys: ['analyse fondamentale', 'fondamentale', 'per ratio', 'per action'],
            answer: "L'<strong>analyse fondamentale</strong> évalue la valeur intrinsèque d'une entreprise.<br><br>📊 Ratios clés :<br>• PER (Price Earning Ratio) = cours / bénéfice par action<br>• PBR = cours / valeur comptable<br>• Marge, croissance, endettement, ROE<br><br>🎯 Philosophie value investing (Warren Buffett) : acheter une action quand elle se paie moins que sa vraie valeur."
        },
        {
            keys: ['analyse technique', 'chartiste', 'chart', 'bougies'],
            answer: "L'<strong>analyse technique</strong> étudie les graphiques pour anticiper les mouvements de cours. Supports, résistances, figures, moyennes mobiles, RSI, MACD...<br><br>⚠️ Très débattue : pour certains, c'est une science ; pour d'autres, de l'astrologie déguisée. Les études académiques sont plutôt sceptiques.<br><br>Un usage plus modeste : identifier des zones clés pour placer des ordres."
        },
        {
            keys: ['capitalisation', 'capi', 'market cap', 'large cap', 'small cap', 'mid cap'],
            answer: "La <strong>capitalisation boursière</strong> = cours × nombre d'actions en circulation. C'est la valeur totale de l'entreprise en bourse.<br><br>🐘 Large caps : > 10 Md€ (stables, liquides)<br>🐎 Mid caps : 2-10 Md€<br>🐁 Small caps : < 2 Md€ (potentiel de croissance, plus volatiles)<br><br>Apple ou Microsoft : > 3 000 milliards $. LVMH : ~350 Md€."
        },
        {
            keys: ['ipo', 'introduction bourse', 'levee fonds'],
            answer: "Une <strong>IPO</strong> (Initial Public Offering) est l'introduction en bourse : une entreprise met ses actions sur le marché pour la première fois pour lever des fonds.<br><br>📈 Exemples récents : Stellantis, Arm, Reddit.<br>⚠️ Investir lors d'une IPO = très spéculatif. Volatilité énorme les premiers mois. Mieux vaut attendre 6-12 mois pour voir la réalité."
        },
        {
            keys: ['fiscalite', 'flat tax', 'pfu', 'impot plus value'],
            answer: "<strong>Fiscalité</strong> des placements en France :<br><br>💼 CTO, crypto : <strong>flat tax (PFU) de 30%</strong> (17,2% prélèvements sociaux + 12,8% IR)<br>🎯 PEA > 5 ans : seulement 17,2% PS<br>📆 Assurance-vie > 8 ans : abattement 4 600 €/an + PS<br>💰 Livret A/LDDS/LJ : <strong>totalement exonérés</strong><br><br>Option : imposition au barème de l'IR si plus avantageuse."
        },
        {
            keys: ['epargne precaution', 'epargne de precaution', 'urgence', 'fonds urgence'],
            answer: "L'<strong>épargne de précaution</strong> est votre filet de sécurité : 3 à 6 mois de dépenses courantes disponibles immédiatement.<br><br>🏦 À placer sur Livret A / LDDS : rémunéré, sans risque, disponible en 24-48h.<br><br>❌ Avant d'investir en bourse, cette épargne doit être constituée. Pourquoi ? Pour ne pas être forcé de vendre vos placements au pire moment en cas de coup dur."
        },
        {
            keys: ['immobilier', 'investissement locatif', 'locatif'],
            answer: "L'<strong>immobilier locatif</strong> :<br><br>✅ Effet de levier du crédit, revenus réguliers, actif tangible.<br>⚠️ Gestion chronophage, vacance locative, impayés, travaux, fiscalité lourde (LMNP, SCI, régime réel...).<br><br>💡 Alternative sans les soucis : SCPI, foncières cotées (REIT), crowdfunding immobilier. Moins de rendement brut mais zéro gestion."
        },
        {
            keys: ['forex', 'devises', 'change'],
            answer: "Le <strong>forex</strong> (foreign exchange) est le marché des devises (EUR/USD, USD/JPY, etc.). 7 500 milliards $ échangés par jour.<br><br>⚠️ Avec effet de levier, 95% des traders particuliers perdent de l'argent sur le long terme. Ce n'est <strong>pas</strong> un terrain pour débutant."
        },
        {
            keys: ['private equity', 'capital investissement', 'non cote'],
            answer: "Le <strong>private equity</strong> consiste à investir dans des entreprises non cotées. Rendements historiquement élevés (10-15%/an) mais :<br><br>🔒 Illiquide (argent bloqué 5-10 ans)<br>💰 Tickets d'entrée élevés (souvent 100 k€+)<br>🎯 Accessible aux particuliers via FCPR, FCPI, FIP (avec avantages fiscaux mais réservé aux patrimoines avancés)."
        },
        {
            keys: ['hedge fund', 'fonds alternatif'],
            answer: "Les <strong>hedge funds</strong> sont des fonds d'investissement avec stratégies complexes (long/short, arbitrage, macro...). Réservés aux investisseurs qualifiés.<br><br>💼 Frais typiques : 2% fixes + 20% sur performance (\"2 and 20\").<br><br>⚠️ Performances moyennes souvent décevantes vs un simple ETF S&P 500."
        },
        {
            keys: ['recession', 'depression', 'crise economique'],
            answer: "Une <strong>récession</strong> = contraction du PIB sur ≥ 2 trimestres consécutifs. Chômage monte, consommation baisse, les marchés anticipent souvent en amont.<br><br>📉 Opportunité pour un investisseur long terme : acheter pendant les récessions a historiquement été très rentable (à condition de tenir psychologiquement)."
        },
        {
            keys: ['stablecoin', 'usdc', 'usdt', 'tether'],
            answer: "Les <strong>stablecoins</strong> sont des cryptos adossées à une monnaie stable (USD, EUR).<br><br>🪙 USDC, USDT, DAI...<br>✅ Utilisés pour entrer/sortir des cryptos sans toucher de fiat.<br>⚠️ Risque de déconnexion (de-peg) comme Terra-UST en 2022 (-100% en 3 jours). Tous les stablecoins ne se valent pas — USDC > USDT sur la transparence."
        },
        {
            keys: ['nft'],
            answer: "Les <strong>NFT</strong> (Non-Fungible Tokens) sont des jetons uniques sur blockchain, souvent associés à de l'art numérique.<br><br>📈 Boom en 2021 (Bored Apes, CryptoPunks)<br>📉 Crash depuis 2022 — la plupart ont perdu 80-95% de leur valeur.<br><br>Considérez les NFT comme du collectionnisme spéculatif, pas un investissement financier sérieux."
        },
        {
            keys: ['warren buffett', 'buffett'],
            answer: "<strong>Warren Buffett</strong> (Oracle d'Omaha) : l'un des plus grands investisseurs de l'histoire. Sa société Berkshire Hathaway a fait ~20%/an pendant 60 ans.<br><br>💡 Sa philosophie :<br>• Acheter des entreprises de qualité à bon prix<br>• Vision long terme (\"notre durée de détention préférée, c'est pour toujours\")<br>• Ne jamais investir dans ce qu'on ne comprend pas<br><br>À lire : ses lettres annuelles aux actionnaires, mines d'or pédagogiques."
        },
        {
            keys: ['trader', 'trading', 'day trading', 'scalping'],
            answer: "Le <strong>trading</strong> actif (day trading, scalping) consiste à acheter/vendre fréquemment pour capter des petits mouvements.<br><br>📊 Statistiques : 70 à 95% des day traders particuliers perdent de l'argent sur le long terme (études AMF, SEC).<br><br>💡 Pour 99% des gens, l'investissement passif (ETF + long terme) bat de très loin le trading actif, avec infiniment moins de stress."
        },
        // ===== Méta / IFA =====
        {
            keys: ['ifa', 'insa finance', 'association', 'qui etes vous'],
            answer: "L'<strong>INSA Finance Association (IFA)</strong> est l'association de finance de l'INSA Lyon.<br><br>🎯 Notre mission : sensibiliser les étudiants aux multiples facettes de la finance via conférences, afterworks, tables rondes, articles, newsletter.<br><br>👋 Envie de nous rejoindre ? Direction la section <a href=\"index.html#rejoindre\">Nous rejoindre</a> de l'accueil !"
        },
        {
            keys: ['rejoindre', 'membre', 'adherer', 'adhesion', 'inscription'],
            answer: "Deux façons de rejoindre l'IFA, <strong>toutes les deux gratuites</strong> :<br><br>⭐ <strong>Membre Actif</strong> : participation à l'organisation des événements, rédaction d'articles, pôles (intervenant, communication, activité interne).<br>👤 <strong>Membre Adhérent</strong> : accès aux événements, à la communauté WhatsApp, à la newsletter.<br><br>➡️ Inscription sur <a href=\"index.html#rejoindre\">la page d'accueil</a>, section Nous rejoindre."
        },
        {
            keys: ['newsletter', 'newsletters'],
            answer: "La <strong>newsletter IFA</strong> arrive chaque semaine avec :<br><br>📊 L'essentiel de l'actualité économique et financière<br>📅 Les événements à venir<br>🎁 Des opportunités exclusives<br>⏱️ Lisible en moins de 15 minutes<br><br>➡️ Inscription en bas de la page d'accueil !"
        },
        {
            keys: ['evenement', 'evenements', 'conference', 'conferences', 'afterwork'],
            answer: "L'IFA organise 15+ événements par an : conférences avec pros, afterworks, tables rondes, visites, interviews.<br><br>➡️ Tous les événements à venir sur <a href=\"evenements.html\">la page dédiée</a>."
        },
        {
            keys: ['intervenant', 'conferencier', 'speaker'],
            answer: "Vous êtes pro de la finance et souhaitez intervenir à l'INSA Lyon ? C'est <a href=\"intervenant.html\">par ici</a> — on adore rencontrer de nouveaux intervenants !"
        },
        {
            keys: ['contact', 'email', 'mail', 'joindre', 'contacter'],
            answer: "Pour nous contacter :<br><br>📧 insa.finance@asso-insa-lyon.fr<br>📱 Instagram : @insa.finance.asso<br>💼 LinkedIn : INSA Finance Association<br><br>Ou via le formulaire de <a href=\"index.html#contact\">contact</a> sur la page d'accueil."
        },
        {
            keys: ['etudiant', 'commencer', 'debuter', 'comment commencer', 'quel montant'],
            answer: "Pour un étudiant qui veut commencer :<br><br>1️⃣ Constituer 3-6 mois d'épargne de précaution (Livret A)<br>2️⃣ Ouvrir un PEA dès que possible (même avec 0 €) : l'horloge fiscale des 5 ans démarre<br>3️⃣ Mettre en place un DCA de 50-100 €/mois sur un ETF World<br>4️⃣ Laisser faire le temps (15-30 ans)<br><br>💡 Le meilleur moment pour planter un arbre, c'était il y a 20 ans. Le deuxième meilleur moment, c'est maintenant."
        },
        {
            keys: ['livre', 'livres', 'lecture', 'lire'],
            answer: "Quelques <strong>lectures de référence</strong> pour débuter :<br><br>📘 \"L'investisseur intelligent\" — Benjamin Graham<br>📘 \"Père riche, père pauvre\" — Robert Kiyosaki (mindset)<br>📘 \"La psychologie de l'argent\" — Morgan Housel<br>📘 \"Tout le monde mérite d'être riche\" — Olivier Seban<br><br>Et bien sûr : les articles de l'IFA 😉"
        },
    ];

    // ---------- Greeting + fallback ----------
    const GREETINGS = [
        "Salut 👋 Je suis l'assistant IFA. Pose-moi tes questions sur la finance : actions, ETF, PEA, crypto, fiscalité... Je démêle le jargon.",
        "Bienvenue ! Je suis là pour vulgariser la finance — pose-moi ce que tu veux (investissements, bourse, fiscalité, IFA, etc.).",
        "Hey 👋 Je réponds aux questions finance de base : actions, obligations, ETF, PEA, crypto, inflation, taux... À toi !"
    ];

    const SUGGESTIONS = [
        "C'est quoi un ETF ?",
        "Comment commencer à investir ?",
        "PEA ou assurance-vie ?",
        "C'est quoi l'inflation ?",
        "Rejoindre l'IFA",
    ];

    const NO_MATCH = [
        "Je n'ai pas compris parfaitement. Voici des sujets que je maîtrise mieux :",
        "Hmm, pas sûr de cerner. Essaie plutôt une de ces pistes :",
        "Je sèche un peu sur celle-ci. Tu peux reformuler ou piocher ici :",
    ];

    // ---------- Text normalization ----------
    function normalize(txt) {
        return (txt || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // remove diacritics
            .replace(/[^\w\s]/g, ' ') // punctuation → space
            .replace(/\s+/g, ' ')
            .trim();
    }

    function pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // ---------- Matching ----------
    function findAnswer(userText) {
        const txt = ' ' + normalize(userText) + ' ';
        let best = null;
        let bestScore = 0;

        for (const entry of KB) {
            let score = 0;
            for (const k of entry.keys) {
                const nk = normalize(k);
                if (txt.includes(' ' + nk + ' ') || txt.includes(' ' + nk) || txt.endsWith(nk)) {
                    score += nk.split(' ').length * 2; // multi-word keywords score higher
                } else if (nk.length > 4 && txt.includes(nk)) {
                    score += 1;
                }
            }
            if (score > bestScore) {
                bestScore = score;
                best = entry;
            }
        }

        return bestScore >= 2 ? best : null;
    }

    // ---------- DOM ----------
    let launcher, panel, messagesEl, inputEl, sendBtn, chipsEl;
    let isOpen = false;
    let hasGreeted = false;

    function createUI() {
        // Launcher
        launcher = document.createElement('button');
        launcher.className = 'ifa-chat-launcher';
        launcher.setAttribute('aria-label', "Ouvrir l'assistant IFA");
        launcher.innerHTML = '<i class="fas fa-comments"></i><span class="ifa-chat-badge">1</span><span class="ifa-chat-tooltip">Posez-moi vos questions ici<span class="ifa-chat-tooltip-close" aria-label="Fermer">&times;</span></span>';
        launcher.addEventListener('click', togglePanel);
        document.body.appendChild(launcher);

        // Tooltip close button (dismiss without opening chat)
        const tooltipClose = launcher.querySelector('.ifa-chat-tooltip-close');
        if (tooltipClose) {
            tooltipClose.addEventListener('click', function (e) {
                e.stopPropagation();
                launcher.classList.add('tooltip-dismissed');
            });
        }

        // Panel
        panel = document.createElement('div');
        panel.className = 'ifa-chat-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', 'Rhino');
        panel.innerHTML = `
            <div class="ifa-chat-header">
                <div class="ifa-chat-avatar">IFA</div>
                <div class="ifa-chat-header-text">
                    <h3 class="ifa-chat-title">Rhino</h3>
                    <div class="ifa-chat-status">Prêt à répondre</div>
                </div>
                <button class="ifa-chat-close" aria-label="Fermer"><i class="fas fa-times"></i></button>
            </div>
            <div class="ifa-chat-messages" aria-live="polite"></div>
            <div class="ifa-chat-chips"></div>
            <form class="ifa-chat-input">
                <input type="text" placeholder="Pose ta question..." aria-label="Votre question" autocomplete="off">
                <button type="submit" class="ifa-chat-send" aria-label="Envoyer"><i class="fas fa-paper-plane"></i></button>
            </form>
        `;
        document.body.appendChild(panel);

        messagesEl = panel.querySelector('.ifa-chat-messages');
        chipsEl = panel.querySelector('.ifa-chat-chips');
        const form = panel.querySelector('.ifa-chat-input');
        inputEl = form.querySelector('input');
        sendBtn = form.querySelector('.ifa-chat-send');

        panel.querySelector('.ifa-chat-close').addEventListener('click', closePanel);
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handleUserInput(inputEl.value);
        });

        renderChips(SUGGESTIONS);
    }

    function togglePanel() {
        isOpen ? closePanel() : openPanel();
    }

    function openPanel() {
        panel.classList.add('is-open');
        launcher.classList.add('is-open');
        isOpen = true;
        if (!hasGreeted) {
            hasGreeted = true;
            setTimeout(() => addBotMessage(pickRandom(GREETINGS), false), 400);
        }
        setTimeout(() => inputEl.focus(), 400);
    }

    function closePanel() {
        panel.classList.remove('is-open');
        launcher.classList.remove('is-open');
        isOpen = false;
    }

    function renderChips(items) {
        chipsEl.innerHTML = '';
        items.forEach(text => {
            const chip = document.createElement('button');
            chip.className = 'ifa-chip';
            chip.type = 'button';
            chip.textContent = text;
            chip.addEventListener('click', () => handleUserInput(text));
            chipsEl.appendChild(chip);
        });
    }

    function addMessage(html, cls) {
        const msg = document.createElement('div');
        msg.className = 'ifa-msg ' + cls;
        msg.innerHTML = html;
        messagesEl.appendChild(msg);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        return msg;
    }

    function addBotMessage(html, withDisclaimer) {
        showTyping();
        const delay = 500 + Math.min(1600, html.length * 6);
        setTimeout(() => {
            hideTyping();
            let finalHtml = html;
            if (withDisclaimer) {
                finalHtml += `<div class="ifa-msg-disclaimer">⚖️ ${pickRandom(DISCLAIMERS)}</div>`;
            }
            addMessage(finalHtml, 'bot');
        }, delay);
    }

    let typingEl = null;
    function showTyping() {
        if (typingEl) return;
        typingEl = document.createElement('div');
        typingEl.className = 'ifa-typing';
        typingEl.innerHTML = '<span></span><span></span><span></span>';
        messagesEl.appendChild(typingEl);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function hideTyping() {
        if (typingEl) {
            typingEl.remove();
            typingEl = null;
        }
    }

    function handleUserInput(text) {
        text = (text || '').trim();
        if (!text) return;
        addMessage(escapeHtml(text), 'user');
        inputEl.value = '';

        const match = findAnswer(text);
        if (match) {
            addBotMessage(match.answer, true);
        } else {
            const html = pickRandom(NO_MATCH);
            addBotMessage(html, false);
            renderChips(pickRandomSuggestions(5));
            return;
        }

        // Rotate suggestions after each answer
        renderChips(pickRandomSuggestions(4));
    }

    function pickRandomSuggestions(n) {
        const pool = [
            "C'est quoi un ETF ?",
            "PEA ou CTO ?",
            "Comment commencer à investir ?",
            "C'est quoi l'inflation ?",
            "Parle-moi des cryptos",
            "Analyse fondamentale ?",
            "Intérêts composés ?",
            "Diversification ?",
            "C'est quoi une SCPI ?",
            "Assurance-vie ?",
            "Livret A ?",
            "Fiscalité des placements",
            "Rejoindre l'IFA",
            "Dividendes ?",
            "C'est quoi un bear market ?",
            "Warren Buffett ?",
            "Faut-il faire du trading ?",
            "Livres pour commencer ?",
        ];
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, n);
    }

    function escapeHtml(s) {
        const div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    }

    // ---------- Init ----------
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createUI);
    } else {
        createUI();
    }
})();
