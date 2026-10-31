# Benchmark UX/UI des actualités gaming

> Observations du 24 octobre 2026.
> - **Outil.** Chrome 156 en mode headless piloté par Playwright (`playwright-core`), à 1440 x 900 (desktop) et 390 x 844 (mobile, UA iPhone, tactile). Le MCP `chrome-devtools` était indisponible (« browser already running » sur son profil) : le repli a été un Chrome local, avec le même moteur. `curl` a servi pour le HTML brut. Une recherche web a servi pour la fiche des indépendants.
> - **Convention.** **Observé** = constaté dans le navigateur ou dans le DOM, à la date ci-dessus. **Lecture** = interprétation.
> - **Captures.** [`screenshots/`](screenshots/) : `<site>-<listing|article>-<desktop|mobile>.png`, soit 48 fichiers. Ce sont des captures du **premier écran** (pas de pleine page). Elles ont été prises après une tentative automatique de fermeture du bandeau cookies : quand elle a échoué, le bandeau est visible sur la capture (voir « Limites »).
> - **Mesures de lecture.** Taille de police, interlignage et largeur en `ch` sont lus par `getComputedStyle` sur un paragraphe du corps de l'article (le deuxième paragraphe long du bloc de texte principal). La largeur en `ch` est la largeur du paragraphe divisée par la largeur du caractère « 0 » dans la police du paragraphe. Un script a été relu sur les 12 sites, mais le détail des cas où la mesure est douteuse est donné plus bas.
> - **Même actualité.** Quand c'était possible, l'article lu traite de la fermeture de BioWare / Mass Effect 5 (actu du 23 octobre), pour comparer à sujet égal.

## 1. Les 12 références

| # | Référence | Pourquoi | Listing consulté | Article consulté |
|---|---|---|---|---|
| 1 | IGN France | Seule référence francophone généraliste, très grosse audience | https://fr.ign.com/ (l'accueil sert de flux ; pas de `/actus`) | https://fr.ign.com/mass-effect-next-chapter/93343/bioware-ferme-ses-portes-le-prochain-mass-effect-est-annule |
| 2 | GameSpot | La source du pipeline de Game Over ; référence « actus + fiches jeu » | https://www.gamespot.com/news/ (redirigé vers `/category/news/`) | https://www.gamespot.com/articles/the-next-mass-effect-sounded-like-john-wick-in-space/ |
| 3 | Polygon | Groupe Valnet (mention vue dans le bandeau de consentement), sobre et typographique | https://www.polygon.com/news (redirigé vers `/news/`) | https://www.polygon.com/mass-effect-5-leaked-plot-details-john-wick-james-bond-in-space/ |
| 4 | Eurogamer | Listing avec filtres genre / plateforme | https://www.eurogamer.net/news | https://www.eurogamer.net/mass-effect-battlefield-6-crossover-bioware-closure |
| 5 | PC Gamer | Navigation « par type d'article » | https://www.pcgamer.com/news/ | https://www.pcgamer.com/gaming-industry/rip-bioware-ea-has-shut-down-the-legendary-rpg-developer/ |
| 6 | Rock Paper Shotgun | Média PC éditorialisé, liste dense | https://www.rockpapershotgun.com/news | https://www.rockpapershotgun.com/bioware-staff-should-be-given-the-first-opportunity-and-the-federal-support-to-buy-the-studio-and-keep-it-running-says-canadian-political-party-leader |
| 7 | The Verge (rubrique Gaming) | Grand média tech, identité typographique forte | https://www.theverge.com/games | https://www.theverge.com/games/1016134/xbox-helix-price-1800-isnt-affordable-editorial |
| 8 | Wired | Référence de lecture longue | https://www.wired.com/category/culture/ (**pas gaming**, voir limites) | https://www.wired.com/story/a-dating-app-is-offering-chivalry-mode-and-marriage-timeline-to-get-gen-z-married/ (**pas gaming**) |
| 9 | The Pudding | Presse à données, éditorialisation par projet | https://pudding.cool/ | https://pudding.cool/2026/10/kevin-bacon/ |
| 10 | Aftermath | Indépendant, né en novembre 2023 : média détenu par ses salariés, financé par les lecteurs, fondé par d'anciens de Kotaku ([source](https://waxy.org/2023/11/ex-kotaku-staffers-launch-aftermath-a-worker-owned-reader-supported-videogame-news-site)) | https://aftermath.site/ | https://aftermath.site/steam-indie-game-ai-clone-copy/ |
| 11 | Kotaku | Média historique, ancien employeur des fondateurs d'Aftermath | https://kotaku.com/latest | https://kotaku.com/mass-effect-5-bioware-closure-universe-legendary-edition-2000749192 |
| 12 | 404 Media | Indépendant, cité par Aftermath parmi ses modèles de propriété | https://www.404media.co/ | https://www.404media.co/php2shell-black-october-ai-is-changing-everything-about-hacking-no-one-knows-what-happens-next/ |

