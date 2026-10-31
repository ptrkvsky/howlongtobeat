# Audit de l'existant : les actus de Game Over

> Audit du 24 octobre 2026.
> - **Méthode : lecture du code uniquement.** Aucune capture de l'existant n'a été produite. La consigne en cours de session était de ne pas capturer `/actus`, car les pages étaient en cours de modification. Les constats d'affichage ci-dessous sont donc des **déductions du CSS et du gabarit**, signalées comme telles.
> - **Version lue.** Les fichiers tels qu'ils étaient en début de session (dernier commit `aec092d`). L'arbre de travail a bougé pendant la session (`src/config/news.ts`, `src/features/actus/api.ts`, `Byline.astro`, `BaseLayout.astro`, `src/pages/actus/*` modifiés ; une feuille `news.module.css` apparaît). Ce qui suit décrit l'**état avant** ces modifications.
> - **Convention.** **Observé** = lu dans le code. **Lecture** = interprétation. Aucun fichier secret n'a été lu (pas de `.env`).
> - **Hors périmètre.** Les auteurs et la provenance éditoriale ne sont ni audités ni discutés ici.

## 1. Où vit le code

| Rôle | Fichier |
|---|---|
| Listing, paginé (`/actus`, `/actus/2`…) | `src/pages/actus/[...page].astro` (106 lignes) |
| Article (`/actus/<slug>`) | `src/pages/actus/[slug].astro` (103 lignes) |
| Flux RSS, sitemap Google News | `src/pages/actus/rss.xml.ts`, `src/pages/actus/sitemap.xml.ts` |
| Accès aux données (build) | `src/features/actus/api.ts` |
| Carte de listing | `src/features/actus/components/NewsCard.astro` |
| Signature, boîte auteur | `Byline.astro`, `AuthorBox.astro` (non traités ici) |
| Dates | `src/features/actus/format.ts` |
| Styles | `src/styles/actus.module.css` (322 lignes) |
| Types, catégories, libellés | `src/config/news.ts` |
| Taille de page | `src/config/pagination.ts` : `NEWS_PAGE_SIZE = 20` |
| Bloc « sur la fiche du jeu » | `src/features/jeu/components/GameNews.astro` |
| Schéma | `src/db/schema.ts:220` (`news_article`) |
| Pipeline | `scripts/publish-news.ts` (377 lignes), `scripts/news/image.ts`, `scripts/news/game.ts` |
| SEO | `src/layouts/BaseLayout.astro`, `src/utils/structuredData.ts` (`newsArticleNode`) |

## 2. Schéma `news_article`

| Colonne | Type | Remarque |
|---|---|---|
| `id`, `slug` (unique), `source_key` (unique), `source_url` | serial, text | `source_url` « jamais affiché ni lié » |
| `title`, `excerpt`, `content_html` | text | HTML rendu par le script, sans HTML brut du modèle |
| `category` | enum | `sortie`, `mise-a-jour`, `annonce`, `materiel`, `industrie`, `promo`, `autre` |
| `author` | enum | non traité |
| `image` | jsonb `{url,width,height,alt}` | URL absolue, ou image de catégorie `/actus/<categorie>.webp` (1600 x 900) |
| `game_id` | FK nullable vers `game`, `ON DELETE SET NULL` | seul lien actu → fiche |
| `is_published` | boolean | dépublication manuelle |
| `published_at` | timestamptz | tri principal |

**Observé.** Il n'y a ni colonne de sujet, ni tags, ni « une / épinglé », ni image portant une origine (le script choisit IGDB, Steam ou une image de catégorie). **Lecture.** Tout ce qui est « mise en avant » doit donc être **calculé au build** à partir de ces colonnes ; aucune migration n'est nécessaire pour le listing.

## 3. Pipeline `scripts/publish-news.ts`

| Fait observé | Conséquence UX |
|---|---|
| Exécuté **toutes les heures** par un timer systemd, puis redéploiement du site | Le contenu change en continu : pas d'édition manuelle d'une « une » |
| **3 articles maximum par exécution** (`MAX_WRITES_PER_RUN`), 48 h de fenêtre source | Flux de 0 à 3 articles par heure ; rythme irrégulier |
| Contenu de **400 à 900 mots** (garde-fou : 350 à 1 000) avec 3 ou 4 intertitres `##` | Articles moyens à longs : la colonne de lecture compte |
| Dernière section « Combien de temps pour finir X ? » rédigée **uniquement si une fiche du jeu est trouvée** | Le texte fait déjà un renvoi vers la durée, mais seulement quand `game_id` est renseigné |
| Titre ≤ 70 caractères, chapô ≤ 220 caractères | Gabarits de titre prévisibles : on peut dimensionner |
| Image : IGDB ou Steam (1920 x 1080 max), sinon visuel de catégorie 1600 x 900 | Images **génériques répétées** pour les articles sans jeu (déduit de `categoryImage`) |
| Liens et images du texte supprimés ; `{{video:…}}` conservés en iframes | Pas de lien sortant dans le corps : les liens internes sont à créer par le gabarit |

