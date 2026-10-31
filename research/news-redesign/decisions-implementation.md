# Décisions d'implémentation

> 24 octobre 2026. Décisions concrètes à valider avant le code. Elles découlent de [`recommandations.md`](recommandations.md). Aucun fichier applicatif n'a été modifié par cette recherche.
> **Hors périmètre** : auteurs, signature, boîte auteur, provenance éditoriale. Les composants `Byline` et `AuthorBox` restent tels quels.
> **Chiffres à confirmer en base** : environ 60 articles, 15 % liés à une fiche (donnée de la demande, non revérifiée).
> **Remarque.** Le type `NewsGame` de `src/config/news.ts` porte déjà `cover`, `timeMainStory` et `timeCompletionists` dans l'arbre de travail actuel : les décisions ci-dessous les supposent disponibles côté gabarit. À vérifier avant de coder.

## 1. Routes

| Route | Statut | Notes |
|---|---|---|
| `/actus`, `/actus/2`… | Existante | Même `getStaticPaths` paginé ; taille de page : voir D-P1 |
| `/actus/<slug>` | Existante | Inchangée |
| `/actus/categorie/<slug>`, `/actus/categorie/<slug>/2`… | **Nouvelle** | Une route par catégorie **non vide** parmi `sortie`, `mise-a-jour`, `annonce`, `materiel`, `industrie`, `promo`, `autre` |
| `/actus/rss.xml`, `/actus/sitemap.xml` | Existantes | Inchangées |

**Conflit de routes à vérifier.** `[slug].astro` et `categorie/[slug]` ne se heurtent pas tant qu'aucun article n'a le slug `categorie`. Le slug d'un article finit par un hash de 8 caractères (`articleSlug(title, key)`) : le risque est nul. À contrôler au build.

**Slugs des catégories.** Ils reprennent les valeurs de l'enum (`mise-a-jour`, etc.) ; les libellés restent `newsCategoryLabels`. Pas de renommage.

## 2. Composants

Tous dans `src/features/actus/components/`. Pas de librairie, pas de JS.

| Composant | Rôle | Props |
|---|---|---|
| `NewsHeader.astro` | En-tête de listing : étiquette, `h1`, phrase, catégories | `title`, `intro`, `active?: NewsCategory`, `counts` |
| `CategoryNav.astro` | Liens de catégories | `active?`, `counts` |
| `NewsLead.astro` | « À la une » : 1 grand + 2 | `articles: NewsSummary[]` (3) |
| `NewsCardLarge.astro` | Carte avec image 16:9, étiquette, titre, chapô | `article`, `eager?` |
| `NewsRow.astro` | Ligne compacte : vignette 96 px, étiquette, titre | `article` |
| `NewsDayGroup.astro` | Titre de jour + premier élément en carte, suivants en lignes | `day`, `articles` |
| `GamesInNews.astro` | Rangée « Jeux dans l'actu » | `games: NewsGame[]` |
| `GameCard.astro` | Carte jeu contextuelle d'un article | `game: NewsGame` |
| `RelatedNews.astro` | 3 articles associés | `articles` |
| `NewsPager.astro` | Précédent / suivant | `prev?`, `next?` |

`NewsCard.astro` est supprimé après migration (il est utilisé aussi par les pages auteur : prévoir de basculer ces pages sur `NewsRow`/`NewsCardLarge`, sans changer leur contenu).

## 3. Règles de sélection (calculées au build)

### R1. « À la une » (3 articles)

