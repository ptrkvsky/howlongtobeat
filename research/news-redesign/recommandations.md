# Recommandations : listing et détail des actus

> 24 octobre 2026. S'appuie sur [`benchmark.md`](benchmark.md), [`tendances-ux-ui.md`](tendances-ux-ui.md) et [`audit-existant.md`](audit-existant.md).
> Les auteurs et la provenance éditoriale ne sont ni discutés ni modifiés ici.

## 1. Synthèse du benchmark

### 1.1 Patterns communs éprouvés (à reprendre)

| Pattern | Preuve |
|---|---|
| Une visible + compacts à côté | GameSpot, Aftermath, Polygon (2 unes) |
| Étiquette de rubrique avant le titre | Aftermath, Kotaku, PC Gamer, Verge, IGN |
| Corps à 18 px, interlignage 1,6, colonne de 50 à 70 ch | Verge (51 ch), Wired (54), Aftermath (67), Kotaku (71), 404 Media (60), IGN (65) |
| Texte livré dans le HTML (pas de JS pour lire) | 11 articles sur 11 testés avec `curl` |
| Bloc « plus de … » après l'article | Aftermath, Verge, GameSpot, IGN, Wired |
| Un seul `h1`, un `main`, des `time` | 11 articles sur 12 ont un seul `h1` (Eurogamer en a 2) ; 11 sur 12 ont un `main` (IGN n'en a pas) |

### 1.2 Approches originales à retenir ou à surveiller

| Approche | Où | Verdict |
|---|---|---|
| Le jeu comme nœud de données (`VideoGame` dans le JSON-LD) et module « Latest on Featured Games » | GameSpot | Reprendre l'idée, l'enrichir (heures) |
| Le jeu comme surtitre et dans l'URL | IGN | Reprendre en étiquette, **sans** changer les URL existantes |
| Deux modules « More in AI » puis « More from l'auteur » | Aftermath | Reprendre le principe multi-blocs ; **pas** de critère auteur (hors périmètre) |
| Ultra-légèreté (1 script, 20 requêtes) | The Pudding | Garder comme objectif de poids |
| Navigation « par type d'article » | PC Gamer | Reprendre sous forme de catégories en routes |

### 1.3 Pratiques inadaptées (à éviter)

| Pratique | Raison |
|---|---|
| Colonne latérale à côté du texte | Réduit la colonne, ajoute des `aside` (PC Gamer : 14 ; 21 565 px de haut) |
| Vidéo flottante, mur d'email, mur de consentement plein écran | Masque le texte ; Game Over n'a ni compte ni newsletter |
| Titre de rubrique plein écran | Le Verge : aucun article sur le premier écran mobile |
| Mesure de 97 ch | Polygon |
| Interlignage 1,4 en 17 px | Eurogamer, RPS : lecture serrée sur des textes de 600 à 900 mots |
| Absence de landmarks | IGN sans `main`/`nav`, Verge sans `header` |

### 1.4 Priorités

| Priorité | Sujet | Pourquoi |
|---|---|---|
| P1 | La durée de jeu dans l'article (carte jeu) | Aucune référence ne l'a ; seul vrai différenciateur |
| P1 | Hiérarchie du listing (une + flux) | L'existant est une liste uniforme (audit L1) |
| P1 | Colonne de lecture 66 ch | Mesure actuelle ~75–85 ch (estimé) |
| P2 | Catégories en routes statiques | 7 catégories sans page (audit L2) ; pages indexables |
| P2 | Articles associés en cascade, précédent/suivant | Aucun aujourd'hui (audit D2) |
| P2 | Regroupement par jour | Aucun des 12 listings ne le fait : originalité à faible coût |
| P3 | Rangée « Jeux dans l'actu » | Dépend du taux d'articles liés (15 %) |
| Hors design | Taux de liaison actu → fiche | Le verrou est dans `scripts/news/game.ts` (audit section 6) |

## 2. Verdict sur la direction pressentie

| Élément de la direction | Verdict | Détail |
|---|---|---|
| En-tête éditorial | **Validé**, en version compacte | Éviter le plein écran du Verge ; le premier écran mobile doit montrer la une |
| « À la une » : 1 grand + 2 | **Validé** | GameSpot (1 + 3) et Aftermath (1 + 3 dont une carte image) l'attestent ; 1 + 2 donne une grille propre |
| Flux chronologique groupé par jour, densité variable | **Validé, et original** | Aucun des 12 listings ne groupe par jour. Risque : jours à 1 article (rythme de 0 à 3 par heure) ; prévoir des groupes de tailles inégales sans en-tête isolé |
| Filtres catégories en routes statiques | **Validé** | PC Gamer le fait ; `select` Eurogamer écarté |
| Rangée « Jeux dans l'actu » | **À valider, avec un seuil** | Aucune référence ne l'a ; avec ~9 articles liés sur 60, la rangée peut être pauvre. Règle de masquage proposée dans `decisions-implementation.md` |
| Colonne unique ~68 ch | **Corrigé en 66 ch** | Médiane observée 60 ch, 71 au plus haut hors Polygon ; 66 ch est dans la fourchette haute confortable pour des textes de 400 à 900 mots |
| Carte jeu contextuelle avec durée | **Validé, et avec un correctif** | Valeur unique dans les 12 références. Correctif : 85 % des articles n'ont pas de jeu ; la mise en page ne doit pas dépendre de la carte |
| Articles associés (même jeu > même catégorie > récents) | **Validé** | Cascade inédite parmi les 12 |
| Précédent / suivant | **Validé comme module léger** | Aucune référence n'en propose ; utile pour un flux où l'article suivant est le « chaînon » naturel ; à placer après les associés |
| Pas de colonne latérale | **Validé** | Aftermath, Kotaku, 404 Media le font déjà |

## 3. Listing `/actus`

### 3.1 Direction proposée

1. **En-tête compact** : étiquette, `h1` « Actus jeux vidéo », une phrase sur le rythme (« Mis à jour toutes les heures »), rangée de catégories sous forme de liens. Hauteur ≤ 180 px sur desktop, ≤ 140 px sur mobile : le premier écran mobile montre la une.
2. **À la une** : 1 grand élément (image 16:9, étiquette, titre, chapô) + 2 éléments compacts. Choix **calculé** : voir `decisions-implementation.md`, règle R1.
3. **Flux groupé par jour** : en-têtes « Aujourd'hui », « Hier », puis « jeudi 22 octobre ». Dans chaque groupe, la **densité varie** : le premier élément du jour passe en carte (image + chapô), les suivants en lignes compactes (vignette 96 px + titre + étiquette). Pas de grille uniforme.
4. **Filtres de catégorie** : liens vers `/actus/categorie/<slug>`, pas de JavaScript ; la page active est marquée `aria-current`.
5. **Rangée « Jeux dans l'actu »** : couvertures de jeux avec durée principale, visible seulement si au moins 4 jeux ont une actu récente.
6. **Pagination** conservée (`/actus/2`), avec le même gabarit.

### 3.2 En quoi ce n'est pas une copie

| Choix | Ce que font les références | Ce que fait Game Over |
|---|---|---|
| Regroupement par jour | Flux plat | Groupes de jours, densité variable |
| Rangée de jeux | Sujets « chauds » curés (Polygon, GameSpot) | Jeux **calculés**, avec **durée de jeu** |
| Une | Choix éditorial | Choix déterministe, jamais deux fois de suite la même image de catégorie |
| Catégories | Boutons (PC Gamer) | Routes indexables avec compte d'articles |
| Poids | Régie lourde | Statique, aucune librairie |

### 3.3 Mobile

| Zone | Comportement |
|---|---|
| En-tête | Catégories en rangée défilante horizontale, `scroll-snap`, sans plus de 44 px de haut |
| Une | Grand élément pleine largeur, les deux compacts dessous en liste |
| Flux | Une colonne ; le premier élément du jour en carte, les autres en ligne |
| « Jeux dans l'actu » | Rangée défilante horizontale, 2,3 cartes visibles |

## 4. Détail `/actus/<slug>`

### 4.1 Direction proposée

1. **En-tête d'article** : étiquette de catégorie (lien), `h1`, chapô, signature existante (non modifiée), image principale.
2. **Colonne unique de 66 ch**, 18 px (19 px au-dessus de 1 280 px), interlignage 1,65, intertitres espacés.
3. **Carte jeu contextuelle** (articles liés à une fiche) : couverture, nom, **durée principale et complétion**, lien vers la fiche. Placée **après le deuxième ou troisième paragraphe** sur desktop et mobile, en bloc intercalé (pas en colonne latérale). Elle remplace l'encadré final actuel.
4. **Articles associés** : 3 articles, en cascade « même jeu, puis même catégorie, puis récents », sans doublon.
5. **Précédent / suivant** : deux liens (articles voisins dans le flux).
6. **Pas de colonne latérale.** Pas de fil d'Ariane de 3 niveaux : une étiquette de catégorie suffit.

### 4.2 Les 85 % d'articles sans jeu

Aucune carte jeu fictive. L'article est identique dans sa structure ; le bloc des associés prend la relève (même catégorie). La section de texte « Combien de temps pour finir X ? » existe déjà dans l'article quand une fiche est trouvée.

### 4.3 En quoi ce n'est pas une copie

| Choix | Références | Game Over |
|---|---|---|
| Jeu | Lien ou mot-clé (IGN, GameSpot) | Carte avec les heures de la fiche |
| Associés | Un critère par bloc | Cascade en un seul bloc de 3 |
| Navigation | « Most popular » | Précédent / suivant dans le flux |
| Largeur | 50 à 97 ch selon le site | 66 ch, fixés en `ch` et non en `px` |

### 4.4 Mobile

| Zone | Comportement |
|---|---|
| Colonne | Pleine largeur avec gouttière de 16 px ; corps ≥ 17 px |
| Image | Pleine largeur, ratio 16:9 |
| Carte jeu | Pleine largeur, couverture 72 px à gauche, durées à droite, lien en toute la carte |
| Associés | Une colonne, lignes compactes sans image |
| Précédent / suivant | Empilés, hauteur ≥ 48 px |

## 5. Risques

| Risque | Parade |
|---|---|
| Peu d'articles par jour : groupes vides ou à 1 élément | Regrouper les jours à 1 élément sous « Récemment » au lieu de multiplier les titres |
| Peu de jeux liés (15 %) : rangée et cartes rares | Seuil de masquage ; piloter le taux dans le pipeline (hors design) |
| Les images de catégorie se répètent | Ne pas les mettre en une si une image de jeu existe ; sinon vignette réduite |
| Capture de l'existant non faite | Capturer `/actus` et un article après les modifications en cours |
| Largeurs mobiles non mesurées sur Eurogamer et RPS | Aucune décision n'en dépend |
