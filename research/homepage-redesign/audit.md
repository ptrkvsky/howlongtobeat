# Audit du site existant — www.game-over.io

> Audit réalisé le 24 octobre 2026.
> - Outils : Chrome (chrome-devtools MCP) en émulation desktop 1440 px et mobile 390 px, Lighthouse mobile, `curl` pour les en-têtes, lecture du dépôt.
> - Captures : [`captures/`](captures/).
> - Convention : **Observé** = constaté sur le site ou dans le code. **Lecture** = interprétation de l'auteur de l'audit.

## 0. Cadrage : ce qu'est (et n'est pas) Game Over

Le brief type parle de services, de projets et de clients, comme pour une agence. **Game Over n'est pas une agence.**

C'est un **site média et base de données grand public, en français**. Il répond à une question : *« Combien de temps faut-il pour finir ce jeu ? »*.

| Brique | Ce qu'on y trouve (observé) |
|---|---|
| **Catalogue** | 8 443 fiches jeu (`/jeu/<slug>`), 24 genres. Durées issues de HowLongToBeat, enrichies avec IGDB, Steam et IsThereAnyDeal. |
| **Outils** | Verdict, percentile, équivalence en films, calculateur « À votre rythme » (date de fin), prix par heure. |
| **Actus** | Articles en français publiés environ toutes les heures (`/actus`). Signés par trois auteurs. |
| **Pas de compte utilisateur** | Ni inscription, ni contribution, ni newsletter. |

Dans tout le dossier, les sections du brief sont traduites en équivalents réels :

| Brief | Game Over |
|---|---|
| Services / expertises | Les outils : durées, verdict, rythme, prix par heure |
| Projets / cas clients | Les jeux du catalogue |
| Chiffres clés | Taille et fraîcheur du catalogue, sources |
| Écosystème | Actus et genres |

## 1. Proposition de valeur et positionnement

**Ce que le site dit de lui-même (observé, fautes comprises) :**
- `<title>` : « Découvrez le temps de jeu necessaire pour terminer vous jeux favoris. - Game Over »
- Meta description : « Game Over repertorie la durée de vie de 8443 jeux. Retrouvez toutes les informations sur la duree de vie de l'ensemble de vos jeux preferes. »
- H1 de la home : « Quelle est la durée de vie de mes **jeux favoris** ? »
- H1 des fiches : « Combien de temps faut-il pour terminer *Elden ring* ? »
- `package.json` : « Le temps de jeu de vos jeux favoris »

**Positionnement interne** (`docs/enrichissement-fiches-jeux.md`, 17/10/2026) : répondre à la question *suivante* du joueur, après « combien de temps ? » :
- est-ce que ça vaut le coup ?
- est-ce que les gens le finissent ?
- sur quoi y jouer ?

Il se démarque de HowLongToBeat par le taux de complétion Steam réel et le prix par heure. Le coût de fonctionnement doit rester proche de zéro.

**Lecture :** sur la home, la promesse se limite à « on a des durées ». C'est la promesse de HowLongToBeat, en moins complet. La vraie différence de Game Over est cachée dans les fiches :
- le français ;
- le verdict ;
- le calculateur qui donne **une date** ;
- le prix par heure.

## 2. Audiences et objectifs (lecture, fondée sur les observations)

| Audience | Indice observé | Besoin |
|---|---|---|
| Joueur qui hésite avant d'acheter ou de commencer | Verdict « GROS MORCEAU », « Plus long que 96 % des jeux du catalogue » | Savoir si le jeu tient dans sa vie |
| Joueur adulte au temps contraint | Calculateur 3 / 7 / 15 / 30 h par semaine, « soit une fin vers le 3 décembre » | Planifier |
| Chasseur de bons plans | « 50,89 € chez Muve, soit 1,27 € par heure d'histoire. Plus bas historique… » | Rapport prix / durée |
| Lecteur d'actus (Google News / Discover) | Actus horaires, `NewsArticle`, `max-image-preview:large` | Trafic, fraîcheur |

**Objectifs business (observés) :**
- trafic SEO sur les longues traînes « combien de temps pour finir X » ;
- trafic Discover sur les actus ;
- monétisation par **affiliation IsThereAnyDeal** (liens `itad.link/...?app=…`) ;
- pas de publicité, pas de newsletter.

## 3. Structure de la homepage et hiérarchie visuelle (observé)

Captures : [desktop](captures/gameover-home-desktop.png), [mobile 390](captures/gameover-home-mobile.jpg).

