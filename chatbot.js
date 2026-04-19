/* IFA Chatbot — rule-based finance assistant */

(function () {
    'use strict';

    // ---------- Disclaimers (rotated randomly) ----------
    const DISCLAIMERS = [
        "Rappel amical : je vulgarise, je ne conseille pas. Pour une vraie décision, parle à un pro (pas à ton pote qui a acheté du Shiba Inu).",
        "Ceci est pédagogique, pas un conseil perso. Ton cerveau vaut plus que mon script — utilise-le.",
        "Info éducative uniquement. Avant d'agir, consulte un CGP/CIF certifié (oui, mieux qu'un TikTokeur à Dubaï).",
        "Je démystifie, je ne prescris pas. Tu restes le boss de ton argent.",
        "L'IFA éduque, elle ne dit pas \"achète maintenant 🚀\". Pour ton argent, vois un conseiller agréé.",
        "Les marchés montent, descendent, pleurent, rigolent. Les performances passées ne garantissent rien. Consulte un pro.",
        "Petit mémo : tout placement comporte un risque. Même \"sûr\" ≠ \"zéro risque\" (l'inflation bouffe aussi).",
        "Avertissement : info à titre indicatif. Un CGP/CIF reste ton meilleur allié (ton groupe Discord, moins).",
        "Disclaimer IFA : on décrypte, on n'oriente pas. Ton argent, tes choix — mais éclairés idéalement.",
        "Pour info : cette réponse est générale. Les vraies décisions patrimoniales se prennent avec un expert de ta situation.",
        "Rappel : si quelqu'un te promet +20%/mois garantis, il te ment. Sans exception. Zéro.",
        "Note : même Warren Buffett se trompe parfois. Donc moi aussi. Croise toujours tes sources.",
    ];

    // ---------- Knowledge base ----------
    // Ton : humour étudiant, pédagogique, vulgarisation pro. Chaque réponse doit donner le sourire
    // tout en étant exacte. On parle à un étudiant INSA, pas à un gestionnaire de hedge fund.
    const KB = [
        // ===== Produits financiers =====
        {
            keys: ['action', 'actions', 'actionnaire', 'shares', 'stocks'],
            answer: "Une <strong>action</strong> = un tout petit bout d'entreprise. Acheter une action LVMH, c'est techniquement posséder 0,00000001% de la boîte de Bernard Arnault (bon, il ne t'invitera pas au conseil d'administration 😅).<br><br>💰 Tu gagnes de deux façons :<br>• La plus-value : tu l'achètes à 100 €, tu la revends à 130 € → +30 €<br>• Les dividendes : l'entreprise te reverse une part de ses bénéfices<br><br>⚠️ Ça monte… et ça descend. Parfois salement (-30% en 3 jours, ça s'est déjà vu). Pas pour ton loyer du mois prochain."
        },
        {
            keys: ['obligation', 'obligations', 'bond', 'bonds', 'emprunt'],
            answer: "Une <strong>obligation</strong>, c'est toi qui prêtes du cash à un État ou à une boîte, et en échange ils te versent des intérêts (le \"coupon\") puis te rendent ton capital à l'échéance. Grosso modo : tu joues la banque.<br><br>📊 Moins fun qu'une action, mais plus calme. Les obligations françaises (OAT), allemandes (Bund) ou américaines (Treasury) sont la référence du \"sans risque\" — entre guillemets, parce que zéro risque n'existe pas.<br><br>⚠️ Deux gros risques : le défaut (ex : Argentine, 9 fois en 200 ans 🤡) et le risque de taux (si les taux montent, ton obligation déjà émise perd de la valeur)."
        },
        {
            keys: ['etf', 'trackers', 'tracker', 'indiciel', 'indicielle'],
            answer: "Un <strong>ETF</strong> (tracker), c'est LA meilleure invention pour l'investisseur feignant — au bon sens du terme. C'est un panier d'actions coté en bourse qui réplique un indice. Exemple : un ETF MSCI World = 1 500 entreprises de 23 pays dans une seule ligne.<br><br>✅ Frais ridicules (0,1 à 0,3%/an, vs 1,5-2% pour un fonds classique qui sous-performe quand même).<br>✅ Diversification instantanée, zéro prise de tête.<br>⚠️ Si le marché coule, ton ETF coule aussi — ce n'est pas de la magie, c'est du tuyau.<br><br>💡 Pour un étudiant : commence par un ETF World ou S&P 500, tu bats déjà 80% des gérants pros. 🤓"
        },
        {
            keys: ['pea', 'plan epargne action', 'plan epargne en action'],
            answer: "Le <strong>PEA</strong>, c'est le cadeau fiscal que l'État fait aux Français qui investissent. Franchement : ne pas en ouvrir un quand on est étudiant, c'est comme refuser un kebab offert.<br><br>🎯 Plafond : 150 000 € (t'as un peu de marge 😉)<br>📅 Après 5 ans de détention : zéro impôt sur tes plus-values, juste 17,2% de prélèvements sociaux.<br>🌍 Théoriquement \"Europe only\", mais via les ETF synthétiques tu accèdes au monde entier (S&P 500, Nasdaq, MSCI World…).<br><br>💡 ASTUCE : ouvre-en un MAINTENANT, même avec 10 €. L'horloge des 5 ans démarre à l'ouverture. Quand tu mettras 20 000 € dans 4 ans, tu seras déjà à 1 an de la fiscalité avantageuse. Cadeau du futur toi au futur toi."
        },
        {
            keys: ['cto', 'compte titre', 'compte-titre', 'compte titres'],
            answer: "Le <strong>CTO</strong> (Compte-Titres Ordinaire), c'est la Ferrari sans limiteur : pas de plafond, accès mondial, toutes les actions, tous les pays, crypto ETF, actions US, japonaises, tout.<br><br>💰 Mais : <strong>flat tax de 30%</strong> sur les plus-values et dividendes (vs 17,2% sur PEA >5 ans). L'addition est salée.<br><br>🎯 Quand l'utiliser : quand ton PEA est plein, pour acheter des titres non-éligibles PEA (US directs, obligations, matières premières), ou pour trader. Sinon, priorise le PEA."
        },
        {
            keys: ['assurance vie', 'assurance-vie', 'av'],
            answer: "L'<strong>assurance-vie</strong> : le placement le plus aimé des Français (1 800 milliards € dedans, soit à peu près le prix des avocats toasts mangés à Paris depuis 2015).<br><br>📅 Après 8 ans : abattement de 4 600 €/an sur les gains (9 200 € en couple). Royal.<br>🎁 Transmission en or : jusqu'à 152 500 € par bénéficiaire sans droits de succession. Les notaires détestent ça.<br>💼 Deux compartiments :<br>• <strong>Fonds en euros</strong> : sûr, ~2-3%/an, capital garanti<br>• <strong>Unités de compte (UC)</strong> : ETF, actions, SCPI — plus dynamique mais tu peux perdre<br><br>⚠️ Choisis une assurance-vie EN LIGNE (Linxea, Placement-direct, Boursorama…) : frais divisés par 4 vs ton banquier de quartier."
        },
        {
            keys: ['livret a', 'livret jeune', 'ldds', 'epargne reglementee', 'livret'],
            answer: "Les <strong>livrets réglementés</strong> = ton coffre-fort digital. Garanti par l'État, dispo en 24h, zéro impôt.<br><br>• <strong>Livret A</strong> : plafond 22 950 €, taux 3% net (2026)<br>• <strong>LDDS</strong> : plafond 12 000 €, même taux<br>• <strong>Livret Jeune</strong> (12-25 ans) : plafond 1 600 €, taux ≥ Livret A — OUI tu y as droit !<br>• <strong>LEP</strong> (revenus modestes) : 6%+, le meilleur du marché si t'es éligible<br><br>✅ PARFAIT pour ton épargne de précaution (3 à 6 mois de dépenses).<br>❌ HORRIBLE pour te construire un patrimoine long terme : avec 3% et une inflation à 2,5%, tu gagnes 0,5%/an. En 30 ans, t'as perdu face au marché actions qui fait ~7%."
        },
        {
            keys: ['scpi', 'pierre papier'],
            answer: "La <strong>SCPI</strong> = l'immobilier sans les galères (pas de locataire qui pète le chauffe-eau à 22h le dimanche). Tu achètes des parts, une société gère des immeubles (bureaux, commerces, santé) et te reverse les loyers.<br><br>💰 Rendement brut ~4-6%/an<br>⚠️ Frais d'entrée ÉLEVÉS (8-12%) : il te faut 10+ ans pour les amortir<br>⚠️ Liquidité = ton pote qui rend tes bouquins : aléatoire<br>⚠️ Fiscalité lourde hors assurance-vie (IR + prélèvements sociaux sur les loyers)<br><br>💡 Bon placement après 30 ans si tu veux diversifier. Pour un étudiant : probablement pas la priorité."
        },
        {
            keys: ['crypto', 'cryptomonnaie', 'cryptomonnaies', 'bitcoin', 'btc', 'ethereum', 'eth', 'blockchain'],
            answer: "Les <strong>cryptos</strong>, c'est le Far West de la finance : exciting, risqué, plein d'arnaqueurs en Lamborghini louée.<br><br>🪙 <strong>Bitcoin</strong> : la grand-mère (2009), souvent vue comme \"or numérique\". Offre limitée à 21 millions.<br>💠 <strong>Ethereum</strong> : la plateforme des applications décentralisées et NFT.<br>🎰 <strong>Altcoins / memecoins</strong> : 95% finiront à zéro. Si Elon tweete, ça bouge. Ne JAMAIS investir en suivant Twitter.<br><br>⚠️ Volatilité : -70% en 6 mois, c'est déjà arrivé 4-5 fois. Ne mets QUE ce que tu peux perdre totalement (max 5-10% de ton patrimoine).<br>🚫 Règle d'or : JAMAIS d'effet de levier. Les traders liquidés en 2022, ils te le confirmeront depuis leur studio de 9m²."
        },
        {
            keys: ['per', 'plan epargne retraite'],
            answer: "Le <strong>PER</strong> (Plan Épargne Retraite) : tu défiscalises aujourd'hui, tu paies des impôts à la retraite. C'est surtout intéressant quand tu es dans une tranche marginale élevée (30%+).<br><br>💰 Tes versements sont déductibles du revenu imposable (dans la limite d'un plafond).<br>🔒 Argent bloqué jusqu'à la retraite (sauf : achat résidence principale, accident de la vie, fin de droits chômage).<br><br>🎓 Pour un étudiant non imposable : AUCUN intérêt. Priorité PEA + assurance-vie d'abord. Tu penseras au PER quand tu gagneras > 40 k€/an."
        },
        {
            keys: ['retraite', 'depart retraite', 'financer retraite'],
            answer: "La <strong>retraite</strong> à la française, c'est un système par répartition : les actifs d'aujourd'hui paient les retraités d'aujourd'hui. Spoiler : avec la démographie, ta retraite sera probablement plus faible que celle de tes grands-parents.<br><br>📊 Taux de remplacement (ratio pension/dernier salaire) : ~50-60% pour la plupart, souvent moins pour les cadres.<br><br>💡 Stratégie étudiante :<br>1️⃣ PEA dès maintenant → tes intérêts composés sur 40 ans feront un MIRACLE<br>2️⃣ Assurance-vie pour la souplesse<br>3️⃣ PER quand tu bosses et paies de l'impôt<br>4️⃣ Immobilier si ça t'intéresse<br><br>Commence tôt, même avec 30 €/mois. Le temps > le montant."
        },
        // ===== Concepts =====
        {
            keys: ['bourse', 'marche boursier', 'marche financier'],
            answer: "La <strong>bourse</strong>, contrairement à ce que dit ton oncle Gérard au repas de Noël, ce n'est PAS un casino. C'est un marché où s'échangent des titres (actions, obligations, ETF…) et où des millions d'acteurs fixent les prix en temps réel.<br><br>🏛️ Grandes places : NYSE et Nasdaq (USA), Euronext Paris (France), LSE (Londres), Tokyo, Shanghai.<br><br>💡 La vraie nature de la bourse : un outil pour financer l'économie. Quand tu achètes une action Total ou Apple, tu deviens co-propriétaire d'une entreprise qui produit, embauche, innove. Le cours monte quand les bénéfices progressent, sur le LONG terme. Court terme = bruit. Long terme = signal."
        },
        {
            keys: ['inflation'],
            answer: "L'<strong>inflation</strong>, c'est la raison pour laquelle ton kebab à 5 € en 2018 coûte 8 € en 2026. La monnaie perd du pouvoir d'achat dans le temps.<br><br>💸 Math cruelle : 10 000 € sous ton matelas, 3% d'inflation annuelle, 10 ans plus tard → pouvoir d'achat ≈ 7 441 €. T'as rien perdu en euros… mais en réalité, oui.<br><br>🛡️ D'où la mission : battre l'inflation. Livret A à 3% = tu restes neutre. Un ETF World à ~7% = tu gagnes réellement 4%. C'est la vraie différence entre \"épargner\" (préserver) et \"investir\" (faire fructifier).<br><br>📊 Causes d'inflation : hausse des coûts (énergie, salaires), demande > offre, création monétaire excessive."
        },
        {
            keys: ['taux interet', 'taux d interet', 'taux directeur', 'bce', 'fed'],
            answer: "Les <strong>taux d'intérêt</strong> sont le prix de l'argent. Les banques centrales (BCE ici, Fed aux USA, BoE à Londres) fixent les taux directeurs comme on règle le chauffage de l'économie.<br><br>📈 <strong>Taux hauts</strong> : crédits chers → freine la conso et l'immobilier → calme l'inflation. Tes économies rapportent, mais ton futur prêt immo te coûte un rein.<br>📉 <strong>Taux bas</strong> : crédit gratuit, économie dopée, inflation qui peut repartir. 2015-2021 : on a vécu dans ce monde-là.<br><br>🎯 Impact bourse : taux ↑ = actions croissance (tech) ↓ souvent. Taux ↓ = fête du slip. Les marchés surveillent chaque mot de Christine Lagarde comme s'il sortait d'Apple WWDC."
        },
        {
            keys: ['interet compose', 'interets composes', 'capitalisation'],
            answer: "Les <strong>intérêts composés</strong> = la 8e merveille du monde selon Einstein (légende urbaine mais belle quand même). Principe : tes intérêts génèrent eux-mêmes des intérêts. Effet boule de neige qui grossit.<br><br>💥 Exemple qui fait mal aux paresseux :<br>• 100 €/mois investis à 7%/an pendant 10 ans = 17 300 €<br>• Pendant 20 ans = 52 000 €<br>• Pendant 40 ans = <strong>262 481 €</strong><br>• Pendant 50 ans = 540 000 €<br><br>Tu as versé 60 000 €, tu en récupères 540 000. La différence, c'est la MAGIE.<br><br>⏰ Moral : à 20 ans, 50 € investis sont plus puissants que 500 € investis à 40 ans. Le temps > le montant."
        },
        {
            keys: ['diversification', 'diversifier'],
            answer: "La <strong>diversification</strong> = ne pas mettre tous tes œufs dans le même panier. Grand-mère avait raison.<br><br>🌍 <strong>Géographique</strong> : USA, Europe, Japon, émergents (Chine, Inde, Brésil)<br>🏭 <strong>Sectorielle</strong> : tech, santé, énergie, conso, finance, industrie<br>📊 <strong>Par classe d'actifs</strong> : actions / obligations / immobilier / cash / matières premières<br>⏳ <strong>Temporelle</strong> : étaler tes achats dans le temps (DCA)<br><br>✨ Solution paresseuse et efficace : un ETF MSCI World ou MSCI ACWI (All Country World Index) = 1500-3000 entreprises, 23-47 pays, 11 secteurs. Diversification en 1 clic. 💅<br><br>⚠️ Diversifier ≠ multiplier les risques. Avoir 10 cryptos différentes, ce n'est pas de la diversification, c'est du cosplay."
        },
        {
            keys: ['risque', 'volatilite', 'volatilité'],
            answer: "<strong>Risque et rendement</strong> : couple fusionnel, tu ne peux pas avoir l'un sans l'autre. Si quelqu'un te promet \"0 risque, 15%/an\", il prépare une arnaque (ou un Ponzi).<br><br>📉 Volatilité = amplitude des variations.<br>• Livret A : 0% volatilité, 3% rendement<br>• Obligations d'État : faible volatilité, ~3-4%<br>• Actions : volatilité 15-20%/an, ~7-8% sur le long terme<br>• Crypto : volatilité 60-80%, rendement… euh, réponds dans 20 ans<br><br>🧭 Règle d'or : n'investis jamais plus que ce que tu peux laisser 5-10 ans sans y toucher. Si le marché fait -40% et que tu as besoin de l'argent dans 6 mois, tu vends au pire moment. Boom, perte cristallisée."
        },
        {
            keys: ['dividende', 'dividendes'],
            answer: "Un <strong>dividende</strong> = la part des bénéfices qu'une boîte reverse à ses actionnaires. Loyer passif, version bourse.<br><br>💶 Versé 1 à 4 fois par an selon les entreprises. TotalEnergies, LVMH, Air Liquide = grandes payeuses françaises.<br>📊 Rendement = dividende annuel / cours. Exemple : action 100 €, dividende 4 € → 4% de rendement.<br><br>⚠️ Piège du gros dividende : une entreprise qui verse 10% de div est SOUVENT en galère (cours qui a chuté, boîte qui décline, réinvestissement nul). La qualité > le rendement brut. \"Value trap\" c'est son nom.<br><br>🧠 Pro tip : un ETF \"capitalisant\" réinvestit automatiquement les dividendes. Sur PEA, tu évites la friction fiscale. Tes intérêts composés te remercient."
        },
        {
            keys: ['dca', 'dollar cost averaging', 'investissement programme'],
            answer: "Le <strong>DCA</strong> (Dollar Cost Averaging) = investir un montant fixe chaque mois, peu importe le niveau du marché. Ton nouveau meilleur ami.<br><br>💡 Pourquoi ça marche ?<br>• Tu achètes plus de parts quand le marché est bas, moins quand il est haut → prix moyen lissé<br>• Tu te sors de la torture du \"market timing\" (99% des gens se plantent)<br>• Tu transformes l'investissement en habitude automatique, comme Netflix<br><br>🎯 Setup parfait étudiant : 50-100 €/mois en virement auto vers ton PEA sur un ETF World. Tu oublies. Dans 20 ans, tu ouvres et tu pleures (de joie).<br><br>📊 Quand ça perd : dans un marché perpétuellement haussier, un gros lump sum (tout d'un coup) bat le DCA ~2/3 du temps. Mais psychologiquement, le DCA tu le tiens. Le lump sum à -30%, tu paniques. Mieux vaut une bonne stratégie tenue qu'une stratégie optimale abandonnée."
        },
        {
            keys: ['bear market', 'bull market', 'marche haussier', 'marche baissier', 'krach', 'crash', 'correction'],
            answer: "Bestiaire boursier pour impressionner en soirée :<br><br>🐂 <strong>Bull market</strong> : marché haussier (durable). Tout le monde est génie, ta collègue se vante d'avoir acheté Nvidia à 30 $.<br>🐻 <strong>Bear market</strong> : baisse > 20% depuis un pic. Les mêmes disparaissent de LinkedIn.<br>📉 <strong>Correction</strong> : baisse de 10-20%. Healthy, ça remet les pendules à l'heure.<br>💥 <strong>Krach</strong> : effondrement brutal. Hall of Fame : 1929 (-89% au pire), 2000 (bulle internet), 2008 (subprimes), mars 2020 (COVID).<br><br>📚 Fait historique : depuis 1950, le S&P 500 a connu ~15 bear markets. Il est toujours remonté. Durée moyenne de récupération : 1 à 3 ans (parfois 7 pour les pires). Si tu tiens, tu gagnes. Si tu paniques, tu perds."
        },
        {
            keys: ['analyse fondamentale', 'fondamentale', 'per ratio', 'per action', 'price earning'],
            answer: "L'<strong>analyse fondamentale</strong> : décortiquer une boîte comme un ingénieur démonte un moteur. Tu cherches la valeur intrinsèque VS le prix du marché.<br><br>📊 Ratios clés à connaître :<br>• <strong>PER</strong> (Price/Earnings) = cours / bénéfice par action. PER 15 = tu paies 15 ans de bénéfices. <10 = potentiellement bradé ou en galère.<br>• <strong>PBR</strong> = cours / valeur comptable<br>• <strong>ROE</strong> = bénéfice / capitaux propres (efficacité du capital)<br>• <strong>EV/EBITDA</strong> = valeur d'entreprise / profit opérationnel (le préféré des pros)<br>• <strong>Dette/EBITDA</strong> : > 4-5x, ça devient chaud<br>• <strong>FCF</strong> (Free Cash Flow) : le vrai cash généré, le plus dur à maquiller<br><br>🎯 Philosophie value (Warren Buffett) : acheter une action qui se paie moins que sa valeur réelle. Patience et thé glacé."
        },
        {
            keys: ['analyse technique', 'chartiste', 'bougies', 'chandeliers', 'resistance', 'support'],
            answer: "L'<strong>analyse technique</strong> = lire dans les graphiques les mouvements futurs. Supports, résistances, triangles, têtes-épaules, bougies japonaises, RSI, MACD, Bollinger…<br><br>🧙 La vérité qui fâche : c'est très débattu. Pour les partisans, c'est de la science du comportement. Pour les sceptiques, c'est de l'astrologie avec des chiffres. Les études académiques sont plutôt sévères : peu de preuves que ça bat un simple buy & hold.<br><br>📊 Indicateurs populaires :<br>• <strong>RSI</strong> : > 70 survendu, < 30 suracheté (en théorie)<br>• <strong>MACD</strong> : croisements de moyennes mobiles<br>• <strong>Bollinger</strong> : bandes de volatilité<br><br>💡 Usage honnête : identifier des zones de prix intéressantes pour placer un ordre limite, pas prédire l'avenir. Et surtout : n'y consacre pas tes nuits. Un ETF World fera mieux que 95% des chartistes."
        },
        {
            keys: ['capitalisation', 'capi', 'market cap', 'large cap', 'small cap', 'mid cap'],
            answer: "La <strong>capitalisation boursière</strong> = cours × nombre d'actions. La taille de la boîte en bourse.<br><br>🐘 <strong>Mega caps</strong> : > 200 Md$ (Apple, Microsoft, Nvidia, Alphabet, Amazon… les GAFAM)<br>🐃 <strong>Large caps</strong> : 10-200 Md€ (LVMH, TotalEnergies, Airbus)<br>🐎 <strong>Mid caps</strong> : 2-10 Md€<br>🐁 <strong>Small caps</strong> : 300 M€ - 2 Md€<br>🦠 <strong>Micro caps / penny stocks</strong> : < 300 M€, très risqué<br><br>📊 Apple > 3 500 Md$ en 2026, soit plus que le PIB de la France. Pour relativiser : tu achètes 1 action Apple, tu possèdes une quantité de Tim Cook que la loi ne permet pas de quantifier."
        },
        {
            keys: ['ipo', 'introduction bourse', 'levee fonds', 'introduction en bourse'],
            answer: "Une <strong>IPO</strong> (Initial Public Offering), c'est le jour où une entreprise devient \"publique\" : ses actions sont proposées en bourse pour la première fois. Un mariage, mais avec Goldman Sachs à la place du témoin.<br><br>📈 Exemples : Stellantis, Arm, Reddit, Porsche, Saudi Aramco (la plus grosse de l'histoire, 2 000 Md$).<br>⚠️ Investir en IPO = très spéculatif :<br>• Le prix est fixé par les banques, pas le marché<br>• La volatilité des 6 premiers mois peut être sauvage<br>• Les initiés vendent souvent au lock-up (6-12 mois après)<br><br>💡 Les pros attendent souvent 1 an après l'IPO pour voir les vrais résultats trimestriels. Tu ne rates rien en étant patient."
        },
        {
            keys: ['fiscalite', 'flat tax', 'pfu', 'impot plus value', 'prelevement forfaitaire'],
            answer: "Tableau récap' <strong>fiscalité</strong> placements en France (2026) :<br><br>💼 <strong>CTO, crypto</strong> : flat tax (PFU) <strong>30%</strong> = 17,2% PS + 12,8% IR<br>🎯 <strong>PEA > 5 ans</strong> : 17,2% PS uniquement (0% IR)<br>📆 <strong>Assurance-vie > 8 ans</strong> : abattement 4 600 €/an sur gains (9 200 € couple) + 17,2% PS<br>💰 <strong>Livret A, LDDS, LEP, Livret Jeune</strong> : totalement exonérés 🎉<br>🏠 <strong>Immobilier locatif</strong> : IR + PS + CSG, jusqu'à 62,2% dans le pire des cas 🤡<br>💎 <strong>PER</strong> : déduction entrée, imposition sortie<br><br>⚙️ Option : imposition au barème IR si plus avantageuse pour toi (étudiant non-imposable → gros intérêt sur plus-values PEA/CTO en cochant cette case)."
        },
        {
            keys: ['epargne precaution', 'epargne de precaution', 'urgence', 'fonds urgence', 'matelas securite'],
            answer: "L'<strong>épargne de précaution</strong> = ton coussin de sécurité. Entre 3 et 6 mois de dépenses courantes, dispo en 24h.<br><br>🏦 Où la placer : Livret A + LDDS (+ LEP si éligible). Taux 3% net, zéro risque, zéro impôt.<br><br>🎯 Calcul étudiant type :<br>• Loyer 500 € + courses 300 € + transports 70 € + sorties 130 € = 1 000 €/mois<br>• Coussin recommandé : 3 000 à 6 000 €<br><br>❌ Tant que ce coussin n'est pas constitué → N'INVESTIS PAS EN BOURSE. Pourquoi ? Si ta voiture lâche et que le marché est à -30%, tu serais forcé de vendre tes placements au pire moment. Le coussin, c'est ce qui te permet de TENIR."
        },
        {
            keys: ['immobilier', 'investissement locatif', 'locatif', 'achat immobilier', 'acheter appart'],
            answer: "L'<strong>immobilier locatif</strong>, le grand mythe français. La vérité nuancée :<br><br>✅ <strong>Atouts</strong> :<br>• Effet de levier du crédit (tu achètes 200 k€ avec 20 k€)<br>• Actif tangible que tu comprends<br>• Revenus potentiellement réguliers<br>• Parfois plus-value à la revente<br><br>⚠️ <strong>Galères</strong> :<br>• Vacance locative (2-3 mois sans loyer = rentabilité flinguée)<br>• Impayés, dégradations, syndic incompétent<br>• Travaux : chaudière HS à 4 000 €, fuite à 15 000 €<br>• Fiscalité brutale : loyers imposés à ta TMI + 17,2% PS (sauf LMNP et ses amortissements)<br>• Zéro liquidité : 3 mois pour vendre, 7% de frais<br><br>💡 Pour un étudiant, la priorité est probablement ton ACHAT de résidence principale quand tu auras un CDI. Le locatif, c'est après."
        },
        {
            keys: ['lmnp', 'loueur meuble', 'loueur non professionnel'],
            answer: "Le <strong>LMNP</strong> (Loueur Meublé Non Professionnel), c'est le cheat code fiscal de l'immobilier locatif. Tu loues un bien meublé → tu amortis le bâti, les meubles, les travaux → tes loyers sont <strong>souvent défiscalisés pendant 15-20 ans</strong>. Magie comptable.<br><br>📋 Conditions : loyers meublés < 23 000 €/an OU < 50% des revenus globaux.<br>📊 Régime : micro-BIC (abattement 50%) ou réel (amortissements). Le réel gagne quasi toujours.<br><br>⚠️ Depuis 2024-2025, le régime est attaqué politiquement. La défiscalisation pourrait être rabotée. À suivre."
        },
        {
            keys: ['sci', 'societe civile immobiliere'],
            answer: "Une <strong>SCI</strong> (Société Civile Immobilière) = structure juridique pour posséder de l'immobilier à plusieurs.<br><br>✅ Utile pour : transmission progressive aux enfants, gestion familiale, optimisation fiscale (SCI à l'IS sous conditions)<br>⚠️ Coûte : frais de création (~1 500 €), comptabilité annuelle, formalisme<br><br>💡 Pour un jeune célibataire qui achète son premier bien : inutile. Pour une famille ou des associés : souvent pertinent."
        },
        {
            keys: ['forex', 'devises', 'change', 'paire devise'],
            answer: "Le <strong>forex</strong> (foreign exchange) = marché des devises (EUR/USD, GBP/JPY, USD/CHF…). 7 500 milliards $ échangés PAR JOUR. Plus gros marché au monde.<br><br>⚠️ Pour un particulier avec un compte de 1 000 € et un effet de levier ×30 : <strong>95% perdent de l'argent</strong> (stats AMF). Ce n'est pas \"certains\", c'est la MAJORITÉ ÉCRASANTE.<br><br>🎯 Le forex est utile pour :<br>• Les grandes entreprises qui hedgent leurs flux internationaux<br>• Les pros spécialisés<br><br>Pour toi, étudiant ? Zéro intérêt. Si tu veux du USD, achète un ETF S&P 500 : exposition dollars + entreprises solides. Bien plus malin."
        },
        {
            keys: ['private equity', 'capital investissement', 'non cote', 'pe'],
            answer: "Le <strong>private equity</strong> = investir dans des entreprises NON cotées. Rendements historiques juteux (10-15%/an) pour les meilleurs fonds.<br><br>💼 4 grandes familles :<br>• <strong>Venture capital</strong> : startups early-stage<br>• <strong>Growth equity</strong> : scale-up rentables<br>• <strong>Buy-out / LBO</strong> : rachat de boîtes matures avec dette (KKR, Blackstone, Apollo)<br>• <strong>Turnaround</strong> : boîtes en difficulté<br><br>🔒 Argent bloqué 5-10 ans, tickets d'entrée souvent ≥ 100 k€.<br><br>🎯 Pour les particuliers : FCPR/FCPI/FIP (avantage fiscal mais frais élevés), ou fonds \"evergreen\" type Altaroc, Opale Capital (plus récents, 10-30 k€ d'entrée)."
        },
        {
            keys: ['hedge fund', 'fonds alternatif'],
            answer: "Les <strong>hedge funds</strong> = fonds avec stratégies exotiques (long/short, global macro, event-driven, arbitrage). Les rockstars de la finance.<br><br>💼 Structure tarifaire standard : \"<strong>2 and 20</strong>\" = 2% de frais fixes + 20% sur la performance. Tu paies cher, très cher.<br><br>⚠️ La vérité qui dérange : en moyenne, les hedge funds ont sous-performé le S&P 500 sur les 15 dernières années, après frais. Warren Buffett a parié (et gagné) 1 million $ contre les hedge funds sur 10 ans (2008-2018).<br><br>🎯 Moralité : un ETF S&P 500 à 0,1% de frais bat la majorité des hedge funds à 2+20%. Le paradoxe du capitalisme passif."
        },
        {
            keys: ['recession', 'depression', 'crise economique', 'pib'],
            answer: "Une <strong>récession</strong> = contraction du PIB sur ≥ 2 trimestres consécutifs. Chômage qui monte, conso qui baisse, entreprises qui galèrent.<br><br>📊 Grands classiques : 2008 (subprimes), 2020 (COVID), 1973 (choc pétrolier), 1929 (Grande Dépression).<br><br>📉 Les marchés anticipent TOUJOURS la récession en amont — quand les journaux titrent \"récession\", le bas est souvent déjà passé.<br><br>💎 Pour l'investisseur LT : les meilleures années boursières suivent souvent les récessions. Acheter pendant la panique a historiquement été un coup gagnant… à condition de tenir psychologiquement. Facile à dire, dur à faire quand tu vois -35% sur ton compte."
        },
        {
            keys: ['stablecoin', 'usdc', 'usdt', 'tether'],
            answer: "Les <strong>stablecoins</strong> = cryptos adossées à une monnaie stable (USD, EUR). L'idée : profiter de la blockchain sans la volatilité.<br><br>🪙 Principaux : USDC (le plus transparent), USDT/Tether (le plus utilisé mais controversé), DAI (décentralisé).<br>✅ Usage principal : entrer/sortir des cryptos sans passer par fiat, transferts rapides.<br><br>⚠️ Risques :<br>• <strong>De-peg</strong> : Terra/UST en mai 2022 = -100% en 3 jours, 40 Md$ partis en fumée<br>• <strong>Risque émetteur</strong> : si Tether ment sur ses réserves, USDT pourrait s'effondrer<br>• Les stablecoins algorithmiques sont bien plus risqués que ceux adossés au cash"
        },
        {
            keys: ['nft'],
            answer: "Les <strong>NFT</strong> (Non-Fungible Tokens) = jetons uniques sur blockchain. \"T'as dépensé 200 000 € pour un JPG de singe ?\" — Oui Brenda, c'était 2021.<br><br>📈 Pic 2021 : Bored Apes à 300 000 €, CryptoPunks à plusieurs millions.<br>📉 Crash 2022-2025 : la plupart ont perdu 80-99% de leur valeur. Collections mortes en masse.<br><br>🎯 Usages légitimes émergents : billetterie, certificats d'authenticité, identité numérique, actifs dans les jeux. La techno n'est pas morte, juste la bulle spéculative.<br><br>💡 En tant qu'investissement financier : considère-les comme du collectionnisme, pas du patrimoine. Acheter un NFT parce que tu aimes l'art = OK. Pour \"faire un x10\" = préparer un massage pour tes futures larmes."
        },
        {
            keys: ['warren buffett', 'buffett'],
            answer: "<strong>Warren Buffett</strong>, 95 ans, l'Oracle d'Omaha, le GOAT de l'investissement. Sa boîte Berkshire Hathaway a fait ~20%/an pendant 60 ans (le S&P 500 fait ~10%, pour comparaison).<br><br>💡 Sa philosophie résumée :<br>• Achète des entreprises de QUALITÉ à un prix RAISONNABLE<br>• \"Notre durée de détention préférée, c'est pour toujours\"<br>• \"Ne perds jamais d'argent. Règle n°2 : n'oublie jamais la règle n°1\"<br>• N'investis jamais dans ce que tu ne comprends pas<br>• Sois avide quand les autres ont peur, peureux quand ils sont avides<br><br>📚 À lire absolument : les lettres annuelles aux actionnaires de Berkshire (gratuites sur leur site). Pédagogie + humour + humilité. Bonbon pour cerveau."
        },
        {
            keys: ['trader', 'trading', 'day trading', 'scalping', 'swing trading'],
            answer: "Le <strong>trading actif</strong> : acheter-vendre fréquemment pour capter des mouvements. Glamour vu sur Instagram, beaucoup moins dans la vraie vie.<br><br>📊 Stats qui font mal (études AMF France, SEC USA, ESMA) :<br>• <strong>70 à 95% des day traders particuliers perdent</strong> sur le long terme<br>• Parmi ceux qui gagnent une année, la plupart perdent l'année suivante<br>• Un simple achat d'ETF World bat 99% des traders amateurs<br><br>🧠 Pourquoi ? Les frais (spread, courtage), la fiscalité, le biais émotionnel, le manque d'info vs les pros, les algos HFT qui arbitrent en microsecondes…<br><br>💡 Pour 99% des gens : buy & hold ETF + DCA = bien plus rentable, bien moins stressant. Tu dors mieux. Ta copine / ton copain aussi."
        },
        // ===== Indices & marchés =====
        {
            keys: ['cac 40', 'cac40', 'cac'],
            answer: "Le <strong>CAC 40</strong> = les 40 plus grosses capitalisations d'Euronext Paris. LVMH, TotalEnergies, L'Oréal, Sanofi, Airbus, Schneider… le gratin.<br><br>📊 Indice pondéré par la capitalisation flottante. Plafond de 15% par société pour éviter qu'un mastodonte écrase tout.<br>⚠️ Le CAC 40 est très \"luxe + banque + énergie\". Zéro tech mondiale dominante. Sur 20 ans, il sous-performe le S&P 500.<br><br>💡 CAC 40 GR (Gross Return) inclut les dividendes réinvestis → la vraie perf. Le CAC 40 \"nu\" que tu vois à la télé = version tronquée."
        },
        {
            keys: ['sp500', 's and p 500', 's p 500', 'sp 500'],
            answer: "Le <strong>S&P 500</strong> = les 500 plus grosses entreprises US cotées. La référence mondiale, ce que tout le monde regarde.<br><br>📈 Performance historique : ~10%/an nominal, ~7% réel (après inflation) sur un siècle.<br>🦅 Poids lourds : Apple, Microsoft, Nvidia, Alphabet, Amazon, Meta… top 10 ≈ 30% de l'indice.<br><br>💡 Un ETF S&P 500 (CW8, ESE, PE500…) est éligible PEA via réplication synthétique. 0,1-0,2% de frais. L'investissement le plus paresseux et performant de l'histoire."
        },
        {
            keys: ['nasdaq', 'nasdaq 100', 'ndx'],
            answer: "Le <strong>Nasdaq 100</strong> = les 100 plus grosses entreprises NON financières cotées au Nasdaq. Ultra-tech : Apple, Microsoft, Nvidia, Amazon, Meta, Alphabet, Tesla…<br><br>🚀 Perf spectaculaire sur 15 ans (+15-18%/an) mais volatilité élevée (-33% en 2022).<br>⚠️ Très concentré. Si la tech coule, tu coules avec.<br><br>💡 ETF Nasdaq éligible PEA : PANX, PUST. Complément sympa d'un World mais ne mets pas 100% dedans."
        },
        {
            keys: ['msci world', 'ms world', 'etf world', 'all world'],
            answer: "Le <strong>MSCI World</strong> = ~1 500 entreprises de 23 pays développés. USA (70%), Japon, Europe, Canada, Australie.<br><br>⚠️ \"World\" est un peu menteur : zéro émergent. Pour TRUE diversification mondiale → <strong>MSCI ACWI</strong> (All Country World Index, inclut Chine/Inde/Brésil/etc.) ou combo World + EM.<br><br>🎯 ETF éligibles PEA : CW8 (Amundi), EWLD (Lyxor). Ce que 90% des étudiants devraient avoir dans leur PEA."
        },
        {
            keys: ['dow jones', 'djia'],
            answer: "Le <strong>Dow Jones Industrial Average</strong> (DJIA) = 30 grandes entreprises US historiques. Créé en 1896, le plus vieil indice encore en vie.<br><br>⚠️ Pondéré par le PRIX (bizarre), pas la capitalisation. Un titre à 500 $ pèse plus qu'un à 100 $, même si la boîte est plus petite. C'est un anachronisme.<br><br>💡 Regardé par les journalistes pour ses \"records\", mais le S&P 500 est beaucoup plus représentatif. Le Dow, c'est le \"Vieux Sage\" qu'on écoute par respect, pas par utilité."
        },
        {
            keys: ['emergents', 'marches emergents', 'emerging markets', 'em'],
            answer: "Les <strong>marchés émergents</strong> = Chine, Inde, Brésil, Corée du Sud, Taïwan, Mexique, Afrique du Sud, Indonésie… Économies en croissance rapide.<br><br>📈 Potentiel de croissance > pays développés<br>⚠️ Risques : politique, change, gouvernance, transparence<br><br>💡 Exposition classique : 5-15% de ton portefeuille via un ETF MSCI Emerging Markets (PAEEM, AEEM). Ne surpondère pas, la volatilité est féroce."
        },
        // ===== Indicateurs techniques =====
        {
            keys: ['rsi', 'relative strength'],
            answer: "Le <strong>RSI</strong> (Relative Strength Index) : indicateur entre 0 et 100 qui mesure la vitesse des mouvements de prix.<br><br>📊 Règle classique :<br>• RSI > 70 = théoriquement \"suracheté\" (baisse potentielle)<br>• RSI < 30 = théoriquement \"survendu\" (rebond potentiel)<br><br>⚠️ En marché haussier fort, le RSI peut rester > 70 pendant des mois. En marché baissier, < 30 pendant des mois. \"Théoriquement\" fait beaucoup de travail dans cette phrase."
        },
        {
            keys: ['macd', 'moving average convergence'],
            answer: "Le <strong>MACD</strong> = différence entre deux moyennes mobiles exponentielles (12 et 26 jours classiquement). Signal quand la ligne MACD croise sa moyenne mobile 9 jours.<br><br>📊 Croisement vers le haut = signal d'achat. Croisement vers le bas = signal de vente.<br><br>⚠️ Indicateur en retard par construction (lagging). Utile pour identifier les tendances, nul pour prédire les retournements exacts. Comme d'hab en AT."
        },
        {
            keys: ['moyenne mobile', 'sma', 'ema', 'mm200', 'mm50'],
            answer: "Les <strong>moyennes mobiles</strong> lissent les prix pour repérer la tendance.<br><br>📊 Classiques :<br>• <strong>MM50</strong> : tendance moyen terme<br>• <strong>MM200</strong> : tendance long terme. Cours > MM200 = marché haussier structurel<br>• <strong>Croix dorée</strong> : MM50 passe au-dessus de MM200 = signal haussier<br>• <strong>Croix de la mort</strong> : MM50 passe sous MM200 = signal baissier<br><br>💡 Utilité pour un particulier : rester dans le marché quand cours > MM200, prudence sinon. Mais sur le très long terme, buy & hold bat le market timing dans 80% des cas."
        },
        {
            keys: ['vix', 'indice peur', 'volatility index'],
            answer: "Le <strong>VIX</strong>, surnom \"indice de la peur\" : mesure la volatilité implicite attendue sur le S&P 500 à 30 jours.<br><br>📊 Lecture :<br>• VIX < 15 : calme plat, complacence<br>• VIX 15-25 : normal<br>• VIX > 30 : panique modérée<br>• VIX > 50 : apocalypse (atteint 82 en mars 2020, 89 en 2008)<br><br>💡 Historiquement, acheter le S&P 500 quand VIX > 40 a été un EXCELLENT trade sur 1-2 ans. Facile à dire, très dur à faire (tout le monde panique en même temps que toi)."
        },
        // ===== Courtiers / apps =====
        {
            keys: ['courtier', 'broker', 'quel courtier', 'meilleur courtier'],
            answer: "Les <strong>courtiers</strong> recommandés pour un étudiant (PEA compatible, frais bas) :<br><br>🥇 <strong>Bourse Direct</strong> : historique fiable, 0,99-4 €/ordre<br>🥈 <strong>Fortuneo</strong> : 0-1,95 €/ordre sur petits montants, appli propre<br>🥉 <strong>Boursorama</strong> : courtage + banque, promos fréquentes<br>💎 <strong>Saxo Banque</strong> : interface pro, plus cher<br><br>Pour un CTO uniquement (pas de PEA) :<br>• <strong>Trade Republic</strong> : ordres 1 €, fractionné, PEA depuis 2024<br>• <strong>DEGIRO</strong> : très low cost, mondial<br>• <strong>Interactive Brokers</strong> : la Rolls des pros<br><br>⚠️ Évite les plateformes \"gratuites\" style Robinhood : elles se paient sur le spread, tu paies sans le voir."
        },
        {
            keys: ['trade republic', 'robinhood', 'revolut invest', 'boursobank', 'fortuneo'],
            answer: "Les <strong>néo-courtiers</strong> bousculent le marché :<br><br>🇩🇪 <strong>Trade Republic</strong> : 1 €/ordre, fractionné (acheter 10 € d'Amazon), PEA depuis 2024. Excellent pour débuter.<br>💳 <strong>Revolut Invest</strong> : pratique mais compte-titre uniquement, pas de PEA.<br>🪙 <strong>Boursorama, Fortuneo</strong> : banques en ligne avec courtage solide.<br><br>💡 Pour un étudiant : Trade Republic (PEA) + Boursorama (compte courant) = combo imbattable. Tes parents ne comprennent pas ? Normal, ils ont leur conseiller BNP depuis 1987."
        },
        // ===== Types d'actions & styles =====
        {
            keys: ['growth', 'action croissance', 'value', 'action value', 'croissance vs value'],
            answer: "Deux grandes philosophies boursières, comme Nutella vs Confiture :<br><br>🚀 <strong>Growth</strong> (croissance) : entreprises qui grossissent vite (tech, biotech). PER élevés, peu/pas de dividendes, espoir de x10. Nvidia, Tesla, Shopify.<br>💎 <strong>Value</strong> (décotée) : entreprises matures, rentables, mal-aimées. PER bas, dividendes solides. Banques, énergie, utilities.<br><br>📊 Cycles : 2010-2021 = décennie de la growth. 2022-2024 = retour du value. Sur le TRÈS long terme, value a légèrement battu growth (étude Fama-French).<br><br>💡 Solution paresseuse : un ETF World te donne les DEUX, pondéré par leur taille. Pas besoin de choisir."
        },
        {
            keys: ['defensif', 'cyclique', 'secteur defensif', 'secteur cyclique'],
            answer: "Classification des secteurs selon leur sensibilité au cycle éco :<br><br>🛡️ <strong>Défensifs</strong> (besoins essentiels, peu sensibles à la crise) :<br>• Santé, alimentation, utilities, télécoms, tabac<br>• Ex : Nestlé, Danone, Sanofi, J&J, Enel<br><br>⚡ <strong>Cycliques</strong> (boom en expansion, chute en récession) :<br>• Automobile, luxe, banques, industrie, construction, tourisme<br>• Ex : Stellantis, LVMH, Renault, BNP<br><br>💡 En haut de cycle → alléger cycliques. En bas de cycle → renforcer cycliques. Plus facile à dire qu'à faire (comme d'hab)."
        },
        // ===== Commodities =====
        {
            keys: ['or', 'gold', 'metaux precieux', 'investir dans or'],
            answer: "L'<strong>or</strong>, la vieille valeur refuge que Cléopâtre aurait validée.<br><br>✅ <strong>Atouts</strong> :<br>• Protection contre l'inflation (sur le très long terme)<br>• Valeur refuge en cas de crise (-40% sur actions = souvent +20% sur or)<br>• Décorrélé des actions<br><br>⚠️ <strong>Limites</strong> :<br>• Zéro rendement (pas de dividende, pas d'intérêt)<br>• Peut stagner des années (2011-2019 = 8 ans à -30%)<br>• Stockage/sécurité si or physique<br><br>🎯 Exposition typique : 5-10% du portefeuille max. Via ETF (comme GLD, SPPP), or papier, ou lingotins/pièces (Napoleon, Krugerrand)."
        },
        {
            keys: ['petrole', 'oil', 'brent', 'wti', 'matiere premiere'],
            answer: "Le <strong>pétrole</strong> et les <strong>matières premières</strong> : volatil, très dépendant géopolitique.<br><br>📊 Références : Brent (mer du Nord, Europe), WTI (Texas, USA)<br>⚡ Drivers : OPEP, stocks US, géopolitique (Russie, Iran, Venezuela), demande chinoise<br><br>💡 Pour s'exposer :<br>• ETF matières premières (pas idéal, contango = perte de valeur dans le temps)<br>• Actions pétrolières (TotalEnergies, Shell, ExxonMobil) → dividendes juteux<br>• ETF diversifié commodities<br><br>⚠️ Pas un investissement core. Complément éventuel de 5% max."
        },
        // ===== Dérivés & levier =====
        {
            keys: ['option', 'options', 'call', 'put', 'strike'],
            answer: "Les <strong>options</strong> = droit (pas obligation) d'acheter/vendre un actif à un prix fixé, avant une échéance. Produit dérivé.<br><br>📈 <strong>Call</strong> : droit d'ACHETER à prix fixé (\"strike\") → parie sur la HAUSSE<br>📉 <strong>Put</strong> : droit de VENDRE au strike → parie sur la BAISSE ou hedge<br>💰 Tu paies une \"prime\" pour cette option<br><br>🧠 Complexe, très utile pour hedger ou spéculer avec effet de levier, mais grand piège pour débutants. 80-90% des options expirent sans valeur.<br><br>⚠️ Une option non couverte (naked) peut générer des pertes ILLIMITÉES. Si tu ne comprends pas les Grecs (delta, gamma, theta, vega), n'y touche pas."
        },
        {
            keys: ['cfd', 'contract for difference', 'leverage produit'],
            answer: "Les <strong>CFD</strong> (Contract For Difference) : produit dérivé avec effet de levier (×5 à ×30 chez les brokers particuliers).<br><br>⚠️ Avertissement obligatoire que tu vois partout : <strong>\"74-89% des comptes particuliers perdent de l'argent\"</strong>. Ce n'est pas de la pub marketing, c'est la stats.<br><br>🎯 Les CFD ne vont quasi JAMAIS dans un patrimoine d'investisseur sérieux. Outil spéculatif court terme à haute toxicité.<br><br>💡 Si tu veux de l'exposition internationale, prends un ETF. Zéro levier, zéro drama, rendement bien réel."
        },
        {
            keys: ['effet levier', 'levier', 'leverage', 'marge', 'margin call'],
            answer: "L'<strong>effet de levier</strong> = emprunter pour investir plus gros que ton capital.<br><br>📊 Exemple ×10 : tu as 1 000 €, tu investis comme si t'en avais 10 000 €. Si ça monte de 10%, tu gagnes 1 000 € (+100%). Si ça baisse de 10%, tu perds TOUT.<br><br>💥 <strong>Margin call</strong> : quand tes pertes bouffent ton capital, le broker te demande plus de cash… ou te liquide automatiquement au pire moment. Carnage.<br><br>⚠️ Pour un étudiant : ZÉRO effet de levier. Strictement zéro. Les plus grandes fortunes en bourse n'ont pas été faites avec du levier, mais avec du TEMPS.<br><br>💡 Seul levier acceptable : le crédit immobilier pour ta résidence principale. Règle différente car sous-jacent stable et usage personnel."
        },
        {
            keys: ['short', 'vente decouvert', 'short selling', 'shorter'],
            answer: "La <strong>vente à découvert</strong> (short selling) : tu vends un titre que tu ne possèdes pas (emprunté à un broker), tu le rachètes plus tard moins cher, tu empoches la différence. Parier sur la baisse.<br><br>⚠️ Risque ASYMÉTRIQUE :<br>• À l'achat : tu peux perdre max 100% (l'action tombe à 0)<br>• En short : tu peux perdre ILLIMITÉ (l'action peut x10)<br><br>🎢 Épisode culte : GameStop en 2021. Les shorts massifs ont été \"squeezés\" par r/WallStreetBets → +1 700% en un mois, Melvin Capital liquidé.<br><br>💡 Pas pour toi, étudiant. Même pour un pro, le short est psychologiquement épuisant."
        },
        // ===== Frais & ordres =====
        {
            keys: ['ordre bourse', 'ordre marche', 'ordre limite', 'stop loss', 'stop', 'types ordres'],
            answer: "Les <strong>types d'ordres</strong> :<br><br>🎯 <strong>Au marché</strong> : tu achètes/vends tout de suite au meilleur prix dispo. Rapide, mais prix pas garanti (slippage sur titres peu liquides).<br>💎 <strong>À cours limité</strong> : tu fixes un prix max (achat) ou min (vente). Ton ordre se déclenche seulement à ce prix ou mieux.<br>🛑 <strong>Stop loss</strong> : se déclenche si le cours franchit un seuil à la baisse. Pour limiter les pertes.<br>🪤 <strong>Stop suiveur / trailing stop</strong> : stop loss qui suit le cours à la hausse, sécurise les gains.<br><br>💡 Pour du long terme, ordre à cours limité suffit 99% du temps. Les stops, c'est plus pour le trading."
        },
        {
            keys: ['frais courtage', 'frais gestion', 'tef', 'droit garde'],
            answer: "Les <strong>frais</strong>, plus silencieux et destructeurs que Thanos :<br><br>💳 <strong>Frais de courtage</strong> : 0,50-4 € par ordre chez un courtier low cost, 15-30 € chez une banque traditionnelle. 🤡<br>📦 <strong>Droits de garde</strong> : facturés par certaines banques. Chez les courtiers modernes : ZÉRO. Si ta banque facture ça, change.<br>🎯 <strong>Frais de gestion ETF</strong> : 0,10-0,30%/an (excellent)<br>🤑 <strong>Frais fonds actifs</strong> : 1,5-2,5%/an (scandaleux)<br>🔄 <strong>Frais enveloppe</strong> : assurance-vie en ligne 0,5-0,6%/an, banque traditionnelle 1%+<br><br>📊 Impact sur 30 ans avec 100 €/mois : 0,2% de frais vs 2% de frais = différence finale de 90 000 €. NEUF DIX MILLE EUROS. Les frais, c'est le cancer silencieux du patrimoine."
        },
        // ===== Biais & psychologie =====
        {
            keys: ['biais', 'psychologie', 'fomo', 'panique', 'biais comportementaux'],
            answer: "La finance comportementale : pourquoi ton cerveau te trahit en bourse.<br><br>🚀 <strong>FOMO</strong> (Fear Of Missing Out) : tu achètes au plus haut parce que tout le monde en parle<br>😱 <strong>Panique</strong> : tu vends au plus bas parce que la chute fait peur<br>🎯 <strong>Biais de confirmation</strong> : tu ne lis que ce qui valide ton choix<br>⚓ <strong>Ancrage</strong> : tu restes fixé sur ton prix d'achat (\"j'attends qu'elle remonte à 50 €\")<br>🏃 <strong>Aversion aux pertes</strong> : tu souffres 2× plus d'une perte que tu ne jouis d'un gain équivalent (Kahneman)<br>🐑 <strong>Mimétisme</strong> : \"tout le monde achète Nvidia donc c'est bon\"<br><br>💡 Solution : règles écrites, DCA automatique, ne JAMAIS décider sous émotion. Ton cerveau reptilien n'est pas fait pour la bourse."
        },
        // ===== ESG / finance durable =====
        {
            keys: ['esg', 'isr', 'finance durable', 'greenwashing', 'investissement responsable'],
            answer: "L'<strong>ESG</strong> (Environnement, Social, Gouvernance) / <strong>ISR</strong> (Investissement Socialement Responsable) : investir en tenant compte de critères extra-financiers.<br><br>🏷️ <strong>Labels</strong> : ISR (France), Greenfin, Finansol, SFDR article 8 et 9 (EU)<br><br>⚠️ <strong>Greenwashing omniprésent</strong> : beaucoup de fonds \"ESG\" contiennent Shell, Total, McDonald's. Les agences de notation ESG sont incohérentes entre elles.<br><br>💡 Pour un vrai impact : ETF best-in-class (MSCI SRI), ou fonds thématiques (transition énergétique, santé). Mais accepte une diversification plus faible et des frais souvent plus élevés.<br><br>🌱 Perf : historiquement proche des indices classiques, légèrement inférieure sur 2022-2024 à cause de l'absence d'énergie fossile."
        },
        // ===== Startup / stock options =====
        {
            keys: ['stock option', 'bspce', 'actions gratuites', 'attribution action'],
            answer: "Tu rejoins une startup qui te propose des <strong>stock options</strong> ou <strong>BSPCE</strong> ? Décrypte :<br><br>🎯 <strong>BSPCE</strong> (Bons de Souscription de Parts de Créateur d'Entreprise) : droit d'acheter des actions à un prix fixé, fiscalité avantageuse pour salariés de jeunes startups françaises.<br>🎁 <strong>Actions gratuites / AGA</strong> : tu reçois des actions après une période de présence (vesting)<br>⏳ <strong>Vesting</strong> : tes droits s'acquièrent progressivement (classique : 4 ans avec 1 an de cliff)<br><br>💡 Vraie valeur = probabilité d'exit × valorisation × ta part après dilution. 90% des startups valent 0 à la fin. Considère les BSPCE comme un bonus en loterie, pas comme un salaire."
        },
        {
            keys: ['licorne', 'unicorn', 'valorisation startup', 'serie a', 'serie b', 'venture capital', 'vc'],
            answer: "Jargon du <strong>venture capital</strong> :<br><br>🦄 <strong>Licorne</strong> : startup non cotée valorisée > 1 Md$ (inventé par Aileen Lee en 2013, aujourd'hui y en a ~1 200)<br>🎯 <strong>Valorisation pre-money vs post-money</strong> : avant/après la levée<br>📅 <strong>Seed</strong> : 100 k€ - 2 M€, idée/POC<br>🌱 <strong>Série A</strong> : 2-15 M€, product-market fit<br>🌳 <strong>Série B</strong> : 15-50 M€, scale<br>🚀 <strong>Série C+</strong> : expansion internationale, préparation IPO<br><br>⚠️ Une levée = PAS un succès. C'est un prêt-espoir. Une entreprise rentable à 5 M€ ARR > une startup \"licorne\" qui brûle 2 M€/mois."
        },
        // ===== Arnaques =====
        {
            keys: ['arnaque', 'scam', 'ponzi', 'madoff', 'ftx', 'signaux telegram', 'trading signals'],
            answer: "Les <strong>arnaques financières</strong> classiques, red flags à connaître :<br><br>🚩 \"Rendement garanti de X%/mois/semaine\" → Ponzi, fuis.<br>🚩 Signaux Telegram de trading payants → gourou qui se paie sur tes pertes.<br>🚩 Plateforme de trading que ton \"match Tinder\" t'a recommandée → arnaque au \"pig butchering\", montée industriellement depuis l'Asie du SE.<br>🚩 Crypto qui \"va faire x1000\" dans un groupe WhatsApp → pump & dump.<br>🚩 MLM / marketing de réseau financier → tu deviens la proie ET le chasseur.<br><br>📋 Vérifie TOUJOURS qu'un courtier est enregistré auprès de l'AMF ou ACPR. Liste noire AMF : regorge d'exemples. Gros noms Ponzi : Madoff (65 Md$), Cantillon, FTX, Terra-Luna.<br><br>💡 Si ça semble trop beau, c'est TOUJOURS une arnaque."
        },
        {
            keys: ['amf', 'autorite marches', 'reglementation', 'regulateur'],
            answer: "L'<strong>AMF</strong> (Autorité des Marchés Financiers) = le gendarme français de la bourse.<br><br>🛡️ Rôle : protéger les épargnants, s'assurer du bon fonctionnement des marchés, sanctionner les abus.<br>📋 Elle maintient une <strong>liste noire</strong> de sites/plateformes non autorisés. À consulter avant d'investir sur une plateforme inconnue !<br><br>🇪🇺 Au niveau européen : <strong>ESMA</strong>. Aux USA : <strong>SEC</strong>. Ces autorités ont imposé par exemple les avertissements \"74-89% des comptes perdent\" sur les CFD."
        },
        // ===== Macroéco =====
        {
            keys: ['pib', 'produit interieur brut', 'croissance pib'],
            answer: "Le <strong>PIB</strong> (Produit Intérieur Brut) = valeur de tous les biens et services produits dans un pays sur une période.<br><br>📊 France 2025 : ~2 800 Md€. USA : ~27 000 Md$. Chine : ~18 000 Md$.<br>📈 Croissance annuelle : 1-2% pour les pays développés, 5-7% pour les émergents.<br><br>⚠️ Mesure imparfaite : ignore l'économie informelle, le travail bénévole, la dégradation environnementale. Le PIB peut monter alors que le bien-être stagne. Mais pour l'investisseur, c'est un thermomètre utile."
        },
        {
            keys: ['dette publique', 'dette etat', 'ratio dette'],
            answer: "La <strong>dette publique</strong> française : ~113% du PIB en 2025 (~3 200 Md€). Pas le champion olympique (Japon > 250%), mais pas top.<br><br>📊 Le vrai sujet n'est pas le ratio, mais :<br>• Qui détient la dette ? (résidents = soutenable, étrangers = risque de confiance)<br>• Le coût : plus les taux montent, plus le service de la dette gonfle<br>• La croissance : si PIB croît plus vite que la dette, ça se dilue<br><br>💡 Une dette ÉLEVÉE peut tenir longtemps si la monnaie est forte, l'économie productive et les taux bas. Mais c'est une fragilité potentielle en cas de choc."
        },
        {
            keys: ['chomage', 'unemployment', 'taux chomage'],
            answer: "Le <strong>taux de chômage</strong> : pourcentage d'actifs sans emploi cherchant un travail.<br><br>📊 France 2025 : ~7,3%. USA : ~4%. Japon : ~2,5%.<br>🎯 NAIRU (Non-Accelerating Inflation Rate of Unemployment) : taux \"neutre\" qui ne pousse ni l'inflation ni la déflation.<br><br>💡 Pour les marchés : chômage qui baisse + inflation qui monte = la Fed/BCE va remonter les taux → actions souvent sous pression. Paradoxe : une bonne nouvelle économique peut être une mauvaise nouvelle boursière à court terme."
        },
        // ===== Patrimoine / succession =====
        {
            keys: ['succession', 'heritage', 'droits succession', 'donation'],
            answer: "La <strong>succession</strong> en France, sport national des notaires :<br><br>💰 Abattements : 100 000 € par enfant (et par parent), renouvelable tous les 15 ans. Au-delà : barème progressif 5 à 45%.<br>🎁 <strong>Donation</strong> : même abattements, on peut donner de son vivant pour \"purger\" les droits.<br>🏦 <strong>Assurance-vie</strong> : hors succession civile. 152 500 €/bénéficiaire exonérés (versements avant 70 ans).<br><br>💡 Pour tes parents qui s'inquiètent : donation de 100 k€ tous les 15 ans à chaque enfant + assurance-vie avec toi bénéficiaire = énormément transmis sans impôts."
        },
        {
            keys: ['pel', 'cel', 'plan epargne logement'],
            answer: "Le <strong>PEL</strong> (Plan d'Épargne Logement) : relique des années 90 qui n'est plus très attractive.<br><br>📅 PEL 2025 : taux ~1,75% brut, bloqué 10 ans max<br>🏠 Droit à prêt immobilier à taux PEL + 1,2%, peu intéressant quand les taux du marché baissent<br>💸 Fiscalité : flat tax 30% sur les intérêts (plus d'exonération depuis 2018)<br><br>💡 Aujourd'hui : livret A + LEP (si éligible) battent le PEL. Le CEL (Compte Épargne Logement) encore moins intéressant. Hérité de tes parents ? Garde-le s'il est ancien à taux fixe 4%+, sinon ferme."
        },
        {
            keys: ['pee', 'perco', 'actionnariat salarie', 'participation'],
            answer: "L'<strong>épargne salariale</strong> : si tu bosses en entreprise avec ces dispositifs, c'est souvent de l'or brut.<br><br>🎯 <strong>PEE</strong> (Plan Épargne Entreprise) : tu épargnes, l'entreprise ABONDE (ex : +100% jusqu'à un plafond). C'est littéralement de l'argent gratuit. Blocage 5 ans (sauf cas de déblocage : achat RP, mariage, naissance 3e enfant, etc.)<br>🏖️ <strong>PERCO/PER Collectif</strong> : équivalent retraite, blocage jusqu'à la retraite<br>📈 <strong>Actionnariat salarié</strong> : souvent avec décote (20-30%). Très intéressant, mais diversifie — ne mets pas tout sur ton employeur.<br><br>💡 Conseil : maximise TOUJOURS l'abondement. Après, tu peux débloquer 5 ans plus tard pour un achat immo."
        },
        // ===== Pratique étudiant =====
        {
            keys: ['combien epargner', 'pourcentage epargne', '50 30 20', 'budget'],
            answer: "La règle <strong>50/30/20</strong>, simple et efficace :<br><br>📦 <strong>50%</strong> pour les BESOINS : loyer, courses, transports, factures, remboursement prêt étudiant<br>🎉 <strong>30%</strong> pour les ENVIES : sorties, Netflix, voyages, vêtements, restos<br>💰 <strong>20%</strong> pour l'ÉPARGNE et l'investissement : livret de précaution + PEA + projets<br><br>🎓 Pour un étudiant avec peu de revenus, vise déjà 10% d'épargne, c'est déjà énorme. L'idée n'est pas le montant, c'est l'habitude. Tu feras 1 000 €/mois puis 3 000 puis 5 000, le ratio reste le même."
        },
        {
            keys: ['credit etudiant', 'pret etudiant', 'financer etudes'],
            answer: "Le <strong>prêt étudiant</strong> en France :<br><br>💳 Taux : 1-3% en 2026 (variable selon banques)<br>📅 Différé possible : tu rembourses après tes études<br>🇫🇷 Prêt garanti par l'État : jusqu'à 20 000 €, sans caution parentale<br><br>💡 À utiliser avec stratégie : si le taux est < 3% et que tu peux en parallèle investir à ~7%, tu fais un spread positif. Mais attention : le prêt est un ENGAGEMENT, l'investissement est un PARI. Ne jamais s'endetter pour spéculer. S'endetter pour financer tes études qui boosteront tes revenus futurs : ça, oui, c'est malin."
        },
        {
            keys: ['10 euros', '50 euros', '100 euros', 'petit budget', 'peu argent', 'commencer avec rien'],
            answer: "On peut-il investir avec 10/50/100 € ? <strong>OUI</strong>, et c'est même la meilleure manière de commencer. 🎯<br><br>💡 Avec 10 €/mois :<br>• Trade Republic permet le <strong>fractionné</strong> : tu peux acheter 10 € d'ETF ou d'Apple.<br>• Boursorama, Fortuneo acceptent des versements programmés bas.<br><br>🎓 L'important n'est PAS le montant initial. C'est :<br>1. Commencer<br>2. Prendre l'habitude<br>3. Laisser les intérêts composés faire leur job sur 20-40 ans<br><br>📊 10 €/mois à 7%/an pendant 40 ans = 26 000 €. Pour 4 800 € versés. C'est ÇA, la magie."
        },
        {
            keys: ['portefeuille', 'allocation', 'repartition', 'lazy portfolio', 'portfolio'],
            answer: "Exemples de <strong>portefeuilles \"paresseux\"</strong> pour étudiant long terme :<br><br>🏆 <strong>Le 100% simple</strong> (25 ans d'horizon) :<br>• 100% ETF World sur PEA<br><br>🎯 <strong>Le classique</strong> :<br>• 70% ETF World<br>• 20% ETF Émergents<br>• 10% ETF Small caps ou thématique<br><br>🛡️ <strong>Plus prudent</strong> (30+ ans) :<br>• 60% ETF World<br>• 20% ETF obligations<br>• 15% fonds euros<br>• 5% or<br><br>💡 Règle classique : \"110 - ton âge\" = % en actions. À 20 ans : 90% actions. À 40 ans : 70%. Simple, pas optimal, mais très correct.<br><br>🎓 Mieux vaut un portefeuille simple qu'on tient, qu'un portefeuille sophistiqué qu'on abandonne."
        },
        {
            keys: ['rebalancing', 'rebalance', 'reequilibrage'],
            answer: "Le <strong>rebalancing</strong> (rééquilibrage) = remettre ton portefeuille à ses poids cibles.<br><br>📊 Exemple : cible 70% actions / 30% obligations. Les actions montent fort, tu te retrouves à 80/20. Tu vends 10% d'actions et achètes 10% d'obligations pour revenir à 70/30.<br><br>✅ Effet : tu vends quand ça a monté, tu achètes quand ça a baissé. Discipline contre-intuitive.<br>⏰ Fréquence : 1×/an suffit. Pas besoin d'y penser chaque semaine.<br><br>⚠️ Sur CTO, chaque arbitrage génère de l'impôt. Sur PEA ou assurance-vie, zéro friction → idéal pour rebalancer."
        },
        // ===== Livres & éducation (élargi) =====
        {
            keys: ['impot sur revenu', 'ir', 'tranche marginale', 'tmi'],
            answer: "L'<strong>impôt sur le revenu</strong> en France 2026, barème progressif :<br><br>• Jusqu'à 11 497 € → 0%<br>• 11 497 - 29 315 € → 11%<br>• 29 315 - 83 823 € → 30%<br>• 83 823 - 180 294 € → 41%<br>• > 180 294 € → 45%<br><br>📊 Ta <strong>TMI</strong> (tranche marginale d'imposition) = le % sur ton dernier euro gagné. Un étudiant gagnant 10 k€/an : TMI 0%. Ingé à 55 k€ : TMI 30%.<br><br>💡 La TMI détermine l'intérêt de plein de dispositifs : PER, déduction frais réels, niches fiscales. Plus elle est élevée, plus défiscaliser rapporte."
        },
        {
            keys: ['black swan', 'cygne noir', 'evenement extreme'],
            answer: "Un <strong>cygne noir</strong> (concept de Nassim Taleb) = événement ultra-rare, très impactant, imprévisible, et que tout le monde rationalise APRÈS coup.<br><br>🦢 Exemples : 11 septembre 2001, crise 2008, COVID-19, guerre Ukraine.<br><br>💡 Implication pour l'investisseur :<br>• Tes modèles sous-estiment les événements extrêmes<br>• La volatilité réelle > volatilité mesurée (\"fat tails\")<br>• Garde toujours de la trésorerie pour saisir les opportunités (ou simplement survivre)<br>• Assurance-vie en fonds euros + livrets = tes \"airbags\""
        },
        {
            keys: ['benchmark', 'indice reference', 'battre indice', 'alpha beta'],
            answer: "Le <strong>benchmark</strong> = indice de référence pour juger une performance.<br><br>📊 Ton fonds actions France ? On le compare au CAC 40 GR (dividendes inclus). Ton fonds tech ? Au Nasdaq 100.<br><br>🎯 Vocabulaire :<br>• <strong>Alpha</strong> : surperformance vs benchmark (+2% de mieux = alpha de +2)<br>• <strong>Beta</strong> : sensibilité au marché (beta 1 = bouge comme le marché ; beta 1,5 = 50% plus)<br>• <strong>Tracking error</strong> : écart à l'indice<br><br>⚠️ Fait dérangeant : sur 10 ans, <strong>85% des fonds actifs font MOINS BIEN</strong> que leur benchmark. Conclusion : ETF indiciel = statistiquement le plus malin."
        },
        {
            keys: ['sharpe', 'ratio sharpe', 'rendement risque'],
            answer: "Le <strong>ratio de Sharpe</strong> = (rendement - taux sans risque) / volatilité. Mesure la perf ajustée du risque.<br><br>📊 Lecture :<br>• < 0 : pire que le sans risque, terrible<br>• 0-1 : moyen<br>• 1-2 : bon<br>• > 2 : excellent<br>• > 3 : exceptionnel (souvent suspect, creuse)<br><br>💡 Pour comparer deux fonds : celui avec le meilleur Sharpe donne plus de rendement par unité de risque. Mais à horizon long, la volatilité compte moins que la performance brute."
        },
        {
            keys: ['drawdown', 'max drawdown', 'baisse maximale'],
            answer: "Le <strong>drawdown</strong> = baisse maximale depuis un pic jusqu'au creux. Indicateur de douleur.<br><br>📊 Exemples historiques :<br>• S&P 500 en 2008-2009 : -55%<br>• CAC 40 en 2000-2003 : -65%<br>• Bitcoin 2021-2022 : -77%<br>• Une cryptomonnaie random : jusqu'à -99,99% (classique)<br><br>💡 Le test ultime : tu serais capable de continuer à INVESTIR (voire renforcer) alors que ton portefeuille est à -40% ? Si non → ta tolérance au risque est moins haute que tu ne crois. Réduis ton exposition actions."
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
            answer: "Top <strong>lectures finance</strong> pour étudiant curieux :<br><br>📘 <strong>\"La psychologie de l'argent\"</strong> — Morgan Housel (le meilleur pour commencer, se lit comme un roman)<br>📘 <strong>\"L'investisseur intelligent\"</strong> — Benjamin Graham (le prof de Buffett, un peu austère mais LA référence)<br>📘 <strong>\"Père riche, père pauvre\"</strong> — R. Kiyosaki (mindset, critiquable mais marquant)<br>📘 <strong>\"Tout le monde mérite d'être riche\"</strong> — Olivier Seban (adapté au contexte français)<br>📘 <strong>\"Les quatre piliers de l'investissement\"</strong> — W. Bernstein<br>📘 <strong>\"Le petit livre pour investir avec bon sens\"</strong> — J. Bogle (créateur du premier ETF, visionnaire)<br>📘 <strong>\"Le cygne noir\"</strong> — N. Taleb (pour comprendre pourquoi les modèles se plantent)<br><br>🎓 Et bien sûr : les articles de l'IFA 😉 <a href=\"index.html#articles\">sur la page d'accueil</a>."
        },
        // ===== Crises & dates historiques =====
        {
            keys: ['tulipomanie', 'tulipe', 'tulipes', 'bulle tulipe'],
            answer: "<strong>Tulipomanie (1634-1637, Hollande)</strong> 🌷 : première bulle spéculative documentée. Un bulbe de <em>Semper Augustus</em> valait le prix d'une maison à Amsterdam. Krach en février 1637 : -90% en une semaine. Morale : les humains spéculent depuis 400 ans, l'humain n'a pas évolué."
        },
        {
            keys: ['south sea', 'south sea bubble', 'bulle mers du sud', 'mers du sud'],
            answer: "<strong>South Sea Bubble (1720, Londres)</strong> : la South Sea Company promet un monopole sur le commerce sud-américain, sauf qu'elle n'a quasi aucune activité réelle. Action ×10 en 6 mois, krach en septembre 1720. Isaac Newton s'y est ruiné et a lâché : \"Je peux calculer le mouvement des astres, pas la folie des hommes.\""
        },
        {
            keys: ['mississippi bubble', 'bulle mississippi', 'john law'],
            answer: "<strong>Bulle du Mississippi (1720, France)</strong> : John Law, écossais mégalomane, convainc le Régent de créer une banque centrale et d'émettre du papier-monnaie adossé à des actions de la Compagnie du Mississippi. Bulle parabolique, faillite retentissante fin 1720. Trauma qui retardera l'acceptation du papier-monnaie en France… d'environ 70 ans."
        },
        {
            keys: ['panique 1907', 'crise 1907', 'nyc panic', 'knickerbocker'],
            answer: "<strong>Panique de 1907 (USA)</strong> : run bancaire sur Knickerbocker Trust, panique généralisée. J.P. Morgan (l'homme) organise personnellement le sauvetage en injectant son propre capital. C'est cette crise qui déclenche la création de la <strong>Fed</strong> en 1913. Sans Morgan, pas de Fed — et sans Fed, tout aurait été différent."
        },
        {
            keys: ['krach 1929', 'jeudi noir', 'crash 1929', 'black thursday', '24 octobre 1929'],
            answer: "<strong>Krach de 1929</strong> 💥 : jeudi noir le 24 octobre, lundi noir le 28 (-13%), mardi noir le 29 (-12%). Le Dow Jones perdra -89% entre 1929 et juillet 1932. Il ne retrouvera son niveau de 1929 qu'en… <strong>1954</strong>. 25 ans pour récupérer. Déclencheur de la Grande Dépression."
        },
        {
            keys: ['grande depression', 'great depression', '1929 1939'],
            answer: "<strong>Grande Dépression (1929-1939)</strong> : chômage USA à 25%, PIB -30%, 9 000 banques font faillite. New Deal de Roosevelt (1933) : dépenses publiques massives, réformes bancaires (Glass-Steagall), création de la SEC. Fin réelle en 1945 avec l'effort de guerre. La référence historique quand on parle \"crise\"."
        },
        {
            keys: ['glass steagall', 'glass-steagall', 'banking act'],
            answer: "<strong>Glass-Steagall Act (1933)</strong> : sépare banques de dépôt et banques d'investissement aux USA, crée la FDIC (assurance dépôts). Rempart anti-crise pendant 66 ans. Abrogé en 1999 sous Clinton → 9 ans plus tard : crise des subprimes. Coïncidence ? Les économistes se battent encore."
        },
        {
            keys: ['bretton woods', 'accords bretton woods', '1944'],
            answer: "<strong>Bretton Woods (juillet 1944)</strong> 🏛️ : 44 pays se retrouvent dans l'hôtel Mount Washington (New Hampshire). Accords fondateurs : taux de change fixes vs le dollar, dollar convertible en or à 35 $/once, création du <strong>FMI</strong> et de la <strong>Banque Mondiale</strong>. Ordre monétaire mondial pour 27 ans, jusqu'à Nixon en 1971."
        },
        {
            keys: ['nixon shock', 'fin etalon or', 'fin or', '1971', 'etalon or'],
            answer: "<strong>Choc Nixon (15 août 1971)</strong> : Nixon suspend unilatéralement la convertibilité dollar-or. Fin de Bretton Woods, début des changes flottants. Depuis, le dollar (et toutes les monnaies) n'est adossé qu'à la confiance. On appelle ça le système \"fiat\". C'est l'acte de naissance de la finance moderne — et, indirectement, de Bitcoin."
        },
        {
            keys: ['choc petrolier 1973', 'premier choc petrolier', 'opep 1973', 'guerre kippour'],
            answer: "<strong>Premier choc pétrolier (oct. 1973)</strong> ⛽ : l'OPEP impose un embargo aux pays soutenant Israël pendant la guerre du Kippour. Prix du baril : ×4 en 3 mois. Fin des Trente Glorieuses en Europe, stagflation (inflation + stagnation + chômage). Traumatisme pour toute une génération d'économistes qui pensaient maîtriser le cycle."
        },
        {
            keys: ['choc petrolier 1979', 'second choc petrolier', 'revolution iran', '1979'],
            answer: "<strong>Second choc pétrolier (1979)</strong> : révolution islamique en Iran, production pétrolière iranienne ÷4. Baril ×3 en un an. Inflation USA à 13,5%. Paul Volcker (Fed) monte les taux à 20% pour casser l'inflation — récession brutale mais inflation jugulée. Leçon toujours citée par les banquiers centraux aujourd'hui."
        },
        {
            keys: ['volcker', 'paul volcker', 'choc volcker'],
            answer: "<strong>Paul Volcker</strong> (président Fed 1979-1987), 2,01 m, fumeur de cigares. Face à l'inflation à 14%, il monte le taux Fed funds à 20% en 1981. Récession la plus brutale depuis 1929, taux immo à 18%, chômage à 10%. Mais inflation écrasée : 3,5% en 1983. Modèle absolu du banquier central courageux."
        },
        {
            keys: ['lundi noir 1987', 'black monday 1987', 'krach 1987', '19 octobre 1987'],
            answer: "<strong>Lundi noir (19 oct. 1987)</strong> : le Dow Jones perd <strong>-22,6% en UN JOUR</strong>, record absolu. Déclencheur : trading algorithmique de \"portfolio insurance\" qui amplifie la chute. Particularité : récupération rapide (2 ans), contrairement à 1929. Preuve qu'un krach violent ne déclenche pas forcément une dépression."
        },
        {
            keys: ['bulle japon', 'bulle japonaise', 'krach japon 1990', 'decennie perdue', 'lost decade'],
            answer: "<strong>Bulle japonaise (1986-1989, krach 1990)</strong> 🗾 : le Nikkei atteint 38 957 points fin 1989, valorisant les terrains du Palais impérial de Tokyo plus cher que toute la Californie. Krach en 1990, -80% sur 13 ans. Le Nikkei ne dépassera son plus-haut de 1989 qu'en… <strong>février 2024</strong>. 34 ans d'attente. Le \"buy & hold\" a des limites géographiques."
        },
        {
            keys: ['soros livre sterling', 'mercredi noir', 'black wednesday', '1992 soros', 'soros boe'],
            answer: "<strong>Mercredi noir (16 septembre 1992)</strong> : George Soros parie 10 Md$ contre la livre sterling, forçant la Banque d'Angleterre à sortir du mécanisme de change européen (SME). Profit estimé : 1 Md$ en un jour. Surnom : \"The man who broke the Bank of England\". Depuis, le Royaume-Uni n'est jamais entré dans l'euro."
        },
        {
            keys: ['crise tequila', 'mexique 1994', 'peso mexicain'],
            answer: "<strong>Crise Tequila (décembre 1994, Mexique)</strong> 🍹 : dévaluation brutale du peso (-50%), fuite des capitaux. Plan de sauvetage US de 50 Md$. Prélude aux crises émergentes des années 90 (Asie 1997, Russie 1998). Preuve que les émergents = rendements ET volatilité."
        },
        {
            keys: ['crise asiatique', 'crise 1997', 'thailande 1997', 'bath thai'],
            answer: "<strong>Crise asiatique (1997)</strong> : ça commence en juillet quand la Thaïlande lâche son ancrage au dollar. Contagion : Indonésie, Corée, Malaisie, Philippines. Chute des devises de 30-80%, FMI intervient avec 110 Md$ de prêts. Récession sévère, émeutes en Indonésie (chute de Suharto). Leçon : ancrer sa monnaie à une autre, c'est fragile."
        },
        {
            keys: ['ltcm', 'long term capital', 'meriwether'],
            answer: "<strong>LTCM (septembre 1998)</strong> : Long-Term Capital Management, fonds star avec 2 Prix Nobel (Merton, Scholes) et un levier 25×. Les modèles \"parfaits\" explosent avec le défaut russe. Pertes : 4,6 Md$ en 4 mois. La Fed organise un sauvetage privé pour éviter un effet domino. Morale : les modèles mathématiques ignorent toujours les queues de distribution."
        },
        {
            keys: ['defaut russie', 'russie 1998', 'rouble 1998'],
            answer: "<strong>Défaut russe (août 1998)</strong> 🇷🇺 : la Russie fait défaut sur sa dette intérieure et dévalue le rouble. Déclenche la chute de LTCM. Les \"pays civilisés\" peuvent aussi faire défaut — leçon précieuse. Le rouble perdra 75% en quelques mois. Spoiler : la Russie fera à nouveau défaut en 2022 après l'invasion de l'Ukraine."
        },
        {
            keys: ['bulle internet', 'dot com', 'dotcom', 'krach 2000', 'bulle tech'],
            answer: "<strong>Bulle Internet (1995-2000, krach 2000-2002)</strong> 💻 : le Nasdaq quintuple en 5 ans, PER insensés, entreprises sans chiffre d'affaires cotées à des milliards (Pets.com, eToys, Webvan). Pic en mars 2000. Krach : -78% sur le Nasdaq en 2,5 ans. Le Nasdaq ne retrouvera son plus-haut de 2000 qu'en… 2015. 15 ans."
        },
        {
            keys: ['11 septembre', '9 11', 'september 11', 'attentats 2001'],
            answer: "<strong>11 septembre 2001</strong> : bourse NYC fermée 4 jours (record depuis 1933). Réouverture le 17 septembre : Dow -7% sur la journée. Impact long terme limité sur les marchés, impact politique immense (guerre Afghanistan, Irak, Patriot Act). La finance est plus résiliente qu'on ne le pense face à des chocs exogènes."
        },
        {
            keys: ['enron', 'worldcom', 'scandale enron'],
            answer: "<strong>Scandale Enron (déc. 2001)</strong> : géant américain de l'énergie, 7e capitalisation US, encensé par tous les analystes. Révélation : comptabilité trafiquée sur des années, pertes cachées hors bilan. Faillite + disparition d'Arthur Andersen (cabinet d'audit). Conséquence : loi Sarbanes-Oxley (2002), qui renforce la transparence comptable aux USA."
        },
        {
            keys: ['subprimes', 'subprime', 'crise 2008', 'lehman', 'lehman brothers', 'crise financiere 2008', 'gfc'],
            answer: "<strong>Crise des subprimes (2007-2009)</strong> 💥 : prêts immobiliers US accordés à des ménages insolvables, titrisés en CDO vendus au monde entier (AAA, évidemment 🙄). Bear Stearns tombe en mars 2008. <strong>Lehman Brothers fait faillite le 15 septembre 2008</strong> — déclencheur. AIG sauvée 180 Md$, S&P -57% (de oct. 2007 à mars 2009), récession mondiale. Coût estimé : 15 000 Md$. Le monde n'en est toujours pas complètement sorti."
        },
        {
            keys: ['cdo', 'titrisation', 'mbs', 'abs'],
            answer: "<strong>CDO / Titrisation</strong> : prendre des milliers de crédits hétérogènes (subprimes, cartes de crédit, autos), les empaqueter, faire noter le paquet AAA par des agences complaisantes, vendre au monde entier. Innovation financière des années 2000 qui a fait exploser 2008. Depuis : les CDO existent encore mais sont beaucoup plus régulés (Bâle III, Dodd-Frank)."
        },
        {
            keys: ['flash crash', '6 mai 2010', 'flash crash 2010'],
            answer: "<strong>Flash Crash (6 mai 2010, 14h45 heure NY)</strong> : le Dow perd <strong>-9% en 5 minutes</strong>, puis récupère. Cause : un trader britannique (Navinder Sarao) accusé de \"spoofing\" + algorithmes HFT en cascade. Première démonstration publique que les marchés modernes peuvent se fracasser en secondes. Les \"circuit breakers\" ont été renforcés depuis."
        },
        {
            keys: ['crise dette europeenne', 'crise grecque', 'grece 2010', 'pigs', 'crise euro'],
            answer: "<strong>Crise de la dette européenne (2010-2012)</strong> 🇪🇺 : la Grèce révèle avoir maquillé ses comptes, dette publique à 130% du PIB. Contagion PIGS (Portugal, Italie, Grèce, Espagne). Draghi (BCE) sauve l'euro en juillet 2012 avec son fameux <strong>\"Whatever it takes\"</strong>. Trois mots qui ont valu plusieurs centaines de milliards d'économie."
        },
        {
            keys: ['whatever it takes', 'draghi', 'mario draghi'],
            answer: "<strong>\"Whatever it takes\" (26 juillet 2012)</strong> : Mario Draghi, président BCE, à Londres : \"Within our mandate, the ECB is ready to do whatever it takes to preserve the euro. And believe me, it will be enough.\" Taux des dettes italienne et espagnole : chute immédiate. Les marchés lui ont cru sur parole. Un des discours les plus impactants de l'histoire financière."
        },
        {
            keys: ['downgrade usa', 'sp degrade usa', 'aaa usa', 'aa+ usa', '2011 s&p'],
            answer: "<strong>Dégradation USA (5 août 2011)</strong> : S&P Global retire le AAA historique aux USA, passe à AA+, après l'interminable saga du plafond de la dette au Congrès. Séisme symbolique. Le Dow perd -6,7% le premier jour de bourse suivant. Moody's et Fitch ont suivi (Fitch en 2023, Moody's en 2025)."
        },
        {
            keys: ['chypre 2013', 'haircut chypre', 'crise chypriote'],
            answer: "<strong>Crise chypriote (mars 2013)</strong> : premier \"bail-in\" de la zone euro — ponction sur les dépôts bancaires > 100 000 €, jusqu'à -47,5% chez Bank of Cyprus. Choc psychologique : pour la première fois, des épargnants perdent une partie de leurs dépôts. Depuis, les dépôts < 100 000 € restent garantis, mais le signal est passé."
        },
        {
            keys: ['franc suisse 2015', 'snb 2015', 'peg chf'],
            answer: "<strong>Décrochage du franc suisse (15 janvier 2015)</strong> : la SNB abandonne sans préavis son ancrage à 1,20 CHF/EUR. Le franc s'apprécie de <strong>+30% en quelques minutes</strong>. Plusieurs brokers forex font faillite (Alpari UK), beaucoup de traders individuels ruinés. Leçon : les banques centrales peuvent vous trahir en 30 secondes."
        },
        {
            keys: ['brexit', 'referendum uk', 'vote brexit', '23 juin 2016'],
            answer: "<strong>Brexit (référendum 23 juin 2016)</strong> 🇬🇧 : le Royaume-Uni vote à 52% pour quitter l'UE. Livre sterling : -10% en une nuit (plus gros mouvement quotidien de son histoire). Sortie officielle : 31 janvier 2020. Coût économique estimé : 4-6% de PIB britannique sur long terme (Bank of England)."
        },
        {
            keys: ['covid marches', 'covid krach', 'mars 2020', 'crash covid'],
            answer: "<strong>Krach COVID (février-mars 2020)</strong> 🦠 : S&P -34% en 23 jours, le krach le plus rapide de l'histoire. Intervention Fed + BCE massive, plans de relance colossaux (CARES Act : 2 200 Md$). Récupération tout aussi rapide : S&P bat son plus-haut en août 2020. Le krach \"V-shape\" qui a changé les manuels."
        },
        {
            keys: ['gamestop', 'gme', 'short squeeze', 'wall street bets', 'wsb'],
            answer: "<strong>GameStop Saga (janvier 2021)</strong> : r/WallStreetBets (Reddit) contre les hedge funds shortant GameStop. GME passe de 17 $ à <strong>483 $ en 3 semaines</strong>. Melvin Capital liquidé (perte 6,8 Md$). Film \"Dumb Money\" en 2023. Événement culturel : la plèbe financière bat (brièvement) les pros. Aussi : naissance du \"meme stock\"."
        },
        {
            keys: ['terra luna', 'luna crash', 'ust depeg'],
            answer: "<strong>Effondrement Terra-Luna (mai 2022)</strong> 💀 : stablecoin algorithmique UST perd son peg, Luna passe de 80 $ à <strong>0,00002 $ en 3 jours</strong>. ~40 Md$ évaporés. Le fondateur Do Kwon arrêté au Monténégro en 2023. Choc majeur dans la crypto, annonçant la chute de FTX."
        },
        {
            keys: ['ftx', 'sam bankman fried', 'sbf', 'alameda'],
            answer: "<strong>Faillite FTX (11 novembre 2022)</strong> : 2e plus grosse plateforme crypto au monde, valorisée 32 Md$ en janvier 2022. Révélation : Sam Bankman-Fried utilisait les fonds des clients pour couvrir les pertes de sa société sœur Alameda. 8 Md$ manquants. SBF condamné en 2024 à 25 ans de prison. La crypto a un problème de gouvernance."
        },
        {
            keys: ['svb', 'silicon valley bank', 'mars 2023', 'run bancaire 2023'],
            answer: "<strong>Faillite SVB (10 mars 2023)</strong> 🏦 : Silicon Valley Bank (200 Md$ d'actifs), banque des startups tech. Bank run en 48h via applis bancaires (du jamais vu). Cause : obligations longues achetées à taux bas + hausse rapide des taux Fed 2022. Plus grosse faillite bancaire US depuis 2008. Signature Bank et First Republic suivent. Fin du \"cycle Silicon Valley\"."
        },
        {
            keys: ['credit suisse', 'rachat cs ubs', 'mars 2023 cs'],
            answer: "<strong>Rachat Credit Suisse par UBS (19 mars 2023)</strong> 🇨🇭 : après 167 ans d'existence, Credit Suisse vendu en catastrophe à UBS pour 3 Md CHF (vs 8 Md en bourse deux jours avant). Gouvernement suisse force la transaction pour éviter une panique mondiale. 16 Md CHF d'obligations AT1 réduites à zéro — choc juridique énorme."
        },
        {
            keys: ['inflation 2022', 'retour inflation', 'choc inflation 2022'],
            answer: "<strong>Choc inflationniste (2022-2023)</strong> : inflation à <strong>9,1% USA en juin 2022</strong> (pic depuis 1981), 10,6% zone euro en octobre. Causes : goulets post-COVID, relance massive, choc énergétique lié à l'Ukraine. Fed monte ses taux de 0 à 5,5% en 18 mois — plus rapide cycle de hausse de l'histoire. Les obligations perdent -17% en 2022 (record)."
        },
        {
            keys: ['guerre ukraine marches', 'invasion ukraine', '24 fevrier 2022'],
            answer: "<strong>Invasion de l'Ukraine (24 février 2022)</strong> 🇺🇦 : flambée des prix énergie (gaz européen ×10 en quelques mois), blé, engrais. Russie exclue du système SWIFT, 300 Md$ de réserves russes gelées (premier précédent majeur). Accélère la démondialisation, l'indépendance énergétique européenne, le retour du nucléaire."
        },

        // ===== Économistes & figures historiques =====
        {
            keys: ['adam smith', 'richesse des nations', 'main invisible'],
            answer: "<strong>Adam Smith</strong> (1723-1790) 📖 : père de l'économie moderne. Son livre \"La Richesse des Nations\" (1776) pose la théorie de la <strong>main invisible</strong> : la poursuite de l'intérêt individuel produit, par le marché, l'intérêt collectif. Souvent mal cité : Smith était aussi un MORALISTE (\"Théorie des Sentiments Moraux\"), pas juste un apôtre du capitalisme débridé."
        },
        {
            keys: ['keynes', 'john maynard keynes', 'keynesianisme'],
            answer: "<strong>John Maynard Keynes</strong> (1883-1946) : économiste britannique, père de la macroéconomie moderne. Thèse principale : en crise, l'État DOIT dépenser (\"relance\") pour compenser l'effondrement de la demande privée. Inspire le New Deal, les Trente Glorieuses, les plans COVID. Citation : \"À long terme, nous serons tous morts.\""
        },
        {
            keys: ['friedman', 'milton friedman', 'monetarisme', 'chicago school'],
            answer: "<strong>Milton Friedman</strong> (1912-2006) : économiste US, prix Nobel 1976, figure du <strong>monétarisme</strong> et de l'école de Chicago. Thèse : \"L'inflation est toujours et partout un phénomène monétaire.\" Influence massive sur Thatcher et Reagan. Opposé à Keynes. Célèbre pour \"There's no such thing as a free lunch.\""
        },
        {
            keys: ['karl marx', 'marxisme', 'capital marx'],
            answer: "<strong>Karl Marx</strong> (1818-1883) : théoricien du capitalisme et de sa contradiction interne. \"Le Capital\" (1867) analyse l'exploitation du travail et la tendance à la concentration. Son analyse du capitalisme reste citée (même par ses détracteurs) ; ses propositions politiques, beaucoup moins. La social-démocratie européenne lui doit plus qu'elle ne l'admet."
        },
        {
            keys: ['hayek', 'friedrich hayek', 'ecole autrichienne', 'route servitude'],
            answer: "<strong>Friedrich Hayek</strong> (1899-1992) : économiste austro-britannique, Nobel 1974. Figure de l'école autrichienne. Thèse : l'État qui planifie détruit la liberté individuelle (\"La Route de la Servitude\", 1944). Anti-keynésien virulent. Inspire Thatcher-Reagan, la libertarian tradition US. Plus respecté par les praticiens (banquiers centraux) qu'on ne le croit."
        },
        {
            keys: ['ricardo', 'david ricardo', 'avantage comparatif'],
            answer: "<strong>David Ricardo</strong> (1772-1823) : trader à succès devenu économiste. Théorie de l'<strong>avantage comparatif</strong> (1817) : deux pays ont intérêt à commercer même si l'un est meilleur en tout — fondement du libre-échange mondial. Aussi : théorie de la rente foncière, critique du protectionnisme. Mort millionnaire en livres de 1823 (~100 M€ actuels)."
        },
        {
            keys: ['benjamin graham', 'graham', 'intelligent investor'],
            answer: "<strong>Benjamin Graham</strong> (1894-1976) : prof de Buffett à Columbia, père de l'investissement \"value\". \"Security Analysis\" (1934) + \"L'investisseur intelligent\" (1949) = bibles. Concept clé : <strong>marge de sécurité</strong> (acheter à 50 c ce qui en vaut 1 €). Métaphore \"Mr. Market\" : le marché est un maniaco-dépressif qui vous propose des prix chaque jour — libre à vous de les ignorer."
        },
        {
            keys: ['bogle', 'jack bogle', 'vanguard bogle', 'index fund'],
            answer: "<strong>John \"Jack\" Bogle</strong> (1929-2019) 🦾 : fondateur de Vanguard (1975), inventeur du premier fonds indiciel grand public. Sa thèse : les frais DÉTRUISENT les rendements, la majorité des gérants ne bat pas l'indice, donc autant acheter l'indice à bas coût. A fait économiser des CENTAINES de milliards aux épargnants. Vanguard gère ~9 000 Md$. Héros silencieux."
        },
        {
            keys: ['ray dalio', 'dalio', 'bridgewater', 'principles'],
            answer: "<strong>Ray Dalio</strong> (né 1949) : fondateur de Bridgewater, plus gros hedge fund au monde (~120 Md$). Connu pour son concept de \"<strong>All Weather Portfolio</strong>\" (fonctionne dans toutes les conditions macro) et son livre \"Principles\". Style : radical transparency (les employés s'évaluent publiquement, culture brutale). Auteur aussi de \"The Changing World Order\" sur les cycles de grande puissance."
        },
        {
            keys: ['george soros', 'soros'],
            answer: "<strong>George Soros</strong> (né 1930) : hongrois rescapé de l'Holocauste, fonde le Quantum Fund (1973). Connu pour avoir cassé la Banque d'Angleterre en 1992 (1 Md$ en un jour). Théoricien de la <strong>réflexivité</strong> : le marché n'est pas juste un miroir de l'économie, il influence l'économie qu'il observe. Philanthrope (Open Society Foundations, 32 Md$ donnés). Détesté par l'extrême-droite mondiale."
        },
        {
            keys: ['druckenmiller', 'stanley druckenmiller'],
            answer: "<strong>Stanley Druckenmiller</strong> : bras droit de Soros dans le trade contre la livre (1992). A tenu Duquesne Capital pendant 30 ans avec une performance annuelle de ~30%/an sans AUCUNE année négative. Légende absolue. Aujourd'hui family office, commentateur macro acéré. Conseil favori : \"Fais de gros paris quand tu as raison.\""
        },
        {
            keys: ['peter lynch', 'lynch', 'magellan fund'],
            answer: "<strong>Peter Lynch</strong> : gérait le Fidelity Magellan Fund de 1977 à 1990. Performance : <strong>29%/an pendant 13 ans</strong>, quasi-inégalée. Philosophie accessible : \"Investis dans ce que tu connais\" (ton supermarché, ta marque préférée). Livres : \"One Up on Wall Street\", \"Beating the Street\". A pris sa retraite à 46 ans pour voir grandir ses filles. Classe."
        },
        {
            keys: ['charlie munger', 'munger'],
            answer: "<strong>Charlie Munger</strong> (1924-2023) : alter ego de Buffett, vice-président de Berkshire Hathaway pendant 45 ans. Philosophe-avocat-investisseur, esprit tranchant, humour sec. A poussé Buffett au-delà du pur \"value\" de Graham vers la qualité. Célèbre pour \"Invert, always invert\" : pour réussir, étudie comment échouer et évite-le. Mort à 99 ans."
        },
        {
            keys: ['michael burry', 'big short', 'burry'],
            answer: "<strong>Michael Burry</strong> : médecin devenu hedge fund manager (Scion Capital). A vu venir la crise des subprimes dès 2005 en lisant les prospectus des CDO un par un. A parié massivement contre eux et a encaissé 700 M$ personnellement. Sujet du livre \"The Big Short\" (Michael Lewis) puis du film. Tweete des prédictions apocalyptiques régulièrement — souvent fausses."
        },
        {
            keys: ['jim simons', 'renaissance', 'medallion fund'],
            answer: "<strong>Jim Simons</strong> (1938-2024) : mathématicien, ex-cryptographe NSA. Fonde Renaissance Technologies (1982). Son fonds Medallion Fund : <strong>66%/an brut de frais sur 30 ans</strong>, le meilleur track record de l'histoire financière. Mystère total : 100% quantitatif, signaux extrêmement complexes. Fonds fermé aux externes. Fortune : ~30 Md$. Le cerveau ultime de la finance."
        },
        {
            keys: ['piketty', 'thomas piketty', 'capital xxi'],
            answer: "<strong>Thomas Piketty</strong> (né 1971) : économiste français (EHESS). \"Le Capital au XXIe siècle\" (2013), best-seller mondial. Thèse : r > g, le rendement du capital est historiquement supérieur à la croissance, donc les inégalités patrimoniales grandissent mécaniquement. Controversé, mais a remis le sujet des inégalités au centre du débat économique."
        },
        {
            keys: ['stiglitz', 'joseph stiglitz'],
            answer: "<strong>Joseph Stiglitz</strong> (né 1943) : économiste US, Nobel 2001. Thèses principales : asymétries d'information, critique de la mondialisation \"mal régulée\", défense de la régulation publique. Ancien chef économiste de la Banque Mondiale. Critique acerbe du FMI. Figure de proue de la social-démocratie économique."
        },
        {
            keys: ['paul krugman', 'krugman'],
            answer: "<strong>Paul Krugman</strong> (né 1953) : économiste US, Nobel 2008 (théorie du commerce international). Chroniqueur au NYT depuis 2000, keynésien revendiqué. Sa force : vulgarisation impeccable. A eu tort sur beaucoup de prédictions (récession annoncée plusieurs fois qui n'est pas venue), raison sur d'autres (inflation temporaire post-COVID)."
        },

        // ===== Institutions & banques centrales =====
        {
            keys: ['fed', 'federal reserve', 'reserve federale'],
            answer: "<strong>Federal Reserve (Fed)</strong> 🇺🇸 : banque centrale des USA, fondée en 1913 après la panique de 1907. Structure : 12 banques régionales + Board of Governors à Washington. Président actuel (2026) : Jerome Powell (jusqu'en mai 2026). Double mandat : stabilité des prix + plein emploi. Ses décisions de taux dictent l'humeur des marchés mondiaux."
        },
        {
            keys: ['bce', 'banque centrale europeenne', 'ecb'],
            answer: "<strong>Banque Centrale Européenne (BCE)</strong> 🇪🇺 : fondée en 1998, basée à Francfort. Présidente : Christine Lagarde (depuis 2019). Mandat unique (contrairement à la Fed) : stabilité des prix, cible 2%. Gère l'euro pour 20 pays. Instruments : taux directeurs, LTRO, quantitative easing. Plus lente à agir que la Fed (consensus à trouver entre membres)."
        },
        {
            keys: ['banque de france', 'bdf'],
            answer: "<strong>Banque de France</strong> 🇫🇷 : fondée par Napoléon en 1800. Aujourd'hui, membre du Système européen de banques centrales (SEBC). Rôles : mise en œuvre de la politique monétaire BCE, supervision bancaire (ACPR), billets en euros, cotation des entreprises, médiation du crédit. Son siège rue Croix-des-Petits-Champs à Paris contient 2 436 tonnes d'or — 4e réserve mondiale."
        },
        {
            keys: ['bank of england', 'boe', 'banque angleterre'],
            answer: "<strong>Bank of England</strong> 🇬🇧 : fondée en 1694, 2e plus ancienne banque centrale au monde (après la Suède). Surnommée \"The Old Lady of Threadneedle Street\". Indépendante depuis 1997. Gouverneur actuel : Andrew Bailey. Gardienne de la livre sterling. Sa réputation a pris un coup avec Soros en 1992 et le mini-budget Truss en 2022."
        },
        {
            keys: ['bank of japan', 'boj', 'banque japon'],
            answer: "<strong>Bank of Japan (BoJ)</strong> 🇯🇵 : fondée en 1882. Championne du monde des politiques monétaires non-conventionnelles : taux négatifs (2016-2024), achats massifs d'ETF japonais (détient ~60% des ETF japonais cotés), yield curve control. A enfin sorti la tête de l'eau en 2024 avec la fin des taux négatifs après… 17 ans. Patience et thé vert."
        },
        {
            keys: ['snb', 'banque nationale suisse'],
            answer: "<strong>Banque Nationale Suisse (SNB)</strong> 🇨🇭 : fondée en 1907. Particularité : son bilan représente ~120% du PIB suisse (plus gros qu'à peu près tout le monde), rempli d'actions US (!) et de réserves de change. Détient 1 040 tonnes d'or. Célèbre pour avoir lâché brutalement son peg à l'euro en janvier 2015 — traumatisme forex historique."
        },
        {
            keys: ['pboc', 'banque populaire de chine', 'bpc chine'],
            answer: "<strong>People's Bank of China (PBoC)</strong> 🇨🇳 : banque centrale chinoise, mais beaucoup moins indépendante que ses homologues — elle suit les directives du Parti. Gouverneur : Pan Gongsheng. Gère le yuan (CNY), qui n'est pas totalement convertible. Énormes réserves de change (~3 200 Md$, plus que tout le monde). Influence croissante sur les marchés mondiaux des matières premières."
        },
        {
            keys: ['fmi', 'imf', 'fonds monetaire international'],
            answer: "<strong>FMI (Fonds Monétaire International)</strong> : créé en 1944 à Bretton Woods, siège à Washington. 190 pays membres. Rôle : stabilité monétaire mondiale, prêts d'urgence aux pays en crise (Grèce 2010, Ukraine 2022, Pakistan, Argentine ×9 fois…). Directrice générale (2026) : Kristalina Georgieva. Conditionnalités souvent critiquées : austérité imposée, privatisations."
        },
        {
            keys: ['banque mondiale', 'world bank'],
            answer: "<strong>Banque Mondiale</strong> : née aussi à Bretton Woods (1944). Mission : réduction de la pauvreté, financement de projets de développement (écoles, routes, énergie) dans les pays émergents et en développement. Président : généralement américain (tradition). À ne pas confondre avec le FMI — complémentaires mais rôles différents."
        },
        {
            keys: ['omc', 'wto', 'organisation mondiale commerce'],
            answer: "<strong>OMC (Organisation Mondiale du Commerce)</strong> : créée en 1995, succède au GATT. Arbitre du commerce international, 164 membres. Système de résolution des différends (ex : UE vs USA sur Airbus-Boeing). Paralysée depuis 2019 par le blocage US sur la nomination des juges d'appel. L'ère du libre-échange triomphant est derrière nous."
        },
        {
            keys: ['ocde', 'oecd'],
            answer: "<strong>OCDE</strong> : Organisation de coopération et développement économiques. 38 pays \"riches\", siège à Paris. Think tank et producteur de statistiques de référence (PIB, éducation, fiscalité). Connue pour ses études PISA sur l'éducation et ses négociations sur l'impôt mondial minimum de 15% (accord 2021, en vigueur depuis 2024)."
        },
        {
            keys: ['g7', 'g20', 'sommet g7'],
            answer: "<strong>G7 / G20</strong> : G7 = 7 économies avancées (USA, Japon, Allemagne, UK, France, Italie, Canada) + UE. G20 = ajoute Chine, Inde, Brésil, Arabie Saoudite, Russie (suspendue de facto depuis 2022)… 85% du PIB mondial. Rôle : coordination politique macro. Souvent plus symbolique qu'opérationnel, mais crucial en crise (G20 en 2008-2009)."
        },
        {
            keys: ['davos', 'forum economique mondial', 'wef'],
            answer: "<strong>Davos / Forum Économique Mondial</strong> 🎿 : rencontre annuelle en janvier dans les Alpes suisses, fondée par Klaus Schwab en 1971. Rassemble CEO, chefs d'État, ONG. Cliché : les élites mondiales se retrouvent en hélico pour parler des pauvres. Utile pour le networking, controversé pour son élitisme. Le mot \"globalisation\" y a été glorifié puis contesté."
        },
        {
            keys: ['acpr', 'autorite prudentielle'],
            answer: "<strong>ACPR (Autorité de Contrôle Prudentiel et de Résolution)</strong> : régulateur bancaire et assurantiel français, adossé à la Banque de France. Rôle : s'assurer que les banques et assurances sont solvables. Complément de l'AMF (qui, elle, régule les marchés). Délivre les agréments. Si ton courtier n'est pas agréé ACPR/AMF, tu fuis."
        },

        // ===== Culture économique & concepts =====
        {
            keys: ['capitalisme'],
            answer: "<strong>Capitalisme</strong> : système économique fondé sur la propriété privée des moyens de production, le marché, et l'accumulation du capital. Variantes : anglo-saxon (libre), rhénan (social), nordique (redistributif), chinois (d'État). Depuis 1989, ~unique modèle dominant, mais contesté (inégalités, climat, financiarisation). Churchill : \"le pire système à l'exception de tous les autres.\""
        },
        {
            keys: ['socialisme', 'economie planifiee', 'urss economie'],
            answer: "<strong>Socialisme économique</strong> : propriété collective/publique des moyens de production, économie planifiée (URSS, Chine maoïste, Cuba). Échecs globaux du XXe siècle (effondrement URSS 1991). Les \"socialismes démocratiques\" modernes (Scandinavie) sont en réalité des capitalismes régulés avec forte redistribution, pas du socialisme au sens marxiste."
        },
        {
            keys: ['liberalisme', 'liberalisme economique'],
            answer: "<strong>Libéralisme économique</strong> : doctrine de la liberté des marchés, intervention minimale de l'État. Racines chez Smith, Ricardo, Mill. Renaissance avec Hayek-Friedman dans les années 80 (\"néolibéralisme\" Reagan-Thatcher). Depuis 2008, en retrait : retour de l'État (plan COVID, Inflation Reduction Act US, souveraineté industrielle EU). Le cycle tourne."
        },
        {
            keys: ['mercantilisme'],
            answer: "<strong>Mercantilisme</strong> : doctrine dominante XVIe-XVIIIe siècle. Thèse : la richesse d'une nation = ses réserves en or et argent → il faut exporter plus qu'on importe. Colbert en France. Justifie le colonialisme, le protectionnisme. Théoriquement mort, mais version moderne visible : politique commerciale chinoise, tarifs Trump 2025."
        },
        {
            keys: ['destruction creatrice', 'schumpeter'],
            answer: "<strong>Destruction créatrice (Schumpeter)</strong> : l'innovation capitaliste DÉTRUIT les anciens acteurs en même temps qu'elle crée les nouveaux. Kodak tué par le numérique, Blockbuster par Netflix, taxis par Uber, Nokia par l'iPhone. Moteur central du capitalisme selon Joseph Schumpeter (1883-1950). Douloureux à court terme, indispensable à long terme."
        },
        {
            keys: ['main invisible', 'adam smith main'],
            answer: "<strong>La main invisible</strong> (Smith, 1776) : métaphore célèbre. Chacun poursuivant son intérêt égoïste, le marché produit \"comme par une main invisible\" un résultat collectif optimal. Vrai… sous conditions strictes : concurrence pure et parfaite, pas d'externalités, info parfaite. Dans la vraie vie, ces conditions sont rarement réunies, d'où la régulation."
        },
        {
            keys: ['courbe phillips', 'phillips curve'],
            answer: "<strong>Courbe de Phillips</strong> (1958) : relation inverse entre chômage et inflation. Chômage bas → inflation qui monte. Base des politiques monétaires pendant 30 ans. Cassée dans les années 70 (stagflation : les deux montaient ensemble). Affaiblie aussi post-2010. Mais revenue en force en 2021-2022 : chômage bas + relance = inflation."
        },
        {
            keys: ['gini', 'coefficient gini', 'inegalites'],
            answer: "<strong>Coefficient de Gini</strong> : mesure l'inégalité de distribution des revenus. 0 = parfaite égalité, 1 (ou 100) = un seul a tout. France : ~0,29. USA : ~0,42. Scandinavie : ~0,25. Brésil : ~0,53. Afrique du Sud : ~0,63 (record mondial). Les pays les plus inégalitaires sont souvent les plus instables politiquement."
        },
        {
            keys: ['parite pouvoir achat', 'ppa', 'ppp'],
            answer: "<strong>Parité de pouvoir d'achat (PPA)</strong> : compare les revenus en tenant compte du coût de la vie local. Un salaire de 30 000 € à Paris ≠ 30 000 € à Bucarest. The Economist publie le <strong>Big Mac Index</strong> depuis 1986 pour mesurer les sur/sous-valorisations de devises. Outil pédagogique génial mais approximatif."
        },
        {
            keys: ['balance commerciale', 'deficit commercial', 'balance paiement'],
            answer: "<strong>Balance commerciale</strong> = exportations - importations. France : structurellement déficitaire depuis 2004 (~-80 Md€/an). Allemagne, Chine : excédents massifs. USA : déficit commercial chronique, compensé par le privilège du dollar. Pas forcément un problème en soi : un déficit commercial financé par des investissements étrangers peut être sain."
        },
        {
            keys: ['hyperinflation', 'weimar', 'zimbabwe', 'venezuela hyperinflation'],
            answer: "<strong>Hyperinflation</strong> : inflation > 50%/mois. Cas historiques :<br>• <strong>Weimar 1923</strong> : 1 dollar = 4 200 milliards de marks au pic. Une brouette = le prix d'un pain. 🍞<br>• <strong>Hongrie 1946</strong> : record absolu, prix × 2 toutes les 15h.<br>• <strong>Zimbabwe 2008</strong> : billets de 100 000 milliards Z$.<br>• <strong>Venezuela 2018</strong> : +1 000 000%/an.<br><br>Cause commune : monétisation du déficit par une banque centrale aux ordres du gouvernement."
        },
        {
            keys: ['devaluation', 'devaluer'],
            answer: "<strong>Dévaluation</strong> : baisse volontaire de la valeur d'une monnaie (en régime fixe) ou effondrement de fait (en régime flottant). Bénéfice : exportations moins chères à l'étranger → relance. Coût : importations plus chères → inflation, perte pouvoir d'achat. La France a dévalué plusieurs fois le franc (1958, 1969, 1981, 1982, 1983) avant l'euro."
        },
        {
            keys: ['euro', 'zone euro', 'histoire euro'],
            answer: "<strong>L'Euro</strong> 💶 : monnaie unique de 20 pays. Lancement scriptural 1er janvier 1999, billets et pièces 1er janvier 2002. 11 pays fondateurs. Dernier entrant : Croatie (2023). Taux de conversion final franc/euro : 6,55957 francs pour 1 €. Critique fréquente : zone monétaire NON optimale (pays trop hétérogènes, pas de budget commun). Mais la BCE a tenu bon depuis 2012."
        },
        {
            keys: ['convergence', 'criteres maastricht', 'maastricht'],
            answer: "<strong>Critères de Maastricht (1992)</strong> : pour entrer dans l'euro, un pays doit respecter : déficit public < 3% PIB, dette publique < 60% PIB, inflation < 1,5% au-dessus des 3 meilleurs, taux long < 2% au-dessus. Dans les faits : la France et l'Allemagne les ont violés dès 2003. Symbolique mais contraignant psychologiquement."
        },
        {
            keys: ['pacte stabilite', 'pacte budgetaire', '3 pourcent deficit'],
            answer: "<strong>Pacte de stabilité et de croissance (1997)</strong> : cadre budgétaire UE imposant déficit < 3% PIB et dette < 60%. Suspendu plusieurs fois (2008, 2020). Réforme 2024 : règles assouplies, avec trajectoire pluriannuelle. La règle des 3% reste symbolique mais très critiquée (Piketty, Blanchard) pour rigidité inadaptée."
        },
        {
            keys: ['qe', 'quantitative easing', 'assouplissement quantitatif'],
            answer: "<strong>Quantitative Easing (QE)</strong> : banque centrale achète massivement des obligations (d'État, d'entreprise) pour injecter de la liquidité et baisser les taux longs. Fed 2008-2014 : 3 600 Md$. BCE 2015-2022 : 3 400 Md€. Controversé : a sauvé les marchés, mais gonflé les bulles (immo, tech). Passé de recette \"d'urgence\" à outil \"normal\" en 15 ans."
        },
        {
            keys: ['qt', 'quantitative tightening', 'resserrement quantitatif'],
            answer: "<strong>Quantitative Tightening (QT)</strong> : l'inverse du QE. La banque centrale laisse expirer ses obligations sans réinvestir → réduit son bilan → retire de la liquidité. Fed a commencé en juin 2022, rythme ~95 Md$/mois puis ralenti en 2024. Effet : tensions sur les taux longs. Jamais fait à cette échelle historiquement — on navigue à vue."
        },
        {
            keys: ['mmt', 'modern monetary theory', 'theorie monetaire moderne'],
            answer: "<strong>MMT (Modern Monetary Theory)</strong> : théorie hétérodoxe soutenue par Stephanie Kelton et autres. Thèse : un État qui émet sa propre monnaie ne peut jamais faire \"défaut technique\", la seule limite aux dépenses publiques est l'inflation, pas le déficit. Influence le débat progressiste US. Critiquée : marche tant qu'il n'y a pas d'inflation. 2022 a relativisé son message."
        },
        {
            keys: ['deflation', 'spirale deflationniste'],
            answer: "<strong>Déflation</strong> : baisse généralisée et persistante des prix. L'ENNEMI ultime des banques centrales. Pourquoi ? Les consommateurs reportent leurs achats (puisque ce sera moins cher demain) → baisse de la demande → chômage → nouvelle baisse des prix. Japon en a souffert 25 ans (1990-2015). Pire qu'une inflation modérée selon la plupart des économistes."
        },
        {
            keys: ['stagflation'],
            answer: "<strong>Stagflation</strong> : combo fatal inflation + stagnation + chômage élevé. On pensait impossible avant 1973 (la courbe de Phillips disait l'inverse). Vécu dans les années 70, crainte en 2022. Cauchemar des banques centrales : serrer la vis tue la croissance, l'assouplir nourrit l'inflation. Personne ne sait bien faire."
        },
        {
            keys: ['courbe taux', 'courbe des taux', 'yield curve', 'inversion courbe taux'],
            answer: "<strong>Courbe des taux</strong> : taux obligataires selon leur maturité (1 an, 2 ans, 5, 10, 30…). Normale : pente positive (long > court). <strong>Inversion</strong> (court > long) = signal classique de récession, a précédé 8 des 9 dernières récessions US. A été inversée fortement 2022-2024 aux USA… sans récession claire. Peut-être l'indicateur est-il cassé, ou juste retardé."
        },
        {
            keys: ['spread credit', 'credit spread', 'spread high yield'],
            answer: "<strong>Spread de crédit</strong> : écart entre le rendement d'une obligation risquée et celui d'un titre sans risque. Spread qui s'élargit = stress de marché. High yield (junk bonds) typiquement à 300-500 bps au-dessus du Treasury. En 2008 : spreads >2 000 bps. Indicateur clé pour sentir la tension financière avant qu'elle n'explose."
        },
        {
            keys: ['duration', 'duration obligation', 'sensibilite obligation'],
            answer: "<strong>Duration</strong> (Macaulay) : durée de vie moyenne pondérée des flux d'une obligation. Sert à mesurer la sensibilité aux taux. Règle de pouce : une obligation de duration 10 ans perd ~10% si les taux montent de 1%. C'est EXACTEMENT ce qui a tué SVB en mars 2023 : trop de longues durées, taux qui explosent."
        },

        // ===== Entreprises célèbres =====
        {
            keys: ['apple', 'aapl'],
            answer: "<strong>Apple</strong> 🍎 : fondée en 1976 par Jobs, Wozniak, Wayne (garage californien). IPO 1980. Near-faillite en 1997, retour de Jobs, iPod 2001, iPhone 2007, et ensuite… règne. En 2026, ~3 500 Md$ de capi, plus que le PIB français. Modèle : écosystème fermé + services (30% de marge sur l'App Store). Buffett possède ~6% via Berkshire — son pari le plus rentable de tous les temps."
        },
        {
            keys: ['microsoft', 'msft'],
            answer: "<strong>Microsoft</strong> : fondée 1975 par Bill Gates et Paul Allen. Dominante dans les années 90, moquée dans les 2000 (Vista, Nokia), renaissance avec Satya Nadella (CEO depuis 2014). Pivot cloud (Azure) + IA (OpenAI 49%). Retour à la 1ère place mondiale en capitalisation plusieurs fois. Le grand gagnant corporate de la vague IA."
        },
        {
            keys: ['nvidia', 'nvda'],
            answer: "<strong>NVIDIA</strong> 🎮 : fondée 1993 par Jensen Huang à San Jose. Spécialisée GPU pour jeux vidéo, a pivoté vers les GPU pour IA (CUDA, 2007). En 2022 : 300 Md$ de capi. En 2024 : >3 000 Md$. Le plus gros x10 d'une mega-cap de l'histoire. Risque : dépendance massive à la demande IA et à TSMC (production à Taïwan)."
        },
        {
            keys: ['tesla', 'tsla'],
            answer: "<strong>Tesla</strong> ⚡ : fondée 2003 (Musk y entre en 2004). Leader mondial EV mais perte de parts de marché face aux chinois (BYD). Capi fluctuante, volatile, PER cosmique. Actifs : véhicules, énergie (Powerwall, solar), supercharger network, gigafactories. Musk = force motrice mais aussi risque central (dépendance à une personne)."
        },
        {
            keys: ['amazon', 'amzn', 'bezos'],
            answer: "<strong>Amazon</strong> 📦 : fondée 1994 par Bezos, librairie en ligne à l'origine. Aujourd'hui : e-commerce, AWS (cloud leader, ~70% du profit opérationnel), Prime Video, publicité, devices. CEO depuis 2021 : Andy Jassy. Modèle \"Day 1\" : toujours agir comme une startup. Réputation : culture interne dure."
        },
        {
            keys: ['alphabet', 'google', 'googl'],
            answer: "<strong>Alphabet / Google</strong> : fondée 1998 par Larry Page et Sergey Brin à Stanford. IPO 2004 (85 $ → 3 000 $+ en équivalent). Holding Alphabet depuis 2015 (CEO Sundar Pichai). Revenus : ~80% pub (Search, YouTube), cloud en croissance, Waymo (robotaxis). Menacée par l'IA générative — Gemini rattrape OpenAI depuis 2024."
        },
        {
            keys: ['meta', 'facebook', 'zuckerberg'],
            answer: "<strong>Meta</strong> (ex-Facebook) : fondée par Zuckerberg en 2004 à Harvard. IPO 2012 (tanked, puis rebond). Plateformes : Facebook, Instagram, WhatsApp, Messenger, Threads. Pivot \"Metaverse\" 2021 = pari de ~50 Md$ qui n'a pas (encore) payé. Pivot IA en 2024 (Llama en open source)."
        },
        {
            keys: ['berkshire', 'berkshire hathaway', 'brk'],
            answer: "<strong>Berkshire Hathaway</strong> : holding de Warren Buffett. Ancienne usine textile en ruine qu'il a rachetée en 1965. Aujourd'hui : ~1 000 Md$ de capi, cash-machine avec ~300 Md$ en liquidités en 2024. Filiales : GEICO, BNSF Railway, Dairy Queen, See's Candies, Berkshire Energy. Plus grosse position cotée : Apple. Buffett n'a jamais fait de split sur l'action A (~750 000 $ l'action)."
        },
        {
            keys: ['blackrock', 'blk'],
            answer: "<strong>BlackRock</strong> : plus gros gestionnaire d'actifs au monde (~11 000 Md$ en 2026). Fondé par Larry Fink en 1988. Célèbre pour ses ETF iShares (leader mondial) et son système Aladdin (utilisé par ~10% des actifs financiers mondiaux). Influence politique énorme — conseillers du Trésor US en 2008 et 2020. Fink publie une lettre annuelle scrutée par tous les CEO."
        },
        {
            keys: ['vanguard'],
            answer: "<strong>Vanguard</strong> : 2e plus gros gestionnaire mondial (~9 000 Md$). Fondé par Jack Bogle en 1975. Structure UNIQUE : appartient à ses fonds, donc à ses clients → pas d'actionnaires externes qui pousseraient à maximiser les frais. Résultat : frais les plus bas du marché, en moyenne 0,08%. Leader ETF aux USA avec VOO, VTI."
        },
        {
            keys: ['lvmh', 'mc', 'arnault', 'bernard arnault'],
            answer: "<strong>LVMH</strong> 👜 : Moët Hennessy Louis Vuitton. Empire du luxe de Bernard Arnault (75 marques : Louis Vuitton, Dior, Tiffany, Moët, Hennessy, Sephora, Bulgari…). IPO 1987. Capi : ~350 Md€, 1ère valeur européenne. Bernard Arnault a été l'homme le plus riche du monde en 2023. Rachat de Tiffany en 2021 pour 16 Md$."
        },
        {
            keys: ['total', 'totalenergies', 'tte'],
            answer: "<strong>TotalEnergies</strong> 🛢️ : pétrolier français, renommée en 2021 pour communiquer sur sa diversification énergétique (renouvelables, électricité). Dividende généreux (~5%). Présent dans 130 pays. Critiqué pour sa présence prolongée en Russie post-2022 et ses projets pétroliers controversés (EACOP en Ouganda). Modèle : majors \"intégrées\" (pétrole + gaz + électricité + biocarburants)."
        },
        {
            keys: ['airbus'],
            answer: "<strong>Airbus</strong> ✈️ : créé en 1970 comme consortium européen (France, Allemagne, UK, Espagne). Passé devant Boeing en 2019 sur les livraisons. Capi ~130 Md€. Dominant sur les avions de ligne (famille A320). Profite des déboires récurrents de Boeing (Max 8, Starliner, porte Alaska Airlines). Défense + espace = 25% du chiffre."
        },
        {
            keys: ['tsmc', 'taiwan semiconductor'],
            answer: "<strong>TSMC</strong> : Taiwan Semiconductor Manufacturing Company. Fondée 1987. Fabrique ~55% des puces avancées mondiales et ~90% des plus sophistiquées (5nm, 3nm). Clients : Apple, NVIDIA, AMD. Pivot géopolitique absolu : si Taïwan tombe, l'économie mondiale s'arrête. D'où l'urgence US (CHIPS Act, 52 Md$) et européenne à rapatrier la production."
        },
        {
            keys: ['saudi aramco', 'aramco'],
            answer: "<strong>Saudi Aramco</strong> : compagnie pétrolière d'État saoudienne. IPO 2019 : plus grosse de l'histoire (~29 Md$ levés, valo 2 000 Md$). Produit ~10% du pétrole mondial à un coût ridicule (~3 $/baril). Génère des profits annuels records (~160 Md$ en 2022). Pose question : à quoi ça sert pour un particulier de détenir ça face au risque climat ?"
        },
        {
            keys: ['jpmorgan', 'jpm', 'jamie dimon'],
            answer: "<strong>JPMorgan Chase</strong> : plus grande banque US, capi ~650 Md$. CEO : Jamie Dimon (depuis 2005), figure respectée mondialement. Résultat de fusions multiples (Chase, Bank One, Bear Stearns 2008, Washington Mutual 2008, First Republic 2023). Seule major US sans perdre d'argent en 2008. Lettre annuelle aux actionnaires très lue."
        },
        {
            keys: ['goldman sachs', 'gs'],
            answer: "<strong>Goldman Sachs</strong> : banque d'investissement de référence, fondée 1869 par Marcus Goldman. IPO 1999 (plus tard que prévu pour une raison). Surnom : \"The Vampire Squid\" (Rolling Stone, 2010) pour son rôle dans la crise. Culture intense. Recrute ~1% des candidats. Plusieurs SecTreasury US sont d'anciens Goldman (\"Government Sachs\")."
        },
        {
            keys: ['bnp paribas', 'bnp', 'bnpp'],
            answer: "<strong>BNP Paribas</strong> 🇫🇷 : 1ère banque française, capi ~70 Md€. Née de la fusion BNP + Paribas en 2000. Très présente en Europe (Italie, Belgique) et corporate banking international. A bien traversé 2008 mais frappée par une amende record US de 9 Md$ en 2014 (sanctions Soudan/Iran). Rendement dividende attractif."
        },

        // ===== INSA =====
        {
            keys: ['insa', 'insa lyon', 'institut national sciences appliquees'],
            answer: "L'<strong>INSA Lyon</strong> 🏛️ : Institut National des Sciences Appliquées. Fondée en 1957 par Gaston Berger et Jean Capelle. Plus grande école d'ingénieurs post-bac en France (~6 000 étudiants). Campus LyonTech-La Doua à Villeurbanne, 133 hectares. Diplôme en 5 ans après le bac (cursus intégré). 9 spécialités en 2e cycle. Devise implicite : former des ingénieurs-humanistes."
        },
        {
            keys: ['premier cycle', 'fas', 'science humanité', 'pc insa'],
            answer: "Le <strong>Premier Cycle de l'INSA Lyon</strong> : 2 ans post-bac. Tronc commun en sciences, technos, humanités, sport, langues. Classements internes à la fin de la 2e année pour choisir son département de spécialité. Ambiance spécifique : mélange de prépa et de campus US. Fun fact : à l'INSA on dit \"PC\" (Premier Cycle), pas \"prépa\"."
        },
        {
            keys: ['gm', 'genie mecanique', 'depart gm'],
            answer: "Département <strong>Génie Mécanique (GM)</strong> de l'INSA Lyon : conception mécanique, matériaux, procédés, énergétique. Débouchés : automobile, aéronautique, énergie. Un des départements historiques et importants. Labo de recherche associé : LaMCoS."
        },
        {
            keys: ['gmc', 'genie mecanique conception', 'mecanique construction'],
            answer: "Département <strong>GMC (Génie Mécanique Conception)</strong> de l'INSA Lyon : spécialisé en conception, simulation numérique, R&D mécanique. Forme des ingénieurs \"bureau d'études\"."
        },
        {
            keys: ['gi', 'genie industriel', 'depart gi'],
            answer: "Département <strong>Génie Industriel (GI)</strong> de l'INSA Lyon : supply chain, logistique, organisation industrielle, lean management. Très bien placé pour la finance opérationnelle, le conseil, l'industrie 4.0."
        },
        {
            keys: ['ge', 'genie electrique', 'depart ge'],
            answer: "Département <strong>Génie Électrique (GE)</strong> de l'INSA Lyon : électronique, automatique, énergie électrique. Débouchés : réseaux, transports, énergie, automobile. Labo associé : Ampère."
        },
        {
            keys: ['if', 'informatique insa', 'depart if'],
            answer: "Département <strong>Informatique (IF)</strong> de l'INSA Lyon : algorithmique, réseaux, systèmes, IA, sécurité, data. Très demandé au classement de 2e année. Labo associé : LIRIS. Débouchés : tech, conseil, finance quantitative, recherche."
        },
        {
            keys: ['tc', 'telecom insa', 'depart tc'],
            answer: "Département <strong>Télécommunications, Services et Usages (TC)</strong> de l'INSA Lyon : réseaux, services numériques, systèmes embarqués, IoT. Complément naturel de l'informatique, orienté usages et industrie télécom."
        },
        {
            keys: ['bs', 'biosciences insa', 'bio insa'],
            answer: "Département <strong>Biosciences (BS)</strong> de l'INSA Lyon : bioingénierie, biochimie, biotech, bio-informatique. Débouchés : pharma, agroalimentaire, santé, biotech. Labo associé : MAP."
        },
        {
            keys: ['sgm', 'science genie materiaux'],
            answer: "Département <strong>Science et Génie des Matériaux (SGM)</strong> de l'INSA Lyon : matériaux métalliques, polymères, céramiques, composites. Débouchés : aéronautique, automobile, énergie, R&D. Labo MATEIS."
        },
        {
            keys: ['gcu', 'gce', 'genie civil insa'],
            answer: "Département <strong>Génie Civil et Urbanisme (GCU)</strong> de l'INSA Lyon : BTP, structures, géotechnique, aménagement urbain, transports. Débouchés : bureaux d'études, majors du BTP, collectivités."
        },
        {
            keys: ['gen', 'genie energetique', 'genie energetique environnement'],
            answer: "Département <strong>Génie Énergétique et Environnement (GEN)</strong> de l'INSA Lyon : thermique, énergies renouvelables, bâtiment durable, environnement. Un des départements les plus en phase avec la transition écologique."
        },
        {
            keys: ['depart insa', 'specialites insa', 'departements insa', 'choix depart'],
            answer: "Les <strong>9 départements de spécialité de l'INSA Lyon</strong> (après le premier cycle) :<br>🔩 GM — Génie Mécanique<br>⚙️ GMC — GM Conception<br>🏭 GI — Génie Industriel<br>⚡ GE — Génie Électrique<br>💻 IF — Informatique<br>📶 TC — Télécoms<br>🧬 BS — Biosciences<br>🧪 SGM — Matériaux<br>🏗️ GCU — Génie Civil<br>🔥 GEN — Génie Énergétique<br><br>+ parcours internationaux (ASINSA, EURINSA, SCAN, AMERINSA, Humanités). Le classement de 2e année est très compétitif."
        },
        {
            keys: ['humanites insa', 'humanites'],
            answer: "Les <strong>Humanités à l'INSA</strong> : 400h sur 5 ans, obligatoires. Philosophie, économie, droit, langues, art. Une des marques identitaires de l'INSA : former des ingénieurs qui ne sont pas QUE techniques. Souvent critiqué par les étudiants pressés, souvent apprécié en rétrospective."
        },
        {
            keys: ['sport insa', 'sec insa', 'section sportive'],
            answer: "Le <strong>sport à l'INSA</strong> 🏃 : noté et obligatoire. ~40 disciplines. Section Sport-Études (SEC) pour les sportifs de haut niveau. Installations exceptionnelles sur le campus : gymnase, piscine, terrains, salle de musculation, pôle escalade. Un des points forts de la vie à l'INSA."
        },
        {
            keys: ['bde insa', 'bureau eleves', 'bde'],
            answer: "Le <strong>BdE (Bureau des Élèves)</strong> de l'INSA Lyon : association étudiante centrale, organise événements, soirées, WEI, intégration. Liste élue chaque année — campagnes épiques avec déguisements, memes, fake news assumées. 🎉"
        },
        {
            keys: ['24h insa', '24h', 'course 24h'],
            answer: "Les <strong>24 Heures de l'INSA</strong> 🏁 : plus gros événement étudiant de France. Course auto-moto d'endurance sur le campus, concerts gratuits (Orelsan, Vald, Booba y sont passés), centaines de bénévoles. Trois jours non-stop en avril-mai. L'ADN de l'INSA."
        },
        {
            keys: ['gala insa', 'gala'],
            answer: "Le <strong>Gala de l'INSA</strong> : soirée annuelle de prestige. Venue de l'INSEEC Finance. Dress code strict, dîner, DJ, vue sur Lyon. Un classique attendu par tous les étudiants, surtout ceux en dernière année."
        },
        {
            keys: ['la doua', 'campus doua', 'lyontech'],
            answer: "<strong>Campus LyonTech-La Doua</strong> : à Villeurbanne, partagé entre INSA, Lyon 1, CPE. 133 hectares, 25 000 étudiants. Accessible par tram T1/T4. À proximité : parc de la Tête d'Or (mythique pour les joggings), Part-Dieu (centre-ville Lyon). Pas le plus joli campus de France, mais fonctionnel et vivant."
        },
        {
            keys: ['residence insa', 'ir4', 'logement insa'],
            answer: "Les <strong>résidences INSA</strong> : 11 résidences sur campus, ~2 500 logements. Priorité aux 1re et 2e année (Premier Cycle). Loyer ~300-500 €/mois, APL possibles. Pas de l'hôtel 5 étoiles, mais la vie sur campus est incomparable. Après le PC, beaucoup déménagent à Villeurbanne ou Lyon."
        },
        {
            keys: ['restos u', 'ru', 'restaurant universitaire', 'crous resto'],
            answer: "Les <strong>RU (Restaurants Universitaires)</strong> : ~3,50 € le repas complet pour les étudiants, 1 € pour les boursiers. Olympe, Seb, Olivier de Serres (RU principal) sur le campus. Qualité variable mais imbattable niveau prix. L'Izly est la carte de paiement obligatoire."
        },
        {
            keys: ['ifa', 'insa finance association', 'ifa insa'],
            answer: "L'<strong>INSA Finance Association (IFA)</strong> 📊 : association étudiante de finance de l'INSA Lyon, créée en 2026. Mission : sensibiliser les étudiants à la finance via conférences, afterworks, tables rondes, articles, newsletter. Deux types de membres (tous gratuits) : Actif (s'implique) et Adhérent (accède au contenu). Rejoins-nous sur la section <a href=\"index.html#rejoindre\">Nous rejoindre</a>."
        },
        {
            keys: ['stage insa', 'stages ingenieur'],
            answer: "Les <strong>stages à l'INSA Lyon</strong> : stage ouvrier en 3e année (4 semaines), stage d'application en 4e année (~3 mois), <strong>PFE (Projet de Fin d'Études)</strong> en 5e année (~6 mois). Le PFE est CRUCIAL : souvent 1ère embauche. Plus de 50% des ingénieurs INSA sont embauchés dans leur entreprise de PFE."
        },
        {
            keys: ['pfe', 'projet fin etudes'],
            answer: "Le <strong>PFE (Projet de Fin d'Études)</strong> : 6 mois de stage en dernière année d'ingénieur. Rémunération : 1 100-1 600 €/mois brut généralement. Couvre 30 ECTS (un tiers de la 5e année). Conclu par un mémoire + soutenance. C'est la passerelle directe vers l'emploi. Négociation d'embauche se fait souvent dans le dernier mois."
        },

        // ===== Vie étudiante pratique =====
        {
            keys: ['crous', 'bourse crous', 'bcs'],
            answer: "La <strong>bourse du CROUS</strong> : aide basée sur les revenus parentaux. 8 échelons (0bis à 7). De ~1 500 €/an (0bis) à ~6 500 €/an (échelon 7). Demande annuelle via <a href=\"https://www.messervices.etudiant.gouv.fr\">messervices.etudiant.gouv.fr</a>, à faire entre janvier et mai. Ne pas oublier le dossier social étudiant (DSE)."
        },
        {
            keys: ['apl', 'caf apl', 'aide logement'],
            answer: "L'<strong>APL (Aide Personnalisée au Logement)</strong> 🏠 : versée par la CAF, jusqu'à ~200-300 €/mois pour un étudiant. Conditions : logement conventionné, revenus sous plafond. Simulation sur <a href=\"https://www.caf.fr\">caf.fr</a>. Demande à faire DÈS ta signature de bail — rétroactivité nulle. Les résidences CROUS sont toutes éligibles."
        },
        {
            keys: ['logement etudiant', 'chercher appart', 'appart lyon'],
            answer: "<strong>Logement étudiant à Lyon</strong> :<br>🏠 CROUS : ~300 €/mois (peu de dispos)<br>🏠 Résidences privées (Studea, Estudines) : 500-650 €/mois<br>🏠 Colocation Villeurbanne : ~400-500 € + charges<br>🏠 Studio Lyon 7 / Lyon 3 : 500-700 €<br>🏠 Lyon 2 / 5 (vieux Lyon) : 600-800 €<br><br>Sites : Leboncoin, Studapart, SeLoger, La Carte des Colocs. Priorité : proche de T1/T4 si à l'INSA, métro si centre."
        },
        {
            keys: ['izly', 'carte izly'],
            answer: "<strong>Izly</strong> 💳 : système de paiement des RU et cafétérias CROUS. Obligatoire. Rechargeable par carte bancaire ou virement. Appli mobile pour payer sans sortir la carte. Sans Izly, pas de repas à 3,50 €."
        },
        {
            keys: ['tcl', 'transports lyon', 'metro lyon', 'tram lyon'],
            answer: "<strong>TCL (Transports en Commun Lyonnais)</strong> 🚇 : 4 métros, 7 trams, 130+ bus. Abonnement annuel étudiant : ~360 €/an (30 €/mois) pour les - 28 ans. La Métropole rembourse la moitié via le forfait mobilité. T1 et T4 = indispensables pour l'INSA. Vélo'v : bonus pour les petits trajets."
        },
        {
            keys: ['velo lyon', 'velov'],
            answer: "<strong>Vélo'v</strong> 🚴 : libre-service de vélos à Lyon. Abonnement étudiant : ~20 €/an. 428 stations. Pratique pour les petits trajets Villeurbanne ↔ Lyon. Attention : stations saturées aux heures de pointe (toujours vérifier la dispo via l'appli)."
        },
        {
            keys: ['securite sociale etudiante', 'lmde', 'smerra'],
            answer: "<strong>Sécurité sociale étudiante</strong> : depuis 2019, les étudiants sont rattachés au régime général (plus de LMDE/SMERRA). Gratuit. Automatique via inscription à l'université/école. <strong>Complémentaire santé</strong> par contre recommandée : 10-30 €/mois chez Heyme, SMERRA, LMDE, ou via la mutuelle des parents (possible jusqu'à 28 ans)."
        },
        {
            keys: ['job etudiant', 'trouver job', 'petit boulot'],
            answer: "<strong>Job étudiant</strong> : baby-sitting (12-15 €/h), soutien scolaire (15-20 €/h), restaurant / bar (~11-13 €/h), livreur (Uber Eats à ~10-15 €/h mais c'est moins glamour). Max 964h/an pour rester fiscalement à charge des parents. Plateformes : Jobaviz (CROUS), Indeed, Student Job, contacts INSA."
        },
        {
            keys: ['alternance', 'apprentissage', 'contrat apprentissage'],
            answer: "L'<strong>alternance</strong> 🎯 : combo études + entreprise (3 semaines / 1 semaine, ou 50/50). Rémunération : 43-100% du SMIC selon âge + année. Avantage massif : expérience pro + 0 frais scolaires (l'entreprise paie). Inconvénient : rythme ultra-intense. À l'INSA, surtout sur les masters et filières spécifiques (FAS)."
        },
        {
            keys: ['csg', 'prelevements sociaux', 'ps 17 2'],
            answer: "<strong>CSG + CRDS + prélèvements sociaux</strong> = <strong>17,2%</strong> sur tes gains financiers en 2026 (hors livrets réglementés). CSG : 9,2%, CRDS : 0,5%, Prélèvement de solidarité : 7,5%. Oui, c'est beaucoup. Mais c'est la même chose pour tout le monde. À combiner avec la flat tax ou l'IR selon ton placement."
        },
        {
            keys: ['tva', 'taxe valeur ajoutee'],
            answer: "La <strong>TVA</strong> : 20% standard en France, 10% restauration/transport, 5,5% alimentation/livre, 2,1% médicaments remboursés. Inventée en France en 1954 (Maurice Lauré, fonctionnaire au ministère). Aujourd'hui adoptée par ~170 pays. Rapporte ~190 Md€/an à l'État français — première recette fiscale."
        },
        {
            keys: ['ifi', 'impot fortune immobiliere'],
            answer: "L'<strong>IFI (Impôt sur la Fortune Immobilière)</strong> : remplace l'ISF depuis 2018. Taxe le patrimoine immobilier net > 1,3 M€. Barème progressif 0,5% à 1,5%. Concerne ~150 000 foyers. Ne touche PAS l'épargne financière (actions, obligations, ETF). Pas le souci d'un étudiant moyen."
        },
        {
            keys: ['taxe habitation', 'taxe fonciere', 'impots locaux'],
            answer: "<strong>Impôts locaux</strong> :<br>• <strong>Taxe d'habitation</strong> : SUPPRIMÉE pour les résidences principales depuis 2023. Reste due sur résidences secondaires et logements vacants.<br>• <strong>Taxe foncière</strong> : payée par les PROPRIÉTAIRES. En forte hausse depuis 2020 (+15-30% dans certaines communes). Étudiant locataire = pas concerné."
        },
        {
            keys: ['prime activite'],
            answer: "La <strong>Prime d'activité</strong> : versée par la CAF aux travailleurs à revenus modestes. Étudiant salarié > 78% du SMIC net peut y être éligible. Montant variable. Simulation sur caf.fr. Souvent oubliée par les étudiants qui bossent à mi-temps — perte sèche."
        },

        // ===== Concepts finance avancés (complément) =====
        {
            keys: ['marge securite', 'margin safety', 'graham safety'],
            answer: "La <strong>marge de sécurité</strong> (Graham, 1934) : n'acheter un titre que si son prix est significativement INFÉRIEUR à sa valeur intrinsèque estimée. Si tu estimes qu'une action vaut 100 €, ne paie que 60 €. L'écart de 40% te protège des erreurs d'analyse. Concept fondamental du value investing. Buffett : \"Rule n°1 : never lose money. Rule n°2 : never forget rule n°1.\""
        },
        {
            keys: ['moat', 'avantage competitif', 'douves'],
            answer: "<strong>Economic Moat</strong> 🏰 (Buffett) : avantage concurrentiel durable d'une entreprise. Types :<br>• <strong>Network effect</strong> : plus il y a d'utilisateurs, plus c'est utile (Meta, Uber)<br>• <strong>Coûts de switching</strong> : trop cher de changer (SAP, Microsoft)<br>• <strong>Brand</strong> : marque premium (LVMH, Apple)<br>• <strong>Scale</strong> : économies d'échelle (Amazon, Walmart)<br>• <strong>Coût de production</strong> bas (Aramco)<br><br>Un bon investisseur cherche des entreprises avec des douves LARGES et durables."
        },
        {
            keys: ['ebitda', 'earnings before'],
            answer: "<strong>EBITDA</strong> : Earnings Before Interest, Taxes, Depreciation, Amortization. Mesure la rentabilité opérationnelle avant structure financière et comptable. Utile pour comparer des boîtes à endettements différents. CRITIQUE : Warren Buffett déteste l'EBITDA : \"La dépréciation, c'est du vrai coût. Si tu l'ignores, tu te mens.\" Comme toujours, un seul ratio ne dit pas tout."
        },
        {
            keys: ['fcf', 'free cash flow', 'flux tresorerie libre'],
            answer: "<strong>Free Cash Flow (FCF)</strong> 💰 : cash généré après investissements nécessaires au maintien du business. Le vrai \"profit\" pour un investisseur : c'est ce qu'on peut redistribuer en dividendes, rachats, ou réinvestir. <strong>Plus dur à maquiller que le bénéfice comptable</strong>. Métrique reine des value investors. Apple FCF : ~110 Md$/an."
        },
        {
            keys: ['dcf', 'discounted cash flow', 'actualisation flux'],
            answer: "<strong>DCF (Discounted Cash Flow)</strong> : méthode de valorisation fondamentale. Tu projettes les cash flows futurs d'une entreprise, tu les actualises à un taux de risque (WACC), tu additionnes. Théoriquement parfait. Pratiquement : sensible à TOUT (taux, taux de croissance terminale, marges). Résultat : tu peux \"prouver\" n'importe quelle valeur en ajustant 2 paramètres. Utile mais humble."
        },
        {
            keys: ['wacc', 'cout moyen pondere capital'],
            answer: "<strong>WACC (Weighted Average Cost of Capital)</strong> : coût moyen pondéré du capital = coût de la dette × part de la dette + coût des fonds propres × part des fonds propres. Utilisé pour actualiser les DCF. Plus le WACC est bas, plus l'entreprise peut investir de manière rentable. Grosse boîte US à crédit AAA : WACC ~7-8%. Startup risquée : 15-20%+."
        },
        {
            keys: ['hft', 'high frequency trading', 'trading haute frequence'],
            answer: "<strong>HFT (High-Frequency Trading)</strong> ⚡ : trading automatisé en microsecondes, arbitrage entre marchés. Entreprises clés : Citadel, Virtu, Jump Trading, Two Sigma. Représente ~50% du volume US. Profits infimes par trade, multipliés par des millions. Course à la vitesse absurde : câbles fibre optique droits, micro-ondes, relais satellites. Livre à lire : \"Flash Boys\" (Michael Lewis)."
        },
        {
            keys: ['dark pool', 'dark pools', 'marche off'],
            answer: "<strong>Dark pools</strong> 🕶️ : plateformes de trading privées où les ordres ne sont pas visibles publiquement. Utilisées par les gros investisseurs pour exécuter des blocs sans faire bouger le marché. Représentent ~40% du volume US. Critiquées pour opacité mais régulées depuis MiFID II en Europe. Environ 50 dark pools actifs aux USA."
        },
        {
            keys: ['market maker', 'teneur marche'],
            answer: "<strong>Market Makers</strong> : teneurs de marché. Ils affichent en permanence un prix d'achat et un prix de vente (spread). Leur profit = le spread × volume. Essentiels pour la liquidité. Exemples : Citadel Securities, Virtu, Flow Traders. Depuis 2020, ils font ~30-50 Md$/an de profits combinés."
        },
        {
            keys: ['spread bid ask', 'fourchette prix'],
            answer: "Le <strong>spread bid-ask</strong> : écart entre le prix d'achat (bid) et de vente (ask). Sur une action liquide (Apple) : 0,01 $. Sur une micro-cap illiquide : parfois 3-5%. C'est un coût CACHÉ d'exécution. Un ETF world ? Spread ~0,02-0,05%. Une action française mid-cap ? 0,1-0,3%. La liquidité a un prix."
        },
        {
            keys: ['carry trade'],
            answer: "<strong>Carry Trade</strong> : emprunter dans une devise à taux bas (ex : yen) pour investir dans une devise à taux élevé (ex : peso mexicain). Profit = différentiel de taux. Fonctionne… jusqu'à un \"unwind\" brutal : en août 2024, le yen s'apprécie +10% en une semaine, déclenchant une purge mondiale des carry trades. Stratégie \"ramasse des centimes devant un bulldozer.\""
        },
        {
            keys: ['hedging', 'couverture', 'hedger'],
            answer: "Le <strong>hedging</strong> (couverture) : protéger un portefeuille contre un risque via un instrument inverse. Exemples : acheter un put option sur un indice si tu détiens des actions, utiliser des futures pour figer un taux de change si tu as une créance en USD. Pratique institutionnelle. Pour un particulier avec portefeuille diversifié, souvent inutile (et coûteux)."
        },
        {
            keys: ['rendement reel', 'rendement nominal', 'inflation reel'],
            answer: "<strong>Rendement nominal vs réel</strong> : nominal = chiffre brut affiché (ex : 8%/an). Réel = nominal - inflation. Si ton ETF fait 8% et que l'inflation est à 3% → rendement réel = 5%. Les actions US ont fait ~10% nominal / ~7% réel sur 100 ans. C'est le RÉEL qui compte pour ton pouvoir d'achat futur."
        },
        {
            keys: ['alpha', 'genere alpha', 'surperformance'],
            answer: "L'<strong>alpha</strong> : surperformance d'un gérant par rapport à son benchmark, ajustée du risque. Alpha +2% = le gérant a fait 2% de plus que l'indice à risque équivalent. Très rare sur longue période : ~15% des fonds actifs. Les VRAIS stars (Simons, Dalio, Buffett) ont des alphas positifs pendant des décennies — ils sont quelques dizaines dans l'histoire."
        },
        {
            keys: ['beta', 'beta action', 'sensibilite marche'],
            answer: "Le <strong>beta</strong> : sensibilité d'une action au marché. Beta 1 = bouge comme le marché. Beta 1,5 = amplifie de 50% (tech growth typique). Beta 0,5 = amortit (utilities, conso défensive). Beta peut être négatif (rare, souvent l'or). Attention : le beta historique n'est pas forcément le beta futur — les corrélations évoluent."
        },
        {
            keys: ['contrarian', 'contre courant'],
            answer: "<strong>Investissement contrarian</strong> : acheter ce que tout le monde déteste, vendre ce que tout le monde adore. Buffett : \"Be fearful when others are greedy, and greedy when others are fearful.\" Exemples : acheter les banques en mars 2009, vendre la tech en 1999. Dur psychologiquement. Statistiquement, marcherait pas mal — mais être contrarian à tort, c'est ruineux."
        },
        {
            keys: ['growth stock', 'action growth'],
            answer: "<strong>Growth stocks</strong> : actions de croissance. Fortes espérances de progression du CA, faible ou zéro dividende, PER élevé. Exemples : NVIDIA, Tesla (passées), Shopify, Spotify. Risque : si la croissance déçoit, chute brutale (voir PayPal, Zoom post-COVID). Style qui domine depuis 2010, challengé par value depuis 2022."
        },
        {
            keys: ['value stock', 'action value'],
            answer: "<strong>Value stocks</strong> : actions \"décotées\" par le marché. Bas PER, bas PBR, forte génération de cash. Souvent des secteurs ennuyeux : banques, énergie, utilities. Stratégie popularisée par Graham et Buffett. Sous-performance 2010-2021, retour en 2022-2024. Cycles : value et growth alternent dans le leadership, au gré des taux et du sentiment."
        },

        // ===== Divers / actualité / culture =====
        {
            keys: ['bnpl', 'paiement differre', 'klarna', 'pay later'],
            answer: "<strong>BNPL (Buy Now, Pay Later)</strong> : paiement en 3-4 fois sans frais (Klarna, Alma, Oney, Affirm). Explosion post-COVID. Pratique pour l'utilisateur, mais piège pour les budgets fragiles (on accumule les dettes petites). Régulation UE en 2025 pour classer ça comme crédit à la consommation (scoring, info transparente). Pas gratuit : les commerçants paient ~2-4% → répercuté sur les prix."
        },
        {
            keys: ['neobanque', 'revolut', 'n26', 'qonto'],
            answer: "Les <strong>néobanques</strong> 📱 :<br>🟦 <strong>Revolut</strong> : multi-devise, crypto, trading. ~60M clients.<br>🟨 <strong>N26</strong> : simplicité, cartes virtuelles. Basée à Berlin.<br>🟪 <strong>Boursobank</strong> (ex-Boursorama) : hybride banque en ligne / néo.<br>🟥 <strong>Qonto</strong> : business / freelance.<br><br>Pour un étudiant, Revolut ou Boursobank = très bonne base, + PEA ailleurs (Bourse Direct, Fortuneo, Trade Republic)."
        },
        {
            keys: ['wise', 'transferwise', 'transfert international'],
            answer: "<strong>Wise</strong> (ex-TransferWise) : meilleure option pour les transferts internationaux. Taux de change réel + frais transparents (~0,5%), vs 3-5% via une banque classique. IBAN multi-devises disponibles. Étudiant en Erasmus, en stage à l'étranger, ou achat en devise étrangère : indispensable."
        },
        {
            keys: ['monnaie locale', 'monnaie complementaire', 'sol violette'],
            answer: "Les <strong>monnaies locales</strong> (Sol-Violette à Toulouse, Eusko à Bayonne, Gonette à Lyon…) : monnaies complémentaires qui circulent dans un réseau de commerces locaux. Parité 1=1 avec l'euro. Objectif : soutenir l'économie locale et durable. Pas un investissement — un geste politique."
        },
        {
            keys: ['finance islamique', 'charia finance', 'sukuk'],
            answer: "La <strong>finance islamique</strong> : interdit l'intérêt (riba), la spéculation pure (maysir), et les secteurs haram (alcool, porc, jeux, armes). Instruments : sukuk (obligations basées sur actifs réels), mourabaha (vente avec marge), ijara (leasing). ~4 000 Md$ d'actifs mondiaux. Pas marginal : Malaisie, pays du Golfe, Londres sont des hubs."
        },
        {
            keys: ['dette mondiale', 'endettement mondial'],
            answer: "La <strong>dette mondiale</strong> (publique + privée) en 2025 : ~315 000 Md$, soit ~330% du PIB mondial. Record absolu. Répartie à peu près également entre États, entreprises non financières, ménages, et finances. Soutenable ? Tant que les taux restent gérables. Mais toute remontée déclenche des stress (voir 2022-2023)."
        },
        {
            keys: ['demographie', 'vieillissement', 'pyramide ages'],
            answer: "La <strong>démographie</strong> comme driver économique : Japon vieillissant (28% > 65 ans) = croissance faible. Chine en déclin démographique depuis 2022. Inde, Afrique en pleine croissance. Thèse de certains analystes : la déflation japonaise depuis 1990 est largement démographique. Applicable à l'Europe dans 20-30 ans ? Débat ouvert."
        },
        {
            keys: ['transition energetique', 'transition ecologique', 'esg investment'],
            answer: "La <strong>transition énergétique</strong> comme thèse d'investissement : renouvelables (solaire, éolien), réseau électrique, stockage (batteries), hydrogène, nucléaire, véhicules électriques, efficacité énergétique. Investissements mondiaux : ~1 800 Md$/an en 2024. L'IRA US (Inflation Reduction Act, 2022) = 400 Md$ sur 10 ans. Secteur volatil mais structurel."
        },
        {
            keys: ['intelligence artificielle finance', 'ia finance', 'ai trading'],
            answer: "L'<strong>IA dans la finance</strong> 🤖 : <br>• Trading algo (déjà massif depuis 20 ans)<br>• Credit scoring (big data vs FICO traditionnel)<br>• Détection de fraude (banques, paiement)<br>• Wealth management (robo-advisors : Nalo, Yomoni)<br>• Recherche action (résumé, scraping, signaux)<br><br>Limites : IA surperforme sur les patterns répétitifs, pas sur les événements non-stationnaires (crises, innovations). Et : le risque de crash algo (flash crash 2010) augmente."
        },
        {
            keys: ['greenwashing', 'ecoblanchiment'],
            answer: "Le <strong>greenwashing</strong> 🌿 : communication marketing \"verte\" qui ne correspond pas à la réalité. BlackRock accusé d'avoir vendu pour ESG des fonds contenant TotalEnergies. Depuis SFDR (2021) et CSRD (2024), les règles UE se durcissent mais les contournements restent. Règle : ne pas faire confiance aux labels, lire les holdings."
        },
        {
            keys: ['chatgpt finance', 'llm finance', 'ia generative'],
            answer: "Les <strong>IA génératives en finance</strong> : aide à l'analyse (résumer des rapports 10-K, benchmarks sectoriels), rédaction, coding quant. Limites actuelles : hallucinations, données pas temps réel, pas d'arbitrage sur le futur. Utilisées par : Morgan Stanley (assistant à 15 000 conseillers), Bloomberg GPT, hedge funds (quant). Mais la perf alpha ne vient pas de ChatGPT grand public — elle vient des données privées."
        },
        {
            keys: ['tokenisation', 'titres tokenises', 'real world assets'],
            answer: "La <strong>tokenisation des actifs réels</strong> : mettre des obligations, de l'immobilier, de l'art, sur blockchain. BlackRock a lancé BUIDL (2024), fonds tokenisé en Treasuries US. Larry Fink : \"Chaque action et obligation sera tokenisée.\" Prématuré mais tendance structurelle. Promesse : règlement instantané 24/7, fractionnement, transparence."
        },
        {
            keys: ['dividende aristocrat', 'dividend aristocrat'],
            answer: "Les <strong>Dividend Aristocrats</strong> 👑 : entreprises du S&P 500 qui ont augmenté leur dividende pendant 25 années consécutives. ~65 boîtes. Exemples : Coca-Cola, Johnson & Johnson, Procter & Gamble, McDonald's. Performance historiquement similaire à l'indice mais avec moindre volatilité. Stratégie favorite des investisseurs \"income\"."
        },
        {
            keys: ['buyback', 'rachat actions', 'stock buyback'],
            answer: "Le <strong>rachat d'actions (buyback)</strong> : l'entreprise rachète ses propres actions sur le marché → réduction du nombre d'actions → le BPA monte mécaniquement. Plus efficient fiscalement que le dividende (pas d'imposition immédiate). Critique : peut masquer un manque d'opportunités d'investissement, ou gonfler artificiellement les bonus des dirigeants (alignés sur le BPA). Apple en a fait pour ~600 Md$ depuis 2013."
        },
        {
            keys: ['pru', 'prix revient unitaire', 'prix moyen achat'],
            answer: "Le <strong>PRU (Prix de Revient Unitaire)</strong> : prix moyen pondéré de tes achats. Tu achètes 10 ETF à 100 € puis 10 à 80 €. PRU = 90 €. Utile pour calculer une plus-value latente, mais ATTENTION au biais comportemental de l'ancrage : ne refuse pas de vendre simplement parce que ton PRU est au-dessus du cours actuel. La décision doit se baser sur le FUTUR, pas sur tes achats passés."
        },
        {
            keys: ['minage crypto', 'mining bitcoin', 'proof of work'],
            answer: "Le <strong>minage Bitcoin</strong> ⛏️ : des ordinateurs (ASIC) résolvent des puzzles cryptographiques pour valider les blocs et obtenir du BTC en récompense. Consommation : ~150 TWh/an, ~0,5% de l'électricité mondiale. Comparable à la Norvège entière. Alternative : Proof of Stake (Ethereum depuis 2022) = ~99,9% moins gourmand. Débat écologique constant."
        },
        {
            keys: ['halving', 'halving bitcoin'],
            answer: "Le <strong>halving Bitcoin</strong> : tous les 4 ans environ (210 000 blocs), la récompense du minage est divisée par 2. Récompense : 50 BTC (2009) → 25 (2012) → 12,5 (2016) → 6,25 (2020) → 3,125 (avril 2024) → 1,5625 (2028). Dernière étape : vers 2140, plus de minage. Corrélé historiquement à des hausses de prix 12-18 mois après… jusqu'à ce que ça ne corrèle plus."
        },
        {
            keys: ['defi', 'finance decentralisee'],
            answer: "La <strong>DeFi (Decentralized Finance)</strong> : protocoles financiers sur blockchain (principalement Ethereum). Prêts (Aave), échanges (Uniswap), stablecoins (Dai), dérivés (dYdX). Pic : 180 Md$ de TVL fin 2021. Aujourd'hui : ~80-100 Md$. Promesse : finance ouverte, transparente, 24/7. Risque : smart contracts hackés, rug pulls (~5 Md$ perdus en 2022). Sophistiqué, spéculatif."
        },
        {
            keys: ['etf bitcoin spot', 'etf btc spot', 'etf crypto'],
            answer: "Les <strong>ETF Bitcoin Spot</strong> : approuvés par la SEC le 10 janvier 2024. Acteurs : BlackRock (IBIT), Fidelity (FBTC), ARK 21Shares, Bitwise. Flux record : 50+ Md$ absorbés en un an. Révolution d'accès : tu as du BTC dans ton PEA ? Non, pas encore — mais dans ton CTO oui. Gamechanger pour la légitimation institutionnelle du Bitcoin."
        },
        {
            keys: ['big mac index', 'big mac'],
            answer: "Le <strong>Big Mac Index</strong> 🍔 : créé par The Economist en 1986. Compare le prix d'un Big Mac entre pays pour juger sur/sous-valorisation des devises. Pédagogique, pas scientifique. France : ~5,50 €. Suisse : ~7 €. USA : ~5,50 $. Venezuela : variable selon l'hyperinflation. Plus élégant qu'un modèle économétrique de 200 pages."
        },
        {
            keys: ['dogecoin', 'meme coin', 'shiba inu'],
            answer: "Les <strong>memecoins</strong> 🐶 : cryptos créées pour le fun (Dogecoin 2013), sans utilité technique mais avec culture Internet. Pic Dogecoin : 0,74 $ en 2021 (Musk effect). Shiba Inu : un investissement de 10 $ fin 2020 a fait ~800 000 $ fin 2021. Ensuite -99% bien sûr. À prendre avec des pincettes, et jamais avec l'argent du loyer."
        },
        {
            keys: ['zinzin', 'investisseur institutionnel'],
            answer: "<strong>Zinzins = investisseurs institutionnels</strong> : banques, assureurs, fonds de pension, gestionnaires, hedge funds, family offices. Représentent ~80% des volumes sur les marchés développés. Face à eux, le particulier joue en D3. Mais ça a un avantage : les zinzins doivent suivre des mandats stricts, le particulier a la flexibilité."
        },
        {
            keys: ['prop shop', 'trading pour compte propre', 'proprietary trading'],
            answer: "Les <strong>prop shops</strong> (proprietary trading firms) : firmes de trading avec l'argent de la maison. Jane Street, Jump Trading, Tower Research, Flow Traders. Recrutent quant/dev top niveau. Salaires : 300 k€+ dès bac+5. Environnement ultra-compétitif. Pour un INSA IF ou GM avec mindset maths/stats = une voie redoutable."
        },
        {
            keys: ['private banking', 'banque privee', 'wealth management'],
            answer: "La <strong>Banque privée / Wealth management</strong> : service dédié aux clients à patrimoine élevé (>500k€ en général, >3M€ pour le vrai private banking). Acteurs : UBS, JPMorgan Private Bank, Goldman PWM, BNP Paribas Wealth. Frais 0,5-1%/an. Service : allocation, structuration juridique, succession, crédit Lombard. Pas avant que ton PEA soit plein."
        },

        // ===== Métriques macro & actualité =====
        {
            keys: ['cpi', 'indice prix consommation', 'inflation usa'],
            answer: "Le <strong>CPI (Consumer Price Index)</strong> : indice officiel de l'inflation aux USA, publié mensuellement par le Bureau of Labor Statistics. Variante <strong>Core CPI</strong> : hors énergie et alimentation (plus volatils). La Fed préfère le <strong>PCE</strong> (Personal Consumption Expenditures) pour ses décisions de taux. Une surprise sur le CPI fait plus bouger les marchés que n'importe quelle annonce d'entreprise."
        },
        {
            keys: ['ism', 'pmi', 'indice pmi'],
            answer: "Le <strong>PMI (Purchasing Managers Index)</strong> / <strong>ISM</strong> aux USA : indicateurs avancés de l'activité économique, basés sur enquêtes auprès des directeurs d'achats. > 50 = expansion, < 50 = contraction. Publiés mensuellement. Plus réactifs que le PIB, scrutés par les marchés. PMI manufacturier USA < 47 pendant 18+ mois (2022-2024) — record de durée hors récession officielle."
        },
        {
            keys: ['nfp', 'non farm payrolls', 'emploi usa'],
            answer: "Les <strong>NFP (Non-Farm Payrolls)</strong> : créations d'emplois US hors agriculture. Publiés le 1er vendredi du mois, 14h30 Paris. Attendus fébrilement : une surprise de ±50k emplois peut bouger le S&P de 1%+. Inclut taux de chômage, salaires horaires. \"Good news is bad news\" parfois : emploi trop fort → Fed hawkish → actions baissent."
        },
        {
            keys: ['t bill', 'treasury bill', 'obligation etat usa'],
            answer: "Les <strong>T-Bills / Treasuries</strong> 🇺🇸 : obligations du Trésor américain. Bills (court terme < 1 an), Notes (2-10 ans), Bonds (20-30 ans). Considérées comme l'actif \"sans risque\" de référence mondiale. Rendement du 10 ans = taux directeur implicite des marchés. Chinois et Japonais sont les plus gros détenteurs étrangers (~800 Md$ chacun). Baisse depuis 2022."
        },
        {
            keys: ['oat', 'obligation francaise', 'bund allemand'],
            answer: "<strong>OAT / Bund</strong> : obligations d'État français (OAT = Obligations Assimilables du Trésor) et allemandes. Le <strong>spread OAT-Bund</strong> = écart entre leurs taux, indicateur du stress politique français. En 2012 : 200 bps. En 2024 (post-dissolution) : 80 bps (niveau le plus élevé depuis 2012). En 2025 : ~70-85 bps. Surveillance rapprochée des marchés."
        },
        {
            keys: ['forward guidance', 'guidance fed'],
            answer: "La <strong>Forward Guidance</strong> : communication par la banque centrale de ses INTENTIONS futures, pour ancrer les anticipations. Pratique popularisée post-2008. Exemple : \"Les taux resteront bas jusqu'à ce que l'inflation dépasse 2%.\" Double tranchant : si la Fed se dédit, perte de crédibilité. Powell plus prudent depuis 2022 : préfère \"data dependent\"."
        },
        {
            keys: ['reserves change', 'reserves devises', 'reserve china'],
            answer: "<strong>Réserves de change</strong> : devises étrangères + or détenus par une banque centrale. Top 5 mondiaux :<br>🇨🇳 Chine : ~3 200 Md$<br>🇯🇵 Japon : ~1 200 Md$<br>🇨🇭 Suisse : ~800 Md$<br>🇮🇳 Inde : ~700 Md$<br>🇷🇺 Russie : ~600 Md$ (dont ~300 Md$ gelés par l'Occident depuis 2022)<br><br>Sert à défendre sa monnaie en cas de crise, ou à absorber des chocs extérieurs."
        },
        {
            keys: ['dette usa', 'debt ceiling', 'plafond dette us'],
            answer: "La <strong>dette publique US</strong> : ~35 000 Md$ en 2025, 123% du PIB. Le <strong>plafond de la dette</strong> doit être relevé par le Congrès périodiquement — saga politique récurrente, source de volatilité marchés. Si jamais non relevé : défaut technique → catastrophe mondiale. N'est jamais arrivé… mais plusieurs frayeurs (2011, 2013, 2023)."
        },
        {
            keys: ['dedollarisation', 'petroyuan', 'fin dollar'],
            answer: "La <strong>dédollarisation</strong> : tendance de certains pays à réduire leur exposition au dollar (Chine, Russie, Brésil, Arabie Saoudite). Paiements en yuan, nouvelle monnaie BRICS discutée. Réalité nuancée : le dollar représente encore ~58% des réserves mondiales (vs 70% en 2000) et ~88% des transactions forex. Déclin progressif, pas effondrement. Le privilège exorbitant a la peau dure."
        },

        // ===== Style de vie / vie quotidienne =====
        {
            keys: ['fire', 'financial independence', 'retraite anticipee'],
            answer: "Le mouvement <strong>FIRE (Financial Independence, Retire Early)</strong> 🔥 : viser l'indépendance financière pour arrêter de travailler jeune. Formule : accumuler ~25× tes dépenses annuelles, placer sur ETF World. \"Safe withdrawal rate\" = 4%/an. Variantes : leanFIRE (frugal), fatFIRE (confort), coastFIRE (assez pour laisser composer). Critique : pas applicable à tous les revenus."
        },
        {
            keys: ['minimalisme', 'sobriete'],
            answer: "Le <strong>minimalisme financier</strong> : consommer moins, épargner plus. Pas par austérité mais par choix. Compatible avec FIRE. Argument : au-delà d'un certain confort (~70k€/an pour une famille), plus de revenus n'apportent pas plus de bonheur (étude Kahneman). Moins d'achats → plus d'épargne → plus de liberté future."
        },
        {
            keys: ['amp achat immobilier', 'primo accedant', 'achat premier bien', 'acheter residence principale'],
            answer: "<strong>Achat de ta résidence principale</strong> :<br>🏠 Apport : idéalement 10-20% du prix<br>💰 Pret à taux zéro (PTZ) : aide jusqu'à 40% sous conditions<br>📋 Frais de notaire : 7-8% dans l'ancien, 2-3% dans le neuf<br>🎯 Avantage : plus-value exonérée d'impôt (résidence principale)<br>📊 Rentabilité vs location : dépend du lieu, de la durée, de l'hypothèse de hausse des prix<br><br>Règle : n'achète pas si tu risques de revendre < 7 ans (frais non amortis)."
        },
        {
            keys: ['courses moins cher', 'cuisiner budget', 'budget nourriture'],
            answer: "<strong>Cuisiner pas cher</strong> étudiant :<br>• Lidl / Action : prix cassés<br>• Mettre au congélateur (saucisses, viande en promo)<br>• Produits de saison (légumes)<br>• Batch cooking dimanche pour la semaine<br>• Sacs anti-gaspi (Too Good To Go)<br>• Banques alimentaires si vraiment serré (CROUS + banques locales)<br><br>Objectif réaliste : 150-250 €/mois pour un étudiant qui cuisine un minimum."
        },
        {
            keys: ['coliving', 'habitat intergenerationnel', 'colocation solidaire'],
            answer: "Le <strong>coliving / habitat intergénérationnel</strong> : plateformes comme Ensemble2Générations mettent en relation étudiants et seniors. Logement gratuit ou à très bas coût contre présence/aide. Grosse tendance dans les grandes villes. Variantes : Cohabilis, Colette, 1toit2générations. Win-win contre la solitude et les loyers."
        },
        {
            keys: ['depense compulsive', 'shopping addict', 'addiction depense'],
            answer: "Gérer les <strong>dépenses compulsives</strong> : appli de suivi (Bankin', Linxo, YNAB), règle des 24h (laisser 24h avant chaque achat > 50 €), retirer les cartes enregistrées des sites, désabonnements newsletters marketing. Le vrai ennemi du patrimoine étudiant : pas le manque de revenus, mais les 15 € × 30 fois/mois qui disparaissent sans trace."
        },
        {
            keys: ['assurance auto', 'assurance voiture jeune'],
            answer: "<strong>Assurance auto jeune conducteur</strong> : surprime jusqu'à +100% la 1ère année. Astuce : <strong>conduite accompagnée</strong> fait baisser la surprime, et conducteur secondaire sur l'assurance parents aide aussi. Comparateurs : LesFurets, LeLynx, Assurland. Prix typique JC : 800-1500 €/an pour une petite citadine. La vraie question : as-tu vraiment besoin d'une voiture à Lyon ?"
        },
        {
            keys: ['vinted', 'leboncoin', 'occasion revente'],
            answer: "<strong>Économie de seconde main</strong> ♻️ : Vinted (textile), Leboncoin (tout), Vestiaire Collective (luxe), Back Market (électronique reconditionné). Avantages : baisse de 30-70% vs neuf + impact carbone divisé. Pour un étudiant qui équipe son appart, c'est non négociable. Bonus : ton ancien smartphone peut te rapporter 200-500 €."
        },
        {
            keys: ['stage remunere', 'remuneration stage', 'gratification stage'],
            answer: "<strong>Rémunération des stages</strong> : minimum légal 4,35 €/h (2026) dès 2 mois consécutifs. Pour 35h/semaine : ~660 €/mois. Nombreuses entreprises payent plus (800-1500 €/mois), surtout en finance / tech / conseil. PFE dans un grand groupe : 1200-1600 €/mois. Exonérée d'impôt et de charges pour le stagiaire jusqu'au plafond."
        },
        {
            keys: ['salaire ingenieur', 'salaire sortie insa', 'salaire jeune ingenieur'],
            answer: "<strong>Salaire sortie INSA</strong> (estimations 2026) :<br>📊 Médiane premier poste : ~42-45 k€ brut/an<br>🏆 Top secteurs : finance (55-70 k€), conseil (48-55 k€), tech (45-55 k€), pharma (42-48 k€)<br>🏭 Bas de fourchette : BTP, industrie classique (38-42 k€)<br>🌍 Paris prime : +5-8 k€ vs province<br>🌎 À l'étranger (Londres, Luxembourg, Suisse, USA) : souvent +30-100%<br><br>Après 5 ans d'expérience : 60-90 k€ en moyenne, bien plus pour finance/tech."
        },

        // ===== Finance comportementale / biais (complément) =====
        {
            keys: ['biais ancrage', 'ancrage prix'],
            answer: "Le <strong>biais d'ancrage</strong> : on s'accroche à un chiffre arbitraire. \"Mon action est à -30% vs mon prix d'achat, j'attends de revenir à l'équilibre\" → ton PRU n'a AUCUNE valeur analytique, le marché ne sait pas à quel prix tu as acheté. Seule question : cette action est-elle attractive AUJOURD'HUI ?"
        },
        {
            keys: ['biais confirmation', 'confirmation bias'],
            answer: "Le <strong>biais de confirmation</strong> : on cherche et retient l'info qui confirme ce qu'on croit déjà. En bourse : tu crois que Tesla va monter → tu ne lis que les articles bullish → tu ignores les red flags. Antidote : chercher activement les arguments CONTRE ton thèse. Si tu ne peux pas les réfuter, ton thèse est fragile."
        },
        {
            keys: ['biais recence', 'recency bias'],
            answer: "Le <strong>biais de récence</strong> : on sur-pondère les événements récents. Après 3 ans de bull market, tout le monde pense que ça va monter pour toujours. Après -40%, tout le monde pense que c'est la fin du capitalisme. Les décisions prises sous l'influence récente sont presque toujours sous-optimales."
        },
        {
            keys: ['effet halo', 'biais autorite'],
            answer: "L'<strong>effet halo</strong> en finance : parce que Cathie Wood a eu raison en 2020, on lui attribue une compétence globale alors que ses résultats 2021-2024 sont catastrophiques. Pareil pour Musk, Buffett (jeune), Kerviel (pour d'autres raisons). Le survivorship bias amplifie l'effet halo. Juge les décisions, pas les personnalités."
        },
        {
            keys: ['effet disposition', 'vendre gagnants', 'garder perdants'],
            answer: "L'<strong>effet de disposition</strong> (Shefrin-Statman) : on vend trop vite les GAGNANTS (\"pour matérialiser\") et on garde trop longtemps les PERDANTS (\"pour espérer rebondir\"). Inverse de la stratégie rationnelle. Antidote : règles écrites, automatisation DCA, et sur le long terme, buy & hold indiciel où tu ne touches à rien."
        },

        // ===== Divers culture générale =====
        {
            keys: ['histoire bourse paris', 'paris bourse', 'brongniart'],
            answer: "La <strong>Bourse de Paris</strong> 🏛️ : créée officiellement en 1724, installée depuis 1826 au Palais Brongniart. Fusionnée avec Amsterdam et Bruxelles en 2000 pour former <strong>Euronext</strong>, puis avec Lisbonne (2002), Oslo (2019), Milan (2021). Plateforme de trading : Paris (ETF, actions) + Londres (dérivés). Cotations électroniques depuis 1988."
        },
        {
            keys: ['nyse', 'wall street', 'new york stock exchange'],
            answer: "<strong>NYSE (New York Stock Exchange)</strong> 🇺🇸 : fondée en 1792 sous un platane à Wall Street (accord de Buttonwood). Plus grande bourse au monde par capitalisation (~28 000 Md$). Symbole : le traders à la criée (encore 10% du volume, le reste est électronique). Rachetée par ICE (Intercontinental Exchange) en 2013."
        },
        {
            keys: ['nasdaq exchange', 'bourse nasdaq'],
            answer: "Le <strong>NASDAQ</strong> : créé en 1971, première bourse entièrement électronique au monde. Focus historique sur la tech et la croissance. Siège au Times Square (le fameux écran). Cotations : 3 300 entreprises. Domine sur la tech (Apple, Microsoft, NVIDIA, Tesla, etc.). Perf 2015-2024 : nettement supérieure au S&P 500 grâce au poids de la tech."
        },
        {
            keys: ['marches mondiaux', 'bourses monde', 'principales bourses'],
            answer: "Les principales <strong>bourses mondiales</strong> :<br>🥇 NYSE (USA) : 28 000 Md$<br>🥈 NASDAQ (USA) : 25 000 Md$<br>🥉 Shanghai + Shenzhen (Chine) : 13 000 Md$<br>🏅 Euronext (Europe) : 7 500 Md$<br>🏅 Japan Exchange (Tokyo) : 7 000 Md$<br>🏅 Hong Kong : 4 500 Md$<br>🏅 NSE + BSE Inde : 5 000 Md$ (et en forte croissance)<br><br>USA concentre ~50% de la capitalisation mondiale."
        },
        {
            keys: ['london stock exchange', 'lse', 'bourse londres'],
            answer: "La <strong>London Stock Exchange</strong> (LSE) : fondée 1801 (origines 1571). Une des plus anciennes. Perte d'influence post-Brexit : beaucoup d'IPO parties à Amsterdam ou New York. Indice FTSE 100 : peu de tech, beaucoup d'énergie / mines / pharma / finance. Performance médiocre ces 20 ans."
        },
        {
            keys: ['marches emergents top', 'inde bourse', 'chine bourse'],
            answer: "Les <strong>marchés émergents</strong> phares :<br>🇮🇳 <strong>Inde</strong> : démographie, croissance 6%/an, SENSEX + NIFTY en forme. Surpondération en vogue post-2022.<br>🇨🇳 <strong>Chine</strong> : géant décevant pour les investisseurs étrangers. Tensions USA, immobilier en crise, régulations imprévisibles. Très sous-évaluée, mais risque politique.<br>🇧🇷 <strong>Brésil</strong> : matières premières, volatile.<br>🇲🇽 <strong>Mexique</strong> : nearshoring (reshoring depuis la Chine)."
        },
        {
            keys: ['commerce international', 'globalisation', 'mondialisation'],
            answer: "La <strong>mondialisation économique</strong> : accélération 1990-2010 (Chine à l'OMC, internet, conteneurs, chaînes globales). Depuis 2016-2020 : <strong>reflux</strong>. Trump-Biden (tarifs Chine), COVID (fragilité supply chains), guerre Ukraine, IRA. Mot clé : <strong>friend-shoring</strong> (relocalisation chez alliés). La \"peak globalization\" est probablement derrière nous."
        },
        {
            keys: ['inflation quebec', 'inflation france historique', 'taux inflation france'],
            answer: "L'<strong>inflation en France</strong> historique :<br>• 1970s : jusqu'à 14% (chocs pétroliers)<br>• 1980s : désinflation (Barre, Rocard)<br>• 1990-2020 : stable 1-2%<br>• 2022 : pic à 6,2% (choc énergétique)<br>• 2023 : 4,9%<br>• 2024 : 2,0% (cible BCE atteinte)<br>• 2025-2026 : retour vers 1,5-2%<br><br>Très loin des hyperinflations allemande ou argentine."
        },
        {
            keys: ['smic', 'salaire minimum'],
            answer: "Le <strong>SMIC</strong> en 2026 : environ 1 830 € brut/mois (35h) soit ~1 445 € net. Revalorisé au 1er janvier + automatique si inflation. Concerne ~14% des salariés français. Débat économique classique : trop élevé (freine l'emploi peu qualifié) ou pas assez (pouvoir d'achat insuffisant) ? Le consensus des économistes : ni l'un ni l'autre de manière tranchée."
        },
        {
            keys: ['chomage france historique', 'taux chomage france'],
            answer: "Le <strong>chômage en France</strong> : 2,5% en 1973 (quasi plein-emploi)… puis montée régulière. Pic à ~11% en 1997 et 2013. Baisse sous Macron : 7,2% en 2024. Structurel car : rigidités du marché du travail, fracture formation/besoins, forte part du secteur public. Taux de chômage des jeunes (15-24 ans) : deux fois plus élevé que moyen, ~17%."
        },
        {
            keys: ['dette france', 'dette publique francaise'],
            answer: "La <strong>dette publique française</strong> en 2025 : ~3 200 Md€, soit ~113% du PIB. Détenue à ~50% par des non-résidents (BCE, assureurs étrangers, fonds). Charge de la dette : ~55 Md€/an en 2025, projetée à 80+ en 2028 avec les taux élevés. La charge de la dette deviendra dans 5 ans le 1er poste budgétaire de l'État, devant l'Éducation nationale."
        },
        {
            keys: ['ira inflation reduction act', 'inflation reduction act'],
            answer: "L'<strong>Inflation Reduction Act (IRA, août 2022)</strong> 🇺🇸 : loi de 400 Md$ sous Biden. Subventions massives pour la transition énergétique (EV, batteries, solaire, hydrogène). Effet : réindustrialisation accélérée des USA, investissements en masse dans le Sud (Texas, Géorgie, Arizona). Déclencheur d'une réponse UE (Green Deal Industriel Plan, 2023) — souvent jugée insuffisante."
        },
        {
            keys: ['tarifs trump', 'guerre commerciale', 'droits douane'],
            answer: "La <strong>guerre commerciale USA-Chine</strong> : Trump 1 (2018-2019) impose des droits de douane sur 370 Md$ d'imports chinois, Chine riposte. Biden (2021-2024) garde ces tarifs + ajoute sur les EV chinois, les panneaux solaires, les semi-conducteurs. Trump 2 (2025+) : tarifs généralisés 10-60% sur différents pays. Conséquence : inflation importée, mais aussi relocalisations."
        },
        {
            keys: ['chips act', 'chips and science'],
            answer: "Le <strong>CHIPS Act (août 2022, USA)</strong> : 52 Md$ de subventions pour relocaliser la production de semi-conducteurs aux USA. Bénéficiaires : TSMC (usines Arizona), Intel, Micron, Samsung. Objectif : ne plus dépendre de Taïwan pour les puces avancées (enjeu géopolitique critique). Résultat mitigé : délais, coûts 2-3× plus élevés qu'à Taïwan, pénurie de techniciens."
        },
        {
            keys: ['obligations convertibles', 'ob convertibles'],
            answer: "Les <strong>obligations convertibles</strong> : obligations qui peuvent être converties en actions selon des conditions prédéfinies. Coupon plus bas qu'une obligation classique, mais upside actions. Intéressant pour l'émetteur (financement moins cher) et pour l'investisseur (protection du capital + potentiel). Marché de ~500 Md$ mondial. Assez sophistiqué pour un débutant."
        },
        {
            keys: ['ppa vs tmb', 'salaire net brut', 'fiche paie'],
            answer: "<strong>Salaire brut vs net</strong> en France :<br>🔹 Brut → -22% de charges salariales → Net avant impôt<br>🔹 Net avant impôt → -PAS (prélèvement à la source) → Net en poche<br>🔹 Côté employeur : Brut + ~42% de charges patronales = \"coût total\" employeur<br><br>Soit : Coût total employeur → 2× net en poche (environ). La France a un des coins fiscaux les plus élevés OCDE."
        },
        {
            keys: ['retraite francaise', 'systeme retraite france'],
            answer: "Le <strong>système de retraite français</strong> : <strong>répartition</strong> (les actifs paient pour les retraités actuels), pas capitalisation. 42 régimes (unifiés progressivement). Âge légal : 62 → 64 ans (réforme 2023). Durée de cotisation : 43 ans à partir de 2027. Taux de remplacement : ~50-60% du dernier salaire en moyenne. Déficit structurel : ~15-20 Md€/an."
        },
        {
            keys: ['dow jones histoire', 'dow 1896', 'charles dow'],
            answer: "Le <strong>Dow Jones</strong> : créé le 26 mai 1896 par Charles Dow (cofondateur du Wall Street Journal). 12 valeurs à l'origine (GE, US Rubber, American Cotton Oil…). Aujourd'hui : 30 valeurs. Particularité étrange : pondéré par le PRIX, pas la capitalisation. Anachronisme conservé \"par tradition\". Largement dépassé par le S&P 500 en pertinence analytique — mais populaire médiatiquement."
        },
        {
            keys: ['insider trading', 'delit initie'],
            answer: "Le <strong>délit d'initié</strong> : utiliser une info confidentielle non publique pour trader. Illégal partout. Amendes : 10× le gain + prison possible. Gros cas historiques : Martha Stewart (2003, 5 mois), Raj Rajaratnam (Galleon, 11 ans), SAC Capital (1,8 Md$ d'amende). Détecté par les régulateurs via analyse des flux suspects à la veille d'annonces. Ne joue pas à ça."
        },
        {
            keys: ['insider', 'achat initie legal', 'insider buying'],
            answer: "<strong>Achats d'initiés (légaux)</strong> : quand les dirigeants achètent des actions de leur propre entreprise sur le marché (déclaré à l'AMF/SEC). Signal traditionnellement bullish : \"personne ne connaît mieux la boîte qu'eux\". Inversement, vente d'initié massive = red flag. Suivis par des services comme OpenInsider, Finviz, Whale Wisdom."
        },
        {
            keys: ['wsj', 'wall street journal', 'bloomberg', 'financial times'],
            answer: "Les <strong>médias financiers de référence</strong> :<br>📰 <strong>Wall Street Journal</strong> : le Monde de la finance US<br>📰 <strong>Financial Times</strong> : rival britannique, international<br>📺 <strong>Bloomberg</strong> : data + news, terminal pro à 25k€/an<br>📺 <strong>CNBC</strong> : TV en direct, parfois bruit > signal<br>📰 <strong>The Economist</strong> : hebdo, ton posé<br>📰 <strong>Les Échos, La Tribune</strong> : France<br><br>Suivre 1-2 sources fiables vaut mieux que 20 comptes Twitter."
        },
        {
            keys: ['twitter finance', 'fintwit', 'reddit wsb'],
            answer: "<strong>Twitter / FinTwit</strong> : source d'infos en temps réel, mais <strong>bruit > signal</strong>. Comptes utiles (à vérifier en 2026) : macro (Nick Timiraos, Jim Bianco), quant (Corey Hoffstein), value (Francois Rochon). Reddit r/WallStreetBets : divertissement + signal contrarian. Règle : plus quelqu'un tweete ses trades gagnants, plus il est suspect."
        },

        // ===== Conseils étudiants finance =====
        {
            keys: ['first step', 'premier pas', 'par ou commencer'],
            answer: "Tu veux commencer la finance perso en tant qu'étudiant ? La checklist minimaliste :<br>1️⃣ Ouvrir un <strong>Livret A</strong> (30 secondes sur l'appli de ta banque)<br>2️⃣ Constituer 3 mois de dépenses dessus<br>3️⃣ Ouvrir un <strong>PEA</strong> chez Bourse Direct ou Trade Republic (gratuit)<br>4️⃣ Mettre en place un <strong>virement programmé</strong> (50 €/mois) vers un <strong>ETF World (CW8)</strong><br>5️⃣ Ne plus y toucher. Lire des livres. Attendre 20 ans.<br><br>C'est TOUT. Vraiment."
        },
        {
            keys: ['erreur debutant', 'erreurs investisseur', 'piege debutant'],
            answer: "Les <strong>erreurs classiques du débutant</strong> :<br>❌ Attendre \"le bon moment\" pour investir (ce moment = maintenant)<br>❌ Chercher des x10 au lieu de x3 sur 20 ans<br>❌ Trader activement (perte quasi-garantie)<br>❌ Suivre les conseils Instagram/TikTok<br>❌ Paniquer en cas de baisse<br>❌ Concentrer sur une seule action (ou crypto)<br>❌ Sous-estimer l'impact des frais<br>❌ Ne pas ouvrir de PEA \"plus tard\"<br><br>Toutes évitables avec un minimum de discipline et de diversification indicielle."
        },
        {
            keys: ['combien temps investir', 'horizon investissement'],
            answer: "<strong>Horizon d'investissement</strong> :<br>• <strong>< 1 an</strong> : Livret A / LDDS UNIQUEMENT (actions trop risquées)<br>• <strong>1-3 ans</strong> : fonds euros, obligations courtes<br>• <strong>3-5 ans</strong> : mix 30-50% actions<br>• <strong>5-10 ans</strong> : 60-80% actions<br>• <strong>> 10 ans</strong> : 80-100% actions (ETF World)<br><br>Règle d'or : plus l'horizon est long, plus la proportion actions peut être élevée, car le temps absorbe la volatilité. Un étudiant de 20 ans visant la retraite à 65 ans ? 100% actions fait sens."
        },
        {
            keys: ['papa noel finance', 'cadeau enfant finance'],
            answer: "<strong>Idées cadeaux financiers</strong> pour Noël/anniversaire :<br>🎁 Ouvrir un <strong>livret bébé / jeune</strong> avec les grands-parents<br>🎁 Abonder le PEA-Jeunes d'un étudiant (jusqu'à 20 000 € d'épargne)<br>🎁 Verser sur une assurance-vie à son nom<br>🎁 Donation au profit d'un PEA (rappel : 100 000 € / enfant / 15 ans sans droits)<br>🎁 Livres : \"La psychologie de l'argent\" (Housel) pour un lycéen<br><br>Beaucoup plus utile qu'un jeu vidéo de plus."
        },
        {
            keys: ['peur perte argent', 'peur bourse', 'anxiete bourse'],
            answer: "L'<strong>anxiété de perdre en bourse</strong> est normale. Comment la gérer :<br>🧘 Commencer PETIT (10-50 €/mois) pour apprendre psychologiquement<br>🧘 Ne pas regarder ton compte plus d'1× par trimestre<br>🧘 Diversifier via ETF World = max 23 pays, 1500 boîtes. Si TOUT coule, on a d'autres soucis.<br>🧘 Se rappeler : les -40% arrivent ~1× tous les 10 ans en actions. Les -20% plusieurs fois par décennie. Normal, pas fin du monde.<br>🧘 Horizon long + DCA + ETF diversifié = la recette anti-stress. Dormir tranquille est sous-estimé."
        },
        {
            keys: ['aide finance perso', 'conseiller financier', 'cgp gratuit'],
            answer: "<strong>Trouver un bon conseiller</strong> :<br>🎯 <strong>CGP indépendant</strong> (Conseiller en Gestion de Patrimoine) : agréé AMF, rémunéré par honoraires (pas rétrocessions)<br>❌ Éviter : conseiller bancaire (commissionné sur les fonds maison), YouTubeurs qui te vendent leurs formations<br>🆓 Ressources gratuites : forum <a href=\"https://forum.avenuedesinvestisseurs.fr\">ADI</a>, blog Edouard Petit, finary, AMF.org<br><br>Pour un étudiant avec < 50 k€ : un bon bouquin + un ETF World = TOUT ce dont tu as besoin. Attends d'avoir > 200 k€ avant de payer un CGP."
        },

        // ===== Small talk (conversationnel, sans disclaimer) =====
        {
            keys: ['salut', 'bonjour', 'bonsoir', 'hello', 'hey', 'coucou', 'yo', 'hi', 'hola'],
            smalltalk: true,
            answer: "Salut 👋 Moi c'est Rhino, l'assistant finance de l'IFA. Tu veux parler ETF, PEA, crypto, ou juste tchatter un peu ? Je suis partant pour les deux."
        },
        {
            keys: ['ca va', 'comment ca va', 'tu vas bien', 'comment vas tu', 'comment tu vas', 'ca roule', 'quoi de neuf', 'tu fais quoi'],
            smalltalk: true,
            answer: "Ça roule comme un ETF World : monte tranquille sur le long terme 📈 Et toi, ça va ? Une question finance qui te trotte dans la tête ?"
        },
        {
            keys: ['merci', 'thanks', 'thank you', 'merci beaucoup', 'mci', 'big up', 'tres gentil'],
            smalltalk: true,
            answer: "Avec plaisir 🦏 Si t'as d'autres questions finance, je suis là. Et si tu trouves l'IFA sympa, jette un œil à la section <a href=\"index.html#rejoindre\">Nous rejoindre</a> 😉"
        },
        {
            keys: ['au revoir', 'bye', 'ciao', 'adieu', 'a plus', 'a plus tard', 'a bientot', 'bonne journee', 'bonne soiree', 'tchao'],
            smalltalk: true,
            answer: "À la revoyure 👋 Et souviens-toi : le meilleur moment pour commencer à investir, c'était hier. Le deuxième, c'est aujourd'hui. 💪"
        },
        {
            keys: ['qui es tu', 'tu es qui', 'tu t appelles', 'ton nom', 'c est qui', 'tu es quoi', 'presente toi', 'rhino'],
            smalltalk: true,
            answer: "Moi c'est <strong>Rhino</strong> 🦏 la mascotte-chatbot de l'<strong>INSA Finance Association</strong>. Ma mission : vulgariser la finance pour les étudiants sans jargon ni cravate. Pose-moi une question, n'importe laquelle !"
        },
        {
            keys: ['aide', 'help', 'que peux tu faire', 'que sais tu faire', 'a quoi tu sers', 'tes capacites', 'tu connais quoi'],
            smalltalk: true,
            answer: "Je peux t'aider sur plein de sujets finance :<br><br>📊 <strong>Placements</strong> : PEA, assurance-vie, CTO, SCPI, PER, livrets<br>📈 <strong>Bourse</strong> : ETF, actions, obligations, indices (S&P 500, CAC 40, MSCI World)<br>🪙 <strong>Crypto</strong> : Bitcoin, stablecoins, NFT, arnaques<br>🎓 <strong>Bases</strong> : inflation, intérêts composés, diversification, DCA<br>💼 <strong>Pratique étudiant</strong> : budget, premier investissement, fiscalité<br>🏛️ <strong>IFA</strong> : nous rejoindre, événements, newsletter<br><br>Lance-toi, pose ta question !"
        },
        {
            keys: ['blague', 'raconte blague', 'fais moi rire', 'fun fact', 'anecdote'],
            smalltalk: true,
            answer: "OK, finance edition 🦏 :<br><br>🎭 \"Pourquoi les traders aiment les montagnes russes ? Parce que c'est le seul endroit où ils perdent pas d'argent en descendant.\"<br><br>🎭 \"Un type demande à son conseiller : 'C'est quoi la meilleure stratégie ?'<br>— Achète bas, vends haut.<br>— Et si ça fait l'inverse ?<br>— Alors t'es un Français moyen en 2008.\"<br><br>🎭 Fait vrai : en 1720, Isaac Newton a perdu l'équivalent de 3 millions € dans la bulle de la South Sea Company. Citation : \"Je peux calculer le mouvement des astres, mais pas la folie des hommes.\" Même les génies se plantent."
        },
        {
            keys: ['tu es cool', 't es cool', 'tu es sympa', 't es sympa', 'tu es genial', 't es genial', 'tu es drole', 't es drole', 'bravo', 'gg', 'bien joue', 'top', 'excellent'],
            smalltalk: true,
            answer: "Merci 🥰 Toi aussi t'as l'air sympa. Allez, continue à me cuisiner sur la finance, j'ai encore plein de choses à raconter."
        },
        {
            keys: ['tu es nul', 't es nul', 'tu sers a rien', 'nul', 'bof', 'deception', 't es pas terrible'],
            smalltalk: true,
            answer: "Aïe 🦏 J'ai peut-être raté ta question. Reformule-la, ou pioche dans les suggestions en dessous — je suis rule-based (pas un LLM), donc je fonctionne avec des mots-clés précis."
        },
        {
            keys: ['desole', 'pardon', 'excuse moi', 'oups'],
            smalltalk: true,
            answer: "Pas de souci 😄 Pose ta question quand tu veux."
        },
        {
            keys: ['t es une ia', 'tu es une ia', 'tu es un bot', 't es un bot', 'chatgpt', 'intelligence artificielle', 'tu es humain'],
            smalltalk: true,
            answer: "Je suis un chatbot à règles 🦏 pas une IA générative. Un humain (étudiant INSA) a écrit toutes mes réponses à la main. Donc je ne bluffe pas : si je réponds, c'est que quelqu'un a relu la réponse avant moi."
        },
        {
            keys: ['ton age', 'quel age', 'tu as quel age'],
            smalltalk: true,
            answer: "Je suis né quelque part entre deux cafés et trois commits 😄 L'IFA elle-même a été créée en 2026, donc je suis tout jeune."
        },
    ];

    // ---------- Greeting + fallback ----------
    const GREETINGS = [
        "Salut 👋 Moi c'est Rhino, l'assistant finance de l'IFA. ETF, PEA, crypto, fiscalité, trading, Buffett... tu demandes, je vulgarise.",
        "Hey 🦏 Bienvenue ! Ici on parle finance sans jargon ni cravate. Pose ta question, même la plus basique : y'a pas de question bête, y'a juste des portefeuilles bêtes.",
        "Yo 👋 Rhino à l'appareil. Je décrypte la finance pour les étudiants : placements, bourse, crypto, immobilier, arnaques à éviter... fire away !",
        "Coucou 🦏 Dispo pour parler investissements, impôts, marchés, ou même t'expliquer pourquoi le PEA est ton meilleur ami. Go !",
    ];

    const SUGGESTIONS = [
        "C'est quoi un ETF ?",
        "Comment commencer avec 50 € ?",
        "PEA ou assurance-vie ?",
        "Les intérêts composés",
        "Rejoindre l'IFA",
    ];

    const NO_MATCH = [
        "Hmm 🤔 pas sûr d'avoir capté. Reformule ou pioche dans ces pistes :",
        "Celle-là, elle me dépasse 🦏 Essaie un de ces sujets :",
        "Je sèche. Soit ta question est trop pointue pour mes neurones, soit j'ai mal lu. Tente plutôt :",
        "Aïe 😅 je n'ai pas trouvé. Reformule ou choisis un classique :",
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
        launcher.setAttribute('aria-label', "Ouvrir Rhino, l'assistant finance de l'IFA");
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
            addBotMessage(match.answer, !match.smalltalk);
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
            "Comment commencer avec 50 € ?",
            "Explique-moi l'inflation",
            "Parle-moi des cryptos",
            "C'est quoi le PER ?",
            "Analyse fondamentale ?",
            "Les intérêts composés",
            "La diversification",
            "C'est quoi une SCPI ?",
            "Assurance-vie intéressante ?",
            "Livret A ou LEP ?",
            "Fiscalité des placements",
            "Rejoindre l'IFA",
            "Les dividendes",
            "C'est quoi un bear market ?",
            "Warren Buffett ?",
            "Faut-il faire du trading ?",
            "Quel courtier choisir ?",
            "C'est quoi le S&P 500 ?",
            "CAC 40 vs MSCI World",
            "Option call / put ?",
            "Effet de levier = danger ?",
            "Short selling expliqué",
            "Comment repérer une arnaque ?",
            "Règle 50/30/20",
            "Stock options / BSPCE",
            "ESG / ISR / greenwashing",
            "Or comme investissement ?",
            "PEL encore utile ?",
            "PEE et abondement",
            "Succession et donation",
            "Biais psychologiques",
            "Rebalancing c'est quoi ?",
            "Livres pour débuter",
            "Analyse technique ?",
            "VIX indice de peur",
            "Retraite quand on a 20 ans ?",
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
