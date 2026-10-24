# Faisabilité technique

> Ce document se fonde sur une lecture seule du dépôt, au 24/10/2026. Aucun fichier applicatif n'a été modifié.

## 1. Stack existante

| Sujet | État | Source |
|---|---|---|
| Framework | **Astro 7.3.5**, `output: 'static'`, adapter `@astrojs/vercel` 11, `trailingSlash: 'never'`, `build.format: 'file'` | `astro.config.mjs` |
| UI | Pas de React, Vue ni Svelte. Composants `.astro`, **CSS Modules** (environ 1 400 lignes), quelques `style=""` | `src/**` |
| Données | Postgres (Drizzle) lue **uniquement au build**, sur le VPS | `src/db/client.ts`, `src/db/schema.ts` |
| Tokens | `src/styles/tokens.css`, thème sombre uniquement, breakpoints 480 / 766 / 1280 / 1540 en commentaire | — |
| Polices | woff2 auto-hébergées, `font-display: swap`, **sans preload**. Monument Extended Black, PolySans Neutral et Slim utilisées. **PP Cirka Variable** et **Bebas Neue** présentes mais inutilisées. | `public/fonts`, `src/styles/globals.css` |
| Animation | **Aucune librairie.** Seulement des transitions CSS et un marquee (`relatedGames.module.css`). **Aucune gestion de `prefers-reduced-motion`.** | Recherche dans le code |
| JS client | `src/scripts/enhance.ts` (liens masqués), `src/features/jeu/components/Pace/paceClient.ts` (calculateur) | — |
| Images | Couvertures IGDB en **hotlink** (`src/utils/igdbImage.ts`, tailles `cover_big`, `cover_big_2x`, `720p`, `1080p`). `astro:assets` utilisé seulement pour `bg.jpg`. | — |
| Qualité | ESLint 9, Prettier, `astro check`, Husky (lint-staged, commitlint). CI GitHub : type-check, lint, commitlint. **Aucun test automatisé.** | `package.json`, `.github/workflows/ci.yml` |
| Déploiement | Build sur le **VPS**, puis `vercel deploy --prebuilt`. Toutes les heures pour les actus, chaque lundi pour le catalogue. `vercel --prod` échoue faute de base. Garde-fou : le déploiement est refusé si le nombre de pages tombe sous 95 % du précédent. | `README.md`, `scripts/deploy.sh`, `docs/actus.md` |

## 2. Ce qui est réutilisable tel quel