1. Candidats : les articles publiés dans les **48 dernières heures** ; s'il y en a moins de 3, les 3 plus récents.
2. Le **grand** : parmi les candidats, le plus récent qui a **une image de jeu** (pas un visuel de catégorie, c'est-à-dire `image.url` ne commençant pas par `/actus/`). Sinon, le plus récent.
3. Les **deux compacts** : les deux candidats suivants, en excluant le grand, avec **deux catégories différentes si possible**.
4. Ces 3 articles sont **retirés du flux** de la page 1 pour éviter les doublons.

### R2. Flux par jour

1. Tri par `date` décroissante.
2. Groupes par jour calendaire Europe/Paris : « Aujourd'hui », « Hier », puis « jeudi 22 octobre » (même année) ou « jeudi 22 octobre 2025 » (autre année).
3. Dans un groupe, le **premier** article passe en `NewsCardLarge`, les suivants en `NewsRow`.
4. Un groupe d'un seul article reste un groupe (pas de fusion), **sauf** pour les jours au-delà de 7 jours : ils sont regroupés sous « Plus tôt ».
5. Les jours sans article ne génèrent pas de titre.

### R3. « Jeux dans l'actu »

1. Jeux ayant au moins 1 article dans les **14 derniers jours**.
2. Tri par nombre d'articles décroissant, puis par date du dernier article.
3. Maximum **8**.
4. **Masquée si moins de 4 jeux.**
5. Chaque carte : couverture, nom, durée principale (`timeMainStory`), lien vers la fiche ; le lien « N actus » mène à `/jeu/<slug>` (la fiche porte déjà la section « X dans l'actu »).

### R4. Carte jeu d'un article

1. Affichée **si** `article.game` existe.
2. Contenu : couverture 72 x 96 px, nom, « Histoire principale : N h », « 100 % : N h », lien « Voir la fiche ».
3. Insertion : après le **2e paragraphe** du corps (après le 3e si le 2e est un intertitre) ; si le corps compte moins de 4 paragraphes, après le dernier.
4. **Jamais de carte vide ni de valeur inventée** : si une durée est `0` ou absente, la ligne correspondante n'est pas affichée ; si les deux sont absentes, pas de carte.
5. Le bloc final actuel « Combien de temps pour finir X ? → » est **supprimé** (remplacé par la carte).

### R5. Articles associés (3)

Cascade, sans doublon, sans l'article courant :

1. Même jeu (`game.slug`), du plus récent au plus ancien.
2. Même catégorie.
3. Plus récents.

On s'arrête à 3. Titre du bloc selon le critère dominant : « Dans l'actu de <jeu> » si au moins un article du même jeu, sinon « Dans la même rubrique : <catégorie> », sinon « À lire aussi ».

### R6. Précédent / suivant

Voisins directs dans la liste triée par date : « Plus ancien » et « Plus récent ». Absent aux extrémités.

## 4. Tailles et typographie

| Élément | Décision |
|---|---|
| Colonne de lecture | `max-width: 66ch` sur le corps (appliqué au conteneur, `ch` calculé sur la police du corps) |
| Corps | 18 px (`--font-size-lg`), 19 px à partir de 1 280 px |
| Interlignage du corps | 1,65 |
| Paragraphes | Espacement `--space-5` |
| `h1` article | 40 px desktop, 28 px mobile, `line-height: 1.15`, `text-wrap: balance` |
| Chapô | 20 px, `line-height: 1.5`, max 60ch |
| Intertitres `h2` | 26 px, marge haute `--space-10` |
| Image principale | 16:9, largeur du conteneur de l'en-tête (au plus 960 px), `fetchpriority=high`, `width`/`height` renseignés |
| Titre de carte large | 28 px desktop, 22 px mobile |
| Titre de ligne compacte | 18 px, 2 lignes au plus (`line-clamp: 2`) |
| Vignette de ligne | 96 x 96 px, `object-fit: cover` |
| Étiquette de catégorie | 12 px capitales, `letter-spacing: .08em`, 4,5:1 de contraste minimum |
| Titre de jour | 14 px capitales, filet fin au-dessus |
| Zone tactile | 44 x 44 px minimum |

**Principe.** La largeur se règle en `ch`, pas en `px` : la colonne reste correcte si la police ou la taille changent.

## 5. Comportements mobile (390 px)

| Zone | Comportement |
|---|---|
| Catégories | Rangée défilante, `overflow-x: auto`, `scroll-snap-type: x proximity`, élément actif visible au chargement |
| Une | Grand élément en pleine largeur ; deux compacts dessous |
| Lignes du flux | Vignette 80 px à gauche |
| « Jeux dans l'actu » | Rangée défilante, cartes de 140 px |
| Corps d'article | Pleine largeur moins 2 x 16 px |
| Carte jeu | Pleine largeur, en bloc |
| Précédent / suivant | Empilés, 48 px de haut |
| Pas de débordement horizontal | `scrollWidth <= innerWidth` à contrôler à 360 px et 390 px |

## 6. Accessibilité

| Point | Décision |
|---|---|
| Landmarks | `main` unique, `nav aria-label="Catégories"`, `nav aria-label="Articles précédent et suivant"` |
| Titres | Un seul `h1` ; titres de jour en `h2` ; titres de cartes en `h3` ; « Articles associés » en `h2` |
| Lien-carte | Le lien englobe **le titre uniquement** ; l'image est décorative (`alt=""`) ; le conteneur étend la zone de clic par `::after`. Le nom accessible est donc le titre seul (corrige L5) |
| Catégorie active | `aria-current="page"` |
| Focus | `:focus-visible` visible sur cartes, lignes, catégories, pager (outline 2 px, contraste 3:1) |
| Dates | `<time datetime>` ; texte « Aujourd'hui » / « Hier » + date complète dans l'attribut `title` ou dans un `<span class=sr-only>` |
| Images | `alt` fourni par `image.alt` ; la vignette d'une ligne est décorative |
| Mouvement | Aucune animation obligatoire ; `scroll-snap` seulement |
| Contraste | Corps ≥ 7:1 sur fond sombre (cible), étiquettes ≥ 4,5:1 |
| JS | Aucun requis |

## 7. SEO

| Point | Décision |
|---|---|
| Pages catégories | `title` « Actus <catégorie> » ; `description` propre ; canonical ; `prev`/`next` ; `CollectionPage` + `ItemList` + `BreadcrumbList` |
| Sitemap | Ajouter les pages catégories au sitemap général (le sitemap News reste réservé aux 48 h) |
| Article | Conserver `NewsArticle`, `about` (jeu), `max-image-preview:large`, `article:*` : rien à retirer |
| Carte jeu | Garder `about` → fiche ; le lien de la carte est un lien interne normal |
| Associés | Liens internes en HTML, ordre déterministe |
| `ItemList` du listing | Limité aux articles de la page ; inclure la une |
| Duplication | Les pages catégories ne dupliquent pas le contenu : extraits courts, `canonical` propre |
| Pagination | Conserver `rel=prev/next` ; `noindex` **non** appliqué |
| Titres de page | Pas de suffixe de page sur la page 1 |
| Images | `srcset` + `sizes` pour les vignettes (la vignette 96 px ne doit pas charger une image de 1 600 px) |

## 8. Performance

| Point | Budget |
|---|---|
| JS ajouté | 0 Ko |
| Images du listing | Une seule `eager` (la une) ; le reste `lazy` ; hauteur réservée |
| Vignettes | 192 px de large (x2) pour les lignes, 640 px pour la une |
| CLS | < 0,05 : dimensions des images et des cartes jeu fixées |
| LCP mobile | < 2,5 s ; l'élément LCP est l'image de la une ou le `h1` |

## 9. Ordre de réalisation proposé

| # | Lot | Dépend de |
|---|---|---|
| 1 | Colonne de lecture 66 ch, tailles, `h1`, chapô (D3) | — |
| 2 | Carte jeu (R4) et suppression de l'encadré final | `NewsGame` avec cover et durées |
| 3 | Associés (R5) et précédent / suivant (R6) | — |
| 4 | Composants de listing : une (R1), flux par jour (R2) | — |
| 5 | Routes `/actus/categorie/<slug>` et navigation de catégorie | 4 |
| 6 | Rangée « Jeux dans l'actu » (R3) | 2 |
| 7 | Contrôle : captures desktop 1440 / mobile 390, `scrollWidth`, `lighthouse`, JSON-LD | tous |

## 10. Questions ouvertes

1. **Libellé de la catégorie `autre`** (« Actu ») et de `promo` (« Bon plan ») : les garder comme étiquettes, ou les regrouper dans une seule entrée « Autres » du menu de catégories ?
2. **Taux de liaison** actu → fiche (15 %) : le pipeline (`scripts/news/game.ts`) est le levier, pas le design. À traiter séparément.
3. **Taille de page** du listing : 20 aujourd'hui ; après le regroupement par jour, 24 donne des groupes plus complets. À arbitrer.
4. **Pages auteur** : elles réutilisent `NewsCard` ; basculer leur gabarit sans changer leur contenu.
5. **Capture de l'existant** : `/actus` et un article n'ont pas été capturés ; à faire avant et après la refonte pour comparer à `screenshots/`.

## Écarts constatés à l'implémentation (24 octobre 2026)

Ce qui a été codé diffère sur quelques points des règles ci-dessus ; c'est le code qui fait foi.

| Règle | Prévu | Implémenté | Raison |
| --- | --- | --- | --- |
| R1, la une | 48 h, grand = plus récent avec image de jeu, 2 compacts de catégories différentes | 15 derniers articles, classés : lié à un jeu du catalogue > artwork réel > récence ; un seul article par jeu | Un test sur les données réelles montrait le même visuel Mass Effect trois fois |
| R2, le flux | 1er article du jour en carte, « Plus tôt » après 7 jours | Lignes compactes avec vignette, regroupées par jour (fuseau Paris), pas de « Plus tôt » | Simplicité ; 4 jours de données seulement |
| R3, jeux | 14 jours, 8 max, masquée sous 4 | 30 jours, 6 max, masquée si aucun jeu | Peu d'articles liés à un jeu ; une rangée de 6 reste utile |
| R4, carte jeu | Après le 2e paragraphe, remplace l'encadré final | En fin d'article, après le texte (le corps contient déjà une section « Combien de temps pour finir… ») | Le HTML du corps est pré-rendu, y insérer une carte demanderait de le découper |
| Mobile catégories | Rangée défilante | Puces qui passent à la ligne | Plus simple, sans JS |