1. **Header** : logo texte « GAME OVER » (Monument Extended), liens « Genres » (vers `/plan-du-site`) et « Actus ».
2. **Hero**, l'essentiel de la page :
   - photo plein cadre d'une femme cyberpunk avec un masque à gaz et des lunettes néon (`src/assets/bg.jpg`, 2500×1406, 370 Ko à la source) ;
   - le H1, puis un paragraphe : « …Game-over recense aujourd'hui plus de [8443 jeux]… Votre jeu ne se trouve pas dans la liste ? Enregistrez-vous et ajouter le facilement à notre base de données. »
3. **Footer** : « Plan du site / Mentions légales / Politique de confidentialité ».

**Ce qui n'y est pas :**
- pas de recherche, ni sur la home ni ailleurs sur le site (`/recherche` et `/search` renvoient une 404) ;
- pas un seul jeu, pas une couverture, pas une durée ;
- pas d'actus ;
- pas de CTA.

Le lien « 8443 jeux » mène à `/plan-du-site`, qui **ne liste aucun jeu**. L'inscription promise n'existe pas (`/inscription` renvoie une 404).

**Hiérarchie (lecture)** : l'image domine et le texte est secondaire. Rien ne guide vers l'action. La page ressemble à un poster d'ambiance, pas à la porte d'entrée d'un outil.

## 4. Direction artistique actuelle (observé)

| Élément | Valeur |
|---|---|
| Fond | `#010103` (noir) |
| Texte | `rgb(255 246 230)` (crème `#fff6e6`) |
| Accent | `--color-primary-500 #ff008a` (rose), `--color-secondary-500 #fb046a` |
| Autres | Anneau vert vif sur les fiches. `theme-color #6100FF` (violet, utilisé nulle part dans le CSS). `manifest.json` `#111111`. |
| Titres | **Monument Extended Black** (auto-hébergée) |
| Texte courant | **PolySans Neutral / Slim** (auto-hébergées). Corps 20 px avec une interligne de 20 px, trop serré. |
| Polices présentes mais inutilisées | **PP Cirka Variable** (serif display), **Bebas Neue Bold** |
| Logo | Aucun fichier. Le logo est le mot « GAME OVER » en Monument. |
| Images | Photo hero générique de type banque d'images, sans lien avec un jeu réel (licence inconnue). Couvertures IGDB en hotlink sur les fiches. Visuels d'actus IGDB / Steam, ou visuel générique par catégorie. |
| Tokens | `src/styles/tokens.css`, « dark theme only ». CSS Modules. |

**Lecture :**
- Le trio noir, rose et Monument a du caractère. Il « sonne » gaming et club, et c'est un actif à garder.
- La photo cyberpunk, en revanche, est un cliché générique. Elle ne parle ni de temps, ni de jeux réels, ni de Game Over.
- Le meilleur moment graphique du site est sur les fiches. Le bloc « D'autres jeux à terminer » aligne de gigantesques titres en Monument contour : à la survole, la couverture glisse en rotation de 4° et les titres défilent en marquee ([capture](captures/gameover-jeu-elden-ring-desktop.jpg)). C'est l'embryon d'une vraie signature typographique.

## 5. Interactions, animations, responsive (observé)

- **Home** : aucune animation. Liens roses au survol (0,2 s), `::selection` rose.
- **Historique** : le commit `b2d9da0` (16/10/2026, encore sous Next.js) a **supprimé** les animations de la home :
  - un preloader GSAP « GAME / OVER » plein écran à 24,8vw, avec panneaux colorés en `mix-blend-mode: exclusion`, qui **masquait le contenu environ 2,5 s** ;
  - une intro du titre lettre par lettre (SplitText) à 4 s.
  
  **Leçon :** le propriétaire du site a déjà rejeté l'animation qui retarde l'accès au contenu.
- **Fiches** : marquee CSS, calculateur en JS client (`localStorage['pace']`), survols des pastilles.
- **Aucune gestion de `prefers-reduced-motion`** dans tout le code.
- **Responsive** :
  - Home : même composition à 390 px, texte posé sur l'image.
  - Fiches : la carte « 140 h » passe sur deux lignes à 390 px ([capture](captures/gameover-jeu-elden-ring-mobile.jpg)).
  - Le marquee déborde en interne (1 831 px), sans scroll horizontal de la page.

## 6. Pages internes (observé)