- **Calcul du rythme.** `PACES = [3, 7, 15, 30]`, `DEFAULT_PACE = 7`, `paceDays()` et `formatPace()` dans `src/features/jeu/components/Pace/pace.ts`. Ces fonctions sont déjà partagées entre le serveur et le client : **c'est le moteur de la direction 3**.
- **Données de jeu.** `getGames()` calcule déjà, pour chaque jeu, `popularity`, `timeRank` (percentile), les blocs `hltb`, `completion`, `price` et `identity`, ainsi que la couverture. Il suffit de trier et de filtrer au build.
- **Données d'actus.** `getNewsArticles()` renvoie les articles avec leur `gameId` et leur `image`.
- **Équivalence en films et verdict.** La logique existe sur les fiches (`src/features/jeu/components/Verdict.astro`, qui s'appuie sur `src/features/jeu/utils/gameTimes.ts`).
- **Composants.** CircularBar (SVG), cartes Time, Breadcrumb.
- **Polices.** Monument (signature), PolySans (texte), Cirka (serif, direction 2).
- **Visuels.** Images de repli des actus (`public/actus/*.webp`, 1600×900), avatars d'auteurs.

## 3. Stack d'animation proposée, sans nouvelle dépendance

| Besoin | Technique | Support et repli |
|---|---|---|
| Barres qui grandissent, révélations au scroll | **CSS scroll-driven animations** (`animation-timeline: view()`) dans `@supports` | Chromium et Safari récents. Ailleurs, état final statique (amélioration progressive). Support Firefox à revérifier au moment du développement. |
| Transitions entre la home et une fiche (couverture → couverture) | **View Transitions cross-document natives** : `@view-transition { navigation: auto; }` et `view-transition-name` | Navigation classique là où ce n'est pas supporté. Pas besoin de `<ClientRouter />`. |
| Changement de rythme dans le hero (date qui roule, barres qui se réarrangent) | `document.startViewTransition()` (même document), plus la **Web Animations API** | Mise à jour instantanée si l'API est absente. |
| Recomposition typographique (direction 1 seulement) | Web Animations API sur des `<span>` générés au build. **GSAP**, gratuit depuis 2025, seulement si la WAAPI ne suffit pas. | Texte final affiché directement. |
| Grain (directions 2 et 3) | SVG `feTurbulence` statique en `background-image` | Aucun coût d'exécution |
| Mouvement réduit | `@media (prefers-reduced-motion: reduce)` global : animations à 0, transitions désactivées, défilement du générique remplacé par un texte statique | **À ajouter de toute façon : c'est un manque actuel.** |

**Écartés :**
- **Lenis et le smooth scroll** : ils détournent le scroll natif, nuisent à l'accessibilité et n'apportent rien au besoin.
- **Three.js / WebGL** : poids, et aucun bénéfice pour un usage de recherche.
- **Framer Motion** : il n'y a pas de React.
- **Un preloader** : il a déjà été retiré (`b2d9da0`).

## 4. Recherche, prérequis des trois directions

| Option | Principe | Avantages | Inconvénients |
|---|---|---|---|
| **A. Index JSON maison (recommandée)** | Endpoint statique Astro (par exemple `src/pages/recherche.json.ts`) généré au build. Tableau compact de tuples `[nom, slug, main, extras, 100%]`. Chargé au **focus** du champ. Filtrage par préfixe ou sous-chaîne normalisée (sans accents). | Zéro dépendance. Donne directement les durées, donc une réponse instantanée « 40 h · fin vers le 3 déc. ». | Poids **estimé** à 300–400 Ko bruts, environ 80–120 Ko gzip, pour 8 443 jeux. À mesurer. Au-delà de 150 Ko gzip : découpage par initiale. |
| B. Pagefind | Index généré sur le HTML après le build, chargé par fragments | Robuste, découpage natif, gratuit | Nouvelle dépendance de build. Résultats en pages, pas en données (les durées seraient à extraire). Étape à ajouter dans `deploy.sh`. |

La recherche n'est pas indexée par Google, donc aucun impact SEO. Le JSON-LD `SearchAction` reste volontairement absent : `src/utils/structuredData.ts` note que Google ne l'affiche plus.

## 5. Budget de performance proposé

**Référence actuelle :** environ 26 Ko transférés (cache chaud), HTML 6,2 Ko, FCP environ 120 ms, CLS 0,058.

| Métrique | Budget | Remarque |
|---|---|---|
| HTML home | ≤ 40 Ko gzip | Les listes pré-calculées pour 4 rythmes font l'essentiel |
| JS au chargement | ≤ 15 Ko gzip | L'index de recherche est **hors budget**, chargé au focus |
| Polices au premier écran | Monument et PolySans Neutral préchargées (environ 55 Ko) | Corrige aussi le CLS |
| Images au-dessus de la ligne de flottaison | Direction 3 : **aucune** (le hero est typographique). Direction 2 : 1 key art responsive ≤ 120 Ko en mobile. | Direction 2 = risque LCP |
| Couvertures sous la ligne de flottaison | `loading="lazy"`, `width` et `height` explicites, taille IGDB `cover_small` ou `cover_big` selon l'usage | IGDB reste en hotlink (règle produit F8) |
| LCP mobile | < 2,0 s | — |
| CLS | < 0,05 | — |
| INP | < 200 ms | Les interactions du rythme sont simples |

Pour respecter la règle produit (poids ≤ 2× l'actuel), la home serait la **seule** page qui grossit nettement. Les fiches ne bougent pas.

## 6. Assets

**Disponibles et réutilisables :**
- polices Monument, PolySans et Cirka ;
- tokens de couleur ;
- couvertures IGDB (environ 8 400) ;
- visuels d'actus ;
- avatars d'auteurs ;
- ligne de 404.

**Manquants ou à décider :**

| Asset | Besoin | Piste |
|---|---|---|
| **Logo** | Il n'existe qu'en texte. Un vrai logotype est utile pour l'og:image, le favicon et le JSON-LD `Organization` (aujourd'hui un PNG d'icône). | Dessiner un logotype à partir de Monument (ligature, drapeau d'arrivée pour la direction 3). Hors périmètre du développement. |
| **og:image de la home** | Absente | Image générée au build : la date « GAME OVER · 3 DÉC. » sur la grille |
| **Key art des jeux** (direction 2) | Non stocké (F8 non construit) | Ajouter les `artworks` et `screenshots` IGDB à la synchro, en URL seulement, comme les couvertures |
| **Photo `bg.jpg`** | Licence inconnue. Image générique. | **À retirer** dans les trois directions |
| **Icônes** | Noms de fichiers erronés (`72x72.png` mesure 144×144), tailles erronées dans le manifest | Corriger en même temps |
| **Licences des polices** | Monument Extended et PP Cirka viennent de la fonderie Pangram Pangram (préfixe « PP »). PolySans est une fonderie commerciale. **Licence web à confirmer** avant une mise en avant accrue. | Si une licence manque, prévoir des alternatives libres. |
| **Police mono** | Absente | Geist Mono ou JetBrains Mono (licence OFL), en sous-ensemble chiffres et capitales, environ 10 Ko |

**Règle :** aucune image fictive ne doit représenter un jeu réel. Toutes les vignettes viennent d'IGDB (ou de Steam pour les actus), avec un lien vers la fiche.

## 7. Contraintes de déploiement et d'exploitation

- **Pas de prévisualisation Vercel classique.** Chaque essai passe par un build local avec un tunnel SSH vers la base, ou par le VPS.
- **Attention :** le déploiement horaire des actus **écrase** tout déploiement fait depuis un portable si le code n'est pas aussi sur le VPS (`README.md`, `docs/actus.md`).
- **Conséquence :** développer sur une branche, tester avec `astro dev` (tunnel SSH), puis fusionner sur `main` **et** lancer le déploiement depuis le VPS.
- **Les données de la home changent toutes les heures.** C'est un avantage : actus et « jeu du moment » restent frais sans ISR.
- **Coût de build :** les calculs de la home (tris, médianes, listes par rythme) se font sur des données déjà chargées par `getGames()`. Négligeable.
  - Remarque : la home appelle aujourd'hui `getGames()` **seulement pour compter les jeux**. La refonte rentabilise cet appel.

## 8. SEO à préserver ou améliorer

| | |
|---|---|
| **Préserver** | URLs (`/jeu/<slug>`, `/genre/<slug>[/n]`, `/actus…`, `/auteurs/<slug>`), JSON-LD `@graph` (`WebSite`, `Organization`, `WebPage`), sitemaps, `lang="fr"`, footer en vrais liens sur la home (`cloakFooter={false}`) |
| **Corriger** | Title et meta (fautes, accents), `canonical` et `og:url` de la home, `og:image` |
| **Gagner** | La home devient une page de **maillage interne** : environ 40 à 80 liens vers des fiches populaires, plus les genres et les actus. Ces liens viennent du contenu rendu au build (pas en JS), donc indexables. Sur la direction 3, un `ItemList` pour « La règle » est envisageable. |

## 9. Stratégie d'implémentation (aperçu pour la Phase 2)

1. **Socle, pour toutes les directions :**
   - `prefers-reduced-motion` global ;
   - préchargement des polices ;
   - index de recherche ;
   - corrections du head de la home ;
   - retrait de `bg.jpg`.
2. **Composant « barre de durée »** (SVG / CSS, trois états : plein, contour, hachures). Il est réutilisé ensuite sur les fiches, les genres et les actus.
3. **Hero de la direction retenue**, avec un rendu statique par défaut et une amélioration en JS.
4. **Sections de contenu**, rendues au build.
5. **Animations**, en dernier, en amélioration progressive.
6. **Vérification :**
   - `pnpm type-check`, `pnpm lint` ;
   - Lighthouse mobile ;
   - test clavier et lecteur d'écran sur le hero ;
   - comparaison du poids avec le budget.