Les 12 listings et les 12 articles ont répondu en HTTP 200 dans Chrome (statut lu sur la navigation). Pas de pare-feu de paiement bloquant la lecture.

> Les références 10 à 12 ne sont pas des « tendances de la semaine » : ce sont des indépendants récents (Aftermath, 404 Media) ou relancés (Kotaku) qui s'écartent du modèle publicitaire des grands groupes. Ils servent de contrepoint à la ligne Valnet / Future / Ziff.

## 2. Listing : ce qui a été vu

### 2.1 Hiérarchie, mise en avant, densité

| Site | H1 de la page | Mise en avant (Observé) | Forme d'un élément courant (Observé) | Dates |
|---|---|---|---|---|
| IGN FR | « IGN France en live - Suivez-nous ! » (48 px) | Un visuel plein cadre avec le titre en surimpression, centré (lors de la visite : un contenu de boutique IGN, pas une actu) | 55 éléments `article` sur la page ; image + titre ; le titre est suivi d'un sous-titre | `time` présent |
| GameSpot | « Gaming & Entertainment News » (46 px) | 1 grande image à gauche + 3 éléments empilés à droite (vignette + titre) ; bandeau « Trending » au-dessus | Meta en police monospace : « 17 HRS AGO \| Eddie Makuch » | Relatif (« HRS AGO ») |
| Polygon | « News » (43 px, Montserrat) | **2 grandes unes côte à côte**, image arrondie, titre très gras souligné, auteur en capitales | Sections « LATEST » et « MOST POPULAR » | Absente sur le premier écran |
| Eurogamer | « Video Game News » (24 px, centré) | Aucune une visible au premier écran ; **filtres Genre / Plateforme** (deux `select`) | Vignette à gauche, étiquette « News », titre, chapô, date, auteur, nombre de commentaires | Absolue (« Oct. 23, 2026 ») |
| PC Gamer | « News » (28 px, Roboto Condensed) | Bloc « Editor's Picks » (3 visuels), bande « POPULAR » | Bloc « **EXPLORE BY ARTICLE TYPE** » : 5 boutons (Gaming industry news, Gaming news, Hardware news, Movies & TV news, Software news) | Relative (« 3 days ago ») dans l'article |
| Rock Paper Shotgun | « PC Gaming News » (24 px) | Aucune une : liste uniforme | Image à gauche, étiquette « News », titre souligné, chapô, date, auteur, commentaires | Absolue |
| The Verge | « Gaming » (**160 px**, police Manuka, sur fond violet plein écran) | Le titre de rubrique occupe tout le premier écran ; bouton « Follow » ; description de la rubrique | Sections « LATEST IN GAMING », « MOST POPULAR » | `time` présent |
| Wired | « Culture » (54 px) | Une grande image + une secondaire, bandeau événementiel au-dessus | — | Pas de `time` sur le listing |
| The Pudding | **Aucun `h1`** | Grille de 3 colonnes de cartes **numérotées** (« #226 · OCT 2026 ») | Vignette colorée, titre en minuscules, une ligne de résumé | Mois et année |
| Aftermath | « Latest » (36 px) | 1 grande image (2/3) à gauche + 1 carte image et 2 lignes vignette à droite | Étiquette rose (VIDEO GAMES, IMPRESSIONS), titre, chapô d'une ligne, « by NOM · 23 OCT 2026 », nombre de commentaires | Absolue |
| Kotaku | **Aucun `h1`** | Liste en une colonne, pas de une | Image à gauche, étiquette (GAMES, OPINION, CULTURE NEWS), titre en italique gras, chapô, « By Nom Published October 23, 2026 » | Absolue |
| 404 Media | **Aucun `h1`** (au moment de la mesure) | Un gros visuel à la une, texte à gauche | « Behind the Blog », titre, chapô, auteurs, date | Absolue |

**Lecture.** Trois familles de listing se dégagent.

| Famille | Sites | Ce qu'elle apporte | Ce qu'elle coûte |
|---|---|---|---|
| Une + colonne latérale | GameSpot, Aftermath, Polygon (2 unes) | Hiérarchie lisible en 1 seconde | Demande de choisir quoi est « la une » |
| Liste uniforme | RPS, Kotaku, Eurogamer | Chronologie honnête | Aucune hiérarchie ; tout pèse pareil (c'est l'existant de Game Over) |
| Éditorialisation par projet | The Pudding, The Verge (titre de rubrique géant) | Identité mémorable | Peu de contenu visible au premier écran |

**Observé : aucun des 12 listings ne regroupe le flux par jour.** Toutes les références alignent les articles sans en-tête de date.

### 2.2 Navigation par thème, jeu, catégorie

| Site | Navigation thématique observée |
|---|---|
| IGN FR | Panneau latéral fixe à gauche, 13 entrées (Accueil, IGN Store Europe, « GTA 6, toutes les infos », Tests & Critiques, Discord, Ciné/Séries/Anime, Comics & mangas, Tech & Gadgets, Le Cri du Mochi, PS5, Xbox X\|S, PC, Switch, Plus…). **L'URL des articles contient le jeu** : `/mass-effect-next-chapter/93343/…`. L'article affiche un surtitre rouge « MASS EFFECT 5 ». |
| GameSpot | Menu News / Reviews / Guides / What to Play / Videos / More ; sous-menu plateformes (PlayStation, Xbox, Nintendo, PC, Mobile) ; bandeau « Trending » de 5 sujets (BioWare Shut Down, Final Fantasy Resonance Review…). 25 liens de tags sur le listing. |
| Polygon | Bandeau de 4 sujets sous le logo : Zelda · GTA 6 · Guides · Pokémon ; menu What To Play / What To Watch / News / Reviews / Previews / Features. Bouton « Follow » sur la page. |
| Eurogamer | Menu Latest / PC / PlayStation / Xbox / Nintendo / Tech / News / Reviews / Features / Guides ; **filtres genre et plateforme** sur le listing. |
| PC Gamer | « Explore by article type » (5 types) + bande « POPULAR » de sujets (RAMpocalypse support, Modern Warfare 4, GTA 6, Clips, Quizzes). 111 liens de type tag/catégorie sur la page. |
| Rock Paper Shotgun | Bande de 6 guides populaires + menu (Latest, News, Reviews, Hardware, Features, Videos, Guides, Bestest Bests). |
| The Verge | Rubriques techno ; sur la page jeu, bouton « Follow », 62 liens de type tag. |
| Aftermath | Menu About Us / Video Games / Features / Labor / Internet / Anime ; étiquette rose cliquable sur chaque élément. |
| Kotaku | Menu LATEST / ENTERTAINMENT / REVIEWS / NEWS / TIPS & GUIDES / GAMES / DOWNLOADS / DEALS ; **pagination numérotée** « PAGE 2 … PAGE 6 ». |
| The Pudding | Recherche (« Find a story… ») + filtre ; pictogrammes Our faves / Popular / Updating / Your input / Video / Audio. |

**Lecture.** Le **jeu** comme porte d'entrée n'existe vraiment que chez IGN (URL + surtitre) et, de façon plus discrète, chez GameSpot (voir 3.5). Les catégories par **type d'article** (PC Gamer) sont l'équivalent le plus proche des 7 catégories de Game Over (sortie, mise à jour, annonce, matériel, industrie, bon plan, actu).

### 2.3 Lisibilité des titres et des métadonnées

| Site | Titre de carte (Observé) | Métadonnées (Observé) |
|---|---|---|
| GameSpot | Gras, 3 lignes sur la une | Monospace petite, relative + auteur |
| Polygon | Montserrat extra-gras, souligné en permanence | Auteur en capitales espacées |
| RPS | Gras, souligné | Date, auteur, nombre de commentaires sur une ligne |
| Aftermath | Chakra Petch (titres), taille ~24 px sur la une | Étiquette rose + date en capitales + auteur |
| Kotaku | Italique gras, grande taille | Étiquette de rubrique rouge, « By » + date |
| The Pudding | Minuscules, graisse forte | Numéro et mois en capsule |

**Lecture.** Les médias qui s'en sortent le mieux sur la lecture rapide donnent à chaque élément **une étiquette (rubrique) + un titre + une phrase**, et gardent la date discrète. Les métadonnées à rallonge (date longue + heure + auteur) n'apparaissent sur aucun listing.

## 3. Article : ce qui a été vu

### 3.1 Lecture longue, mesures

| Site | Police du corps | Taille | Interlignage | Ratio | Largeur (ch, desktop) | Taille / police du `h1` |
|---|---|---|---|---|---|---|
| IGN FR | Inter Var | 17 px | 28,9 px | 1,70 | 64,8 | 48 px, Inter Var |
| GameSpot | Kanit | 18 px | 28 px | 1,56 | 54,6 | 46 px, Kanit |
| Polygon | Georgia | 18 px | 28,8 px | 1,60 | **97,2** | 44 px, Montserrat |
| Eurogamer | Gibson | 17 px | 23,8 px | 1,40 | 57,2 | 34 px, Gibson |
| PC Gamer | Open Sans | 16 px | 24 px | 1,50 | 65,8 | 42 px, Roboto Condensed |
| Rock Paper Shotgun | Rubik | 17 px | 23,8 px | 1,40 | 63,9 | 34 px, Rubik |
| The Verge | fkRoman | 18 px | 28,8 px | 1,60 | 50,6 | 44 px, polySans |
| Wired | Breve Text (serif) | 19 px | 28 px | 1,47 | 53,7 | 54 px, WIRED Display |
| The Pudding | Atlas Grotesk | 24 px | 31,2 px | 1,30 | 50,0 | 48 px, Tiempos Text |
| Aftermath | Roboto | 18 px | 28,8 px | 1,60 | 67,2 | 36 px, Chakra Petch |
| Kotaku | Georgia | 18 px | 29 px | 1,61 | 71,1 | 55 px, Work Sans |
| 404 Media | Inter | 17,6 px | 30 px | 1,70 | 60,4 | 70,6 px, Space Grotesk |

**Observé.**
- Taille du corps : de 16 à 19 px, **18 px est la valeur modale** (5 sites sur 12). The Pudding monte à 24 px pour son texte de récit.
- Interlignage : de 1,40 à 1,70. Les sites qui lisent le mieux dans nos captures (Aftermath, Kotaku, 404 Media, IGN) sont à 1,6 – 1,7 ; Eurogamer et RPS sont à 1,4.
- Largeur : médiane des 11 mesures hors Polygon = **60 ch**, étendue de 50 à 71 ch. **Polygon est l'exception à 97 ch** sur la mesure desktop, à cause d'un paragraphe très large (875 px) en 18 px.
- Sur mobile, le corps passe à 16 – 19 px sur les sites mesurés (IGN 18, GameSpot 16,3, Polygon 19, PC Gamer 18, Aftermath 18, Kotaku 18, 404 Media 17,6) et la largeur tombe à **30 – 40 ch** : c'est la contrainte de l'écran, pas un choix de design.

**Limites de la mesure.**
- Les largeurs mobiles en `ch` d'Eurogamer et de RPS (91,8) sont **incohérentes** (le script mesure avec la police du paragraphe avant le chargement de la police web) : elles sont ignorées.
- GameSpot, Polygon, Verge, PC Gamer, Wired, Kotaku et Eurogamer affichent des publicités et des colonnes latérales : la largeur de colonne est celle du bloc de texte, pas celle de la page.
- L'article de **Wired** et celui de **Pudding** ne sont pas des brèves : Wired est un long format (hors jeu), Pudding est un récit interactif défilant où le texte est composé en scènes.

### 3.2 Image principale, médias

| Site | Observé |
|---|---|
| IGN FR | Pas d'image avant le texte au premier écran ; sous-titre court (« EA licencie près de 400 employés. »), ligne d'auteur, texte. Un bloc « **Articles reliés** : titre souligné » est inséré **dans le corps, avant le premier paragraphe**. Bandeau publicitaire (« IGN Store Europe ») au-dessus du titre. |
| GameSpot | Chapô en **monospace** (« Mass Effect Universe would have reportedly mixed covert ops… »), signature « By Darryn Bonthuys on October 23, 2026 at 10:31AM PDT », boutons « Share » et « Follow Us » ; pas d'image avant le texte au premier écran. |
| Polygon | Image pleine largeur de la colonne **avant** le texte, crédit d'image en haut à droite (« Image: BioWare »), carte d'auteur (photo, nom, date, bio courte) à droite de l'image. |
| Eurogamer | Colonne gauche « LATEST NEWS » (liste de titres) à côté du texte ; visuel après le titre ; sous-titre court (« Anti-biotic. »). |
| PC Gamer | Fil d'Ariane réduit à une étiquette (« Gaming Industry », « News »), chapô, signature « By Tyler Wilde Published 3 days ago », grand visuel composite. |
| Verge | Étiquettes de rubrique (« GAMING +TECH +COLUMN »), titre, visuel en miniature à côté du chapô (« Didn't Microsoft say the next Xbox needed to be affordable? ») |
| Aftermath | Grande image **avant** le texte. Un **encart rose « Sign up for free »** (lecture limitée à quelques articles gratuits, puis inscription) s'affiche en bas du premier écran desktop. |
| Kotaku | Étiquette rouge « COMMENTARY » au-dessus du titre centré ; **un lecteur vidéo flottant** (« New Mass Effect 5 Leak Explains… ») se superpose au bas de l'écran, (présent sur desktop et mobile). |
| 404 Media | Titre en 70 px sur fond noir ; **fenêtre modale « Keep reading with your email. It's free »** par-dessus le texte (fermable). |

### 3.3 Articles associés

| Site | Observé (titres de sections de l'article ou bloc visible) |
|---|---|
| IGN FR | « Articles reliés » **dans le corps**, en tête de texte (un seul lien) ; aucun autre bloc détecté |
| GameSpot | « **Related Tags** », « Popular Stories », « **Latest on Featured Games** » : le dernier regroupe les actus du jeu |
| Polygon | « MOST POPULAR » uniquement (pas de module « même sujet » détecté) |
| Eurogamer, RPS | Aucun bloc « associés » détecté par titre ; colonne « Latest news » chez Eurogamer |
| PC Gamer | Aucun titre détecté ; 14 éléments `aside` (publicités, recommandations) |
| The Verge | « **More in Gaming** », « MOST POPULAR » |
| Wired | « **You Might Also Like** » |
| Aftermath | « **More in AI** » (même rubrique), « **More from Luke Plunkett** » (même auteur) |
| Kotaku, 404 Media | Aucun détecté par titre |

**Lecture.** Les critères de rapprochement observés sont : **même rubrique** (Verge, Aftermath), **même sujet / jeu** (IGN, GameSpot), **populaires** (Polygon, Verge), **même auteur** (Aftermath). Aucune référence ne combine plusieurs critères en cascade.

### 3.4 Précédent / suivant

**Observé : aucun des 12 articles ne présente de navigation « article précédent / suivant »** détectée dans le DOM ou à l'écran. Les médias remplacent cette fonction par des modules « more in … » ou « popular ».

### 3.5 Navigation actu ↔ fiche jeu

| Site | Observé |
|---|---|
| GameSpot | Le **JSON-LD de l'article contient un nœud `VideoGame`** (en plus de `NewsArticle`, `Person`, `VideoObject`) et un module « Latest on Featured Games ». Le jeu est donc une entité de données, mais je n'ai pas relevé de **carte jeu visible avec des chiffres** dans la zone lue. |
| IGN FR | Le jeu est dans l'URL et en surtitre rouge ; je n'ai pas suivi le lien du surtitre. |
| Autres | Aucune carte de jeu ; liens contextuels dans le texte seulement. |

**Observé : aucune des 12 références n'affiche une durée de jeu dans un article d'actualité.** C'est l'espace de différenciation de Game Over.

### 3.6 Accessibilité, SEO, poids

| Site | `h1` (article) | Landmarks article (header / nav / main / aside / footer) | Images sans attribut `alt` (article) | JSON-LD de l'article | Texte dans le HTML brut (`curl`) |
|---|---|---|---|---|---|
| IGN FR | 1 | 1 / **0** / **0** / 2 / 1 | 1 | NewsArticle, BreadcrumbList | oui (16 `<p>`) |
| GameSpot | 1 | 2 / 10 / 1 / 3 / 2 | 3 | NewsArticle + VideoGame + Person + ... | **non vérifié : `curl` reçoit un 403** (anti-robot) ; Chrome affiche l'article |
| Polygon | 1 | 2 / 6 / 1 / 5 / 2 | 0 | NewsArticle, Organization, BreadcrumbList | oui (43 `<p>`) |
| Eurogamer | **2** | 3 / 10 / 1 / 1 / 1 | 0 | NewsArticle, BreadcrumbList | oui (15 `<p>`) |
| PC Gamer | 1 | 2 / 9 / 1 / 14 / 2 | 5 | NewsArticle, WebPage, BreadcrumbList | oui (64 `<p>`), HTML de **2 Mo** |
| RPS | 1 | 2 / 11 / 1 / 2 / 2 | 7 | NewsArticle, BreadcrumbList | oui (17 `<p>`) |
| The Verge | 1 | **0** / 4 / 1 / 12 / 1 | 5 | NewsArticle, BreadcrumbList | oui (75 `<p>`) |
| Wired | 1 | 3 / 8 / 1 / 3 / 1 | 0 | NewsArticle, BreadcrumbList | oui (31 `<p>`), HTML de **1,5 Mo** |
| The Pudding | 1 | 1 / 0 / 1 / 0 / **0** | 0 | aucun | oui (47 `<p>`) |
| Aftermath | 1 | 1 / 8 / 1 / 0 / 1 | 0 | Article | oui (19 `<p>`) |
| Kotaku | 1 | 1 / 2 / 1 / 0 / 1 | 0 | Article, WebPage, Person, ... | oui (29 `<p>`) |
| 404 Media | 1 | 1 / 1 / 1 / 1 / 1 | 2 | Article | oui (18 `<p>`) |

**Observé, poids et JS (articles, desktop, Chrome).** Les compteurs incluent les régies publicitaires, et varient d'un chargement à l'autre (Eurogamer : 72, 354 et 419 requêtes sur trois passes).

| Site | Requêtes (dernier passage) | Fichiers JS chargés |
|---|---|---|
| The Pudding | 20 | 11 (1 balise `script` externe) |
| Eurogamer | 72 | 26 |
| Aftermath | 52 | 18 (14 balises `script` externes) |
| 404 Media | 98 | 25 |
| Wired | 140 | 60 |
| IGN FR | 153 | 52 |
| PC Gamer | 356 | 197 |
| Polygon | 378 | 77 |
| The Verge | 616 | 162 |
| Kotaku | 677 | 73 |
| RPS | 679 | 105 |
| GameSpot | 982 | 139 |

**Lecture.**
- Le HTML du texte est livré **côté serveur** sur les 11 sites testés avec `curl` : le JS n'est pas requis pour lire. La **différence** se joue sur le poids de la régie : les trois sites les plus légers (Pudding, Aftermath, Eurogamer sur la dernière passe) ne dépassent pas 100 requêtes ; GameSpot dépasse 900.
- Les gros pics (PC Gamer, Wired) viennent d'un HTML déjà énorme (2 Mo, 1,5 Mo).
- Les défauts d'accessibilité les plus visibles : **pas de `main`** chez IGN, **pas de `header`** chez The Verge, **deux `h1`** chez Eurogamer, images sans `alt` chez RPS (7), PC Gamer (5) et The Verge (5).

## 4. Mobile (390 px)

| Site | Observé |
|---|---|
| IGN FR | Panneau latéral remplacé par un en-tête compact (bouton menu, logo, avatar) ; la une garde son titre en surimpression sous l'image ; vidéo flottante en bas à gauche |
| GameSpot | Barre jaune compacte, titre de page sur 2 lignes, une en pleine largeur, **chaque carte passe en une colonne avec meta monospace** |
| Polygon | Bandeau cookies plein écran masque la liste au premier écran ; en-dessous la une en pleine largeur |
| Eurogamer | Les deux `select` de filtre sont **pleine largeur et empilés** ; cartes en pleine largeur, commentaires sous le titre |
| PC Gamer | En-tête noir compact ; les 5 boutons « type d'article » **passent à la ligne** (2 + 2 + 1) ; grande zone vide au-dessus du titre (publicité qui n'a pas chargé) |
| RPS | Menu « Menu » en bouton, bande de guides défilante horizontalement ; cartes en pleine largeur |
| The Verge | Titre « Gaming » géant sur fond violet : **le premier écran mobile ne montre aucun article** |
| Aftermath | Une grande image, titre et chapô, liste verticale ; encart « Sign up » en pied d'écran |
| Kotaku | Lecteur vidéo flottant **en haut** de l'écran ; image, titre italique, puis auteur |
| 404 Media | Bandeau podcast, bouton fermer ; image verte plein cadre puis texte |
| The Pudding | Recherche + filtre **sur une ligne**, cartes une colonne, numéro et mois en capsule |

**Observé.** Aucun débordement horizontal à 390 px (`scrollWidth` égal à la fenêtre) sur les 12 listings et les 12 articles, après correction de l'UA mobile.

## 5. Limites et incidents de la session

| Limite | Détail |
|---|---|
| **Chrome DevTools MCP indisponible** | Le MCP refusait de démarrer son navigateur. Les mesures viennent d'un Chrome headless local (Playwright). Pas de `get_css_styles` : les styles viennent de `getComputedStyle`. |
| **Bandeaux cookies non fermés** | Un script a cherché les boutons « Accept / J'accepte / Agree… » dans la page et ses cadres. Restent **visibles sur les captures** : IGN FR (listing et article, bandeau de consentement en bas), Eurogamer article (mur « Continue reading with ads » vs abonnement sans pub), Polygon (mobile), The Verge (mobile et pied d'écran), Wired (listing et article, « I ACCEPT »), PC Gamer (article) sur la première passe : vérifier chaque capture avant de s'y fier. Le premier écran de ces captures est donc **assombri ou recouvert**. |
| **Publicités et vidéos flottantes** | Visibles sur les captures de GameSpot, Eurogamer, RPS, PC Gamer, Kotaku. Un lecteur flottant masque une partie de l'écran chez IGN, Kotaku. |
| **Wired : mauvaise rubrique** | `https://www.wired.com/category/games/` renvoie un **404** (vérifié) ; `/tag/games/` aussi. J'ai donc consulté `/category/culture/` et le premier article « story » : il ne parle **pas** de jeu vidéo. Wired n'est valable ici que comme référence de **lecture longue** et de bloc « You Might Also Like ». |
| **GameSpot : `curl` bloqué (403)** | Le HTML brut n'a pas pu être contrôlé ; Chrome affiche pourtant l'article. |
| **Mesures de poids** | Les `content-length` des réponses sont **inutilisables** (chunked, vidéo, régie : IGN a affiché 61 Mo à 182 Mo selon la passe). Seuls le nombre de requêtes et de fichiers JS sont donnés, avec leur variabilité. |
| **Navigations non faites** | Pas de défilement jusqu'au pied de chaque article : les modules « associés » ne sont repérés que par leurs titres de section (`h2`/`h3`) dans le DOM complet, pas par une capture. Pas de test JavaScript désactivé en navigateur : le contrôle du texte se fait via `curl`. Pas de Lighthouse. |
| **Comportement de The Pudding** | L'article est un récit interactif (« Click to continue », flèches du clavier). Il ne se compare pas à un article classique ; son poids (1 script) et sa mesure (50 ch en 24 px) sont mentionnés à titre de contraste. |
| **Auth** | Aucune connexion, aucun paywall dur rencontré. Aftermath et 404 Media affichent un appel à l'inscription gratuit (voir 3.2). |
