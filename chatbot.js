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