- **Fiche jeu** (`/jeu/elden-ring`), le cœur du produit :
  - titre « Combien de temps faut-il pour terminer… » ;
  - verdict « GROS MORCEAU » avec une phrase de synthèse ;
  - badges « Plus long que 96 % des jeux du catalogue » et « L'histoire dure autant que 20 films » ;
  - trois cartes 40 h / 80 h / 140 h avec barres ;
  - calculateur « À votre rythme » : « À 7 h par semaine, comptez environ 6 semaines pour l'histoire principale, soit une fin vers le 3 décembre » ;
  - avis Steam (93 %, 1 160 000 avis), prix et prix par heure ;
  - sources citées ;
  - JSON-LD `VideoGame` avec `timeRequired`.
  
  Défaut : l'anneau « 96 % » n'a aucune légende.
- **Genre** (`/genre/role-playing-rpg`) : H1 géant « Role-playing (RPG) 762 jeux », suivi d'une **simple liste de 48 noms**, sans couverture, durée, tri ni filtre ([capture](captures/gameover-genre-rpg-desktop.jpg)). Les noms de genres sont en anglais, et « Platform » apparaît deux fois (dont le slug fautif `/genre/platformd`).
- **Actus** (`/actus`) : cartes avec catégorie, date, auteur, titre, chapô et image 320×180. Seuls **2 articles sur 8 vérifiés** renvoient vers la fiche du jeu concerné, alors que la promesse affichée est « avec le temps qu'il faut pour finir les jeux concernés ».
- **Auteurs** : trois personas (« Léa Moreau, Rédactrice en chef · Dans le jeu vidéo depuis 2012 ») avec un « avatar illustré ». `docs/actus.md` les décrit comme inventés.
- **404** : « Game over : cette page n'existe pas ». Bonne ligne de marque.

## 7. Performance et qualité (observé)

**Lighthouse mobile, home :**
- Accessibilité 100, Best Practices 100, SEO 100 ;
- CLS 0,058 (seul audit en échec) ;
- score Performance non disponible dans l'outil utilisé ;
- 10 requêtes, environ 26 Ko transférés (cache chaud), HTML 6,2 Ko, FCP environ 120 ms.

**Contrainte produit existante :** les pages doivent peser au plus 2× leur poids actuel (`docs/enrichissement-fiches-jeux.md`).

**Défauts relevés :**
- home sans `canonical`, sans `og:url` et sans `og:image` ;
- fautes et accents manquants dans le title et la meta ;
- mentions légales obsolètes (hébergeur indiqué : OVH, alors que le site est servi par Vercel ; SIREN et DPO vides ; « espace commentaires » inexistant) ;
- politique de confidentialité qui parle de newsletter et de paiement ;
- **GTM chargé sans bannière de consentement**.

## 8. Ce qu'il faut garder

- **La question-titre** « Combien de temps… ? » et la langue française naturelle.
- **Le calculateur et sa date de fin.** C'est le seul élément véritablement propriétaire du site : HowLongToBeat donne des heures, Game Over donne une date.
- Le verdict, le percentile, l'équivalence en films et le prix par heure : de la donnée rendue *humaine*.
- La transparence des sources (« Source : HowLongToBeat / Steam / IsThereAnyDeal »).
- Le trio noir, rose `#ff008a`, crème avec Monument Extended, et le traitement géant en contour des titres de jeux.
- La légèreté extrême (site statique, environ 26 Ko) et un JSON-LD riche.
- La ligne éditoriale de la 404.

## 9. Ce qui limite la différenciation

1. **La home cache le produit.** Zéro jeu, zéro outil, zéro actu.
2. **Pas de recherche** sur un site dont l'usage naturel est « je tape le nom de mon jeu ».
3. **Une image générique** qui ne dit rien de la marque ni du temps.
4. **Des promesses fausses** : inscription, contribution, newsletter.
5. **Des pages genre pauvres**, en anglais, sans durée.
6. **Une donnée de durée non propriétaire** (HowLongToBeat). La valeur ajoutée tient au calcul et au récit, et ils ne sont pas montrés.
7. **Des signaux de confiance fragiles** : auteurs fictifs, rythme de publication mécanique (toutes les heures à :17), fautes dans le title.

## 10. Opportunités

- Faire de la **date de fin** le cœur de la home et de la marque : « Votre prochain Game Over : le 3 décembre ».
- Mettre la **recherche** au premier plan, avec un index statique généré au build.
- **Curations par temps disponible** (une soirée, un week-end, avant Noël), calculées à partir de données déjà en base.
- **Lier systématiquement actus et durées.** Chaque actu porte la barre de durée du jeu concerné.
- **Un système graphique de la durée** (barres à l'échelle, règle graduée) réutilisable sur les fiches, les genres et les actus.
- Corrections rapides indépendantes de la DA : title, meta, canonical, og:image, textes promettant des comptes.