**Chiffres fournis par la demande.** Environ 60 articles, dont 15 % liés à une fiche jeu (soit environ 9). Non revérifiés en base dans cette session.

## 4. Le listing `/actus`

**Observé dans le code.**

- Titre de page : composant `HomeTitle` « Actus », sous un fil d'Ariane.
- Une ligne « Mis à jour le 19 octobre 2026 à 21:35. » issue du plus récent article.
- Une `<ol>` à **20** éléments, grille d'une colonne avec `gap` constant (`--space-5`).
- Chaque élément est un `<li class=card>` bordé, qui contient **un seul lien** `<a class=link>` enveloppant l'image, la ligne de méta, le `<h2>` et le chapô.
- Grille interne `320px 1fr` ; une colonne sous 766 px.
- Image : `width=320 height=180`, `loading=eager` pour le premier seulement.
- Méta : « Catégorie · 21 octobre 2026 à 09:01 · par Auteur » en un seul paragraphe.
- Titre en `--font-size-xl` (1,25 rem = 20 px), chapô en `line-height-7`.
- Pagination `/actus/2`… avec `rel=prev/next`.
- Aucun filtre, aucun regroupement, aucune mise en avant.

| # | Problème (déduit) | Gravité | Preuve |
|---|---|---|---|
| L1 | **Aucune hiérarchie.** Le premier article pèse autant que le vingtième : même carte, même taille, même image | Haute | `.list` + `.card` uniques dans `actus.module.css` |
| L2 | **Aucun accès par catégorie, par jeu ou par sujet.** 7 catégories existent en base et n'ont pas de page | Haute | Aucune route `actus/categorie/*` dans `src/pages/actus` |
| L3 | **Le lien jeu est invisible dans le listing.** Un article lié à une fiche est indiscernable d'un autre | Haute | `NewsCard.astro` ne lit pas `game` |
| L4 | **Méta trop longue** : catégorie + date longue + heure + auteur sur une ligne, en gris clair | Moyenne | `.date` en `--font-size-md`, `color-gray-400` |
| L5 | **Lien-bloc long** : le nom accessible du lien est la concaténation de la méta, du titre et du chapô | Moyenne | `<a>` autour de tout le contenu |
| L6 | **Images génériques répétées** : sans jeu, la carte porte un visuel de catégorie identique | Moyenne | `categoryImage()` dans `scripts/news/image.ts` |
| L7 | **Dates absolues avec heure** sur chaque carte : pas de rythme visuel par jour | Moyenne | `formatDate` (`dateStyle: long`, `timeStyle: short`) |
| L8 | **Pagination `/actus/2`** : les pages profondes perdent la « fraîcheur » et ne se distinguent que par leur titre « Page N » | Basse | `pageSuffix` |
| L9 | `width="320" height="180"` fixes dans l'attribut alors que la colonne CSS est fluide sur mobile : l'image est rognée par `object-fit: cover` | Basse | `.image` `aspect-ratio: 16/9` |
| L10 | La ligne « Mis à jour le … » ne dit pas ce qui est nouveau (pas de regroupement « aujourd'hui / hier ») | Basse | `latest.date` |

## 5. La page article `/actus/<slug>`

**Observé dans le code.** Dans l'ordre : fil d'Ariane, `h1`, signature, chapô (`excerpt`), image 16:9 pleine colonne, corps HTML, lien vers la fiche (si `game`), boîte auteur, lien « ← Toutes les actus ».

| Propriété | Valeur lue | Lecture |
|---|---|---|
| Largeur de la colonne | `.article { max-width: 800px }` | En police 18 px, **environ 75 à 85 `ch`** (estimé : 800 px / (18 px x 0,5 à 0,55) ; **non mesuré**, la police du site n'est pas chargée dans cette session). Au-dessus des 50 à 71 ch observés chez les références. |
| Police du corps | `--font-size-lg` = 1,125 rem = **18 px** | Dans la norme des références (18 px modal) |
| Interlignage | `1.7` | Au haut de la fourchette des références (1,4 à 1,7) |
| Couleur | `--color-white-alpha-800` sur fond sombre | Contraste non mesuré |
| `h1` | `--font-size-4xl`, `line-height: 1.2`, 2xl sous 766 px | |
| Chapô | `--font-size-xl`, `line-height: 1.5` | Répété sur la carte et la meta description |
| Image | `fetchpriority=high`, 16:9, arrondie | Image de catégorie quand pas de jeu |
| Intertitres `h2`/`h3` | `2xl`/`xl`, marge haute `--space-8` | Correct |
| Lien vers la fiche | Un encadré « Combien de temps pour finir X ? → » **après** le corps | Aucune donnée affichée |
| Articles associés | **Aucun** | |
| Précédent / suivant | **Aucun** | |
| Boîte auteur | Présente (hors périmètre) | |
| Retour | « ← Toutes les actus » | |

| # | Problème (déduit) | Gravité | Preuve |
|---|---|---|---|
| D1 | **Le différenciateur (durée de jeu) n'apparaît pas.** Le lien vers la fiche ne donne ni heures ni cover, et arrive après le corps | Haute | `.game` dans `[slug].astro` |
| D2 | **Aucun article associé** : un lecteur qui termine un article n'a que « Toutes les actus » et la boîte auteur | Haute | Absent du gabarit |
| D3 | **Mesure trop large** (~75–85 ch estimés) | Moyenne | `max-width: 800px` en 18 px |
| D4 | Le **chapô répété** : il apparaît en tête d'article puis dans les métadonnées ; les 85 % d'articles sans jeu n'ont rien d'autre que ce chapô avant l'image | Basse | `lead` |
| D5 | **Fil d'Ariane de 3 niveaux** pour un article : prend la place du premier écran sans fonction forte | Basse | `Breadcrumb` |
| D6 | Pas de **navigation vers la catégorie** de l'article (l'étiquette est du texte) | Moyenne | `Byline` affiche `newsCategoryLabels` en texte |
| D7 | Pas de hiérarchie de **temps de lecture** : un article de 900 mots n'annonce pas sa durée | Basse | Pas de champ |
| D8 | Vidéos : `iframe` 16:9 sans titre ni `loading=lazy` (le gabarit ne fixe pas les attributs, ils viennent du HTML généré) | À vérifier | `.content iframe` |

## 6. Lien actu ↔ fiche jeu

| Sens | Existant (observé) | Limite |
|---|---|---|
| Actu → fiche | Encadré « Combien de temps pour finir X ? » en bas d'article, si `game_id` est renseigné et si le jeu est publié | Seulement ~15 % des articles ; texte sans chiffre |
| Fiche → actus | `GameNews.astro` : section « X dans l'actu », 5 articles max, **titre, étiquette, date, chapô, sans image** | Fait le travail ; manque la ligne durée |
| Dans le texte | La dernière section de l'article recopie les durées, **en prose** | Pas cliquable, pas structurée |

**Lecture.** Le lien existe dans les deux sens, mais il est **plat** : la valeur de Game Over (les heures) n'y circule pas. Le taux de 15 % est le principal verrou : il vient du rapprochement titre → fiche dans `scripts/news/game.ts`, pas du design.

## 7. SEO

| Élément | Observé dans le code |
|---|---|
| `canonical` | Oui, par page |
| `prev` / `next` | Oui sur le listing (`link rel`) |
| `robots` | `max-image-preview:large` quand `largeImagePreview` (articles) |
| Open Graph | `og:type=article`, `og:image`, `article:published_time`, `modified_time`, `author`, `section` |
| Twitter | `summary_large_image` quand l'image est grande |
| JSON-LD article | `NewsArticle` : headline, image (url, width, height), `datePublished`, `dateModified`, `articleSection`, `wordCount`, `isAccessibleForFree`, `about` (nœud `Game` quand lié), `author`, `publisher` ; + `WebPage`, `BreadcrumbList`, `Person`, `Organization`, `WebSite` |
| JSON-LD listing | `CollectionPage` + `ItemList` (avec `start` et `total`) |
| Flux | `link rel=alternate` vers `/actus/rss.xml` ; sitemap Google News des 48 dernières heures |
| Discover | Image 1 200 px minimum respectée (visuels 1 600 px ou IGDB 1 920 px) |

**Lecture.** Le SEO est **déjà solide** : rien à défaire. Ce qui manque sont des **pages d'agrégation** (catégories, jeux) qui n'existent pas, donc aucune URL pour des requêtes comme « actus Call of Duty » ; et un `ItemList` n'est limité qu'à la page courante.

## 8. Performance et accessibilité (par lecture du code)

| Sujet | Constat |
|---|---|
| JS | Aucun JS applicatif dans les gabarits d'actus (pages statiques Astro) ; le JS global du site (GTM) s'ajoute |
| Images | Listing : 20 images `lazy` sauf la première ; article : image `fetchpriority=high`. Pas de `srcset` dans `NewsCard` : une image de 1 600 à 1 920 px est servie pour une vignette de 320 px |
| `h1` | Un seul `h1` par page (`HomeTitle` sur le listing, `articleTitle` sur l'article) |
| Landmarks | `LayoutFront` fournit la structure ; non vérifié ici |
| Liens | Carte entièrement cliquable : le nom accessible est long (L5) ; pas de `aria-label` |
| Focus | `.card:hover` change la bordure ; **aucun style `:focus-visible` propre à la carte** n'est dans la feuille |
| Dates | `<time datetime>` partout : bon |

## 9. Synthèse

| À conserver | À corriger |
|---|---|
| Pages statiques, SEO complet, `time`, un seul `h1`, JSON-LD, RSS et sitemap News | Hiérarchie du listing (L1), entrées par catégorie / jeu (L2, L3), images répétées (L6) |
| 18 px, interlignage 1,7, intertitres | Mesure de lecture trop large (D3) |
| Section « X dans l'actu » sur la fiche | Valeur « durée » absente de l'article (D1), pas d'associés ni de précédent/suivant (D2) |

**Point d'attention.** Les changements ci-dessus s'appuient sur un listing dont l'**affichage réel n'a pas été capturé**. Avant d'aller plus loin, une capture de `/actus` et d'un article après les modifications en cours (desktop 1440, mobile 390) permettra de comparer avec les 48 captures du benchmark.
