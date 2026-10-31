# Tendances UX/UI des actualités gaming

> 24 octobre 2026. S'appuie sur les 12 références de [`benchmark.md`](benchmark.md) (listing et article de chacune).
> - **Règle.** Une tendance n'est retenue que si elle est observée sur au moins deux références, ou si une seule la porte de façon exemplaire et que Game Over peut s'en servir. Les tendances sont rattachées à une implémentation **vue** ; ce qui n'a pas été vu est écrit comme tel.
> - **Coût** : S = moins d'un jour, M = 2 à 5 jours, L = plus d'une semaine, pour la stack actuelle (Astro statique, CSS Modules, pas de framework JS).

## Synthèse

| # | Tendance | Observée sur | Intérêt Game Over | Coût | Verdict |
|---|---|---|---|---|---|
| 1 | Une et colonne compacte | GameSpot, Aftermath, Polygon | Fort | S | **Retenue** (1 grande + 2) |
| 2 | Étiquette de rubrique au-dessus du titre | Aftermath, Kotaku, PC Gamer, Verge, IGN | Fort | S | **Retenue** |
| 3 | Entrées thématiques en vraies pages | PC Gamer, Polygon, GameSpot, Eurogamer | Fort | M | **Retenue** (catégories) |
| 4 | Le jeu comme entité, pas comme mot-clé | IGN, GameSpot | Très fort | M | **Retenue, différenciante** |
| 5 | Colonne de lecture 50 à 70 ch, 18 px, interlignage 1,6 | Verge, Wired, Kotaku, Aftermath, 404 Media, IGN | Fort | S | **Retenue** |
| 6 | Date relative + absolue | GameSpot, PC Gamer | Moyen | S | **Adaptée** (regroupement par jour) |
| 7 | Modules « More in… » multicritères | Aftermath, Verge, GameSpot, IGN | Fort | S | **Retenue** (cascade) |
| 8 | Légèreté assumée (peu de JS, pas de régie) | Aftermath, The Pudding | Fort | S | **Retenue** (contrainte) |
| 9 | Identité éditoriale par la typographie | Verge, Polygon, Aftermath, The Pudding | Moyen | S | **Partielle** |
| 10 | Numérotation des éditions | The Pudding | Faible | S | **Écartée** |
| 11 | Filtres par `select` (genre / plateforme) | Eurogamer | Faible | M | **Écartée en l'état** |
| 12 | Interruptions : vidéo flottante, mur d'email, mur de consentement | Kotaku, IGN, 404 Media, Aftermath, Eurogamer, Polygon | Négatif | — | **Évitées** |

## 1. Une et colonne compacte

- **Problème résolu.** Dire en une seconde ce qui compte, sans que le lecteur ait à comparer vingt cartes identiques.
- **Implémentation vue.**
  - GameSpot (`/category/news/`) : une image et un titre sur trois lignes à gauche, trois éléments empilés à droite avec vignette et méta monospace (« 17 HRS AGO | Eddie Makuch »).
  - Aftermath (`/`) : une grande image à gauche (environ les deux tiers), une carte image et deux lignes vignette à droite.
  - Polygon (`/news/`) : deux unes de même taille côte à côte.
- **Avantages.** Hiérarchie immédiate, une seule règle de composition. **Limites.** Il faut choisir la une ; chez GameSpot la colonne latérale devient un second flux concurrent.
- **Intérêt Game Over.** Fort : l'existant est une liste uniforme de 20 cartes (audit L1).
- **Contraintes.** Aucune une manuelle (pipeline horaire) : la règle de choix doit être calculée au build. Les images sans jeu sont des visuels de catégorie : la une ne doit pas en porter un si une autre est disponible.

## 2. Étiquette de rubrique au-dessus du titre

- **Problème résolu.** Donner la nature de l'article avant sa lecture, sans le coût d'une méta à rallonge.
- **Implémentation vue.** Aftermath : étiquette rose en capitales (VIDEO GAMES, IMPRESSIONS). Kotaku : GAMES, OPINION, CULTURE NEWS, et COMMENTARY au-dessus du `h1` de l'article. PC Gamer : « News » et « Gaming Industry » sous forme d'étiquettes. IGN : surtitre rouge avec le nom du jeu (« MASS EFFECT 5 »).
- **Avantages.** Lecture rapide, entrée naturelle vers la catégorie. **Limites.** Si l'étiquette n'est pas cliquable elle devient de la décoration.
- **Intérêt Game Over.** Fort : 7 catégories déjà en base, affichées aujourd'hui en gris dans la méta.
- **Contraintes.** Le libellé « Actu » (catégorie `autre`) et « Bon plan » (`promo`) n'informent guère ; à traiter dans le design, pas dans le pipeline.

## 3. Entrées thématiques en vraies pages

- **Problème résolu.** Passer du flux à un sujet, et créer des URL indexables par sujet.
- **Implémentation vue.**
  - PC Gamer : bloc « Explore by article type », 5 boutons.
  - Polygon : bandeau de 4 sujets (Zelda · GTA 6 · Guides · Pokémon).
  - GameSpot : « Trending » (5 sujets).
  - Eurogamer : filtres genre / plateforme (non testés : je n'ai pas vérifié si les `select` rechargent la page ou filtrent en JS).
- **Avantages.** Navigation sans recherche. **Limites.** Les bandeaux de sujets chauds demandent une curation (Polygon, GameSpot) que le pipeline horaire ne fournit pas.
- **Intérêt Game Over.** Fort pour les catégories (calculables, stables) ; plus faible pour des sujets « chauds » (non calculables sans curation).
- **Contraintes.** Routes statiques : `/actus/categorie/<slug>` avec pagination, canonical, JSON-LD. Une catégorie vide ne doit pas générer de page.

## 4. Le jeu comme entité

- **Problème résolu.** Relier une actualité à ce dont elle parle, au-delà de mots dans le texte.
- **Implémentation vue.**
  - IGN : le jeu est dans l'URL (`/mass-effect-next-chapter/93343/…`) et en surtitre.
  - GameSpot : le JSON-LD de l'article contient un nœud `VideoGame` ; la page affiche « Latest on Featured Games » et « Related Tags ».
- **Avantages.** Navigation « même jeu » naturelle, données structurées, vraie page à atteindre. **Limites.** Chez les deux, le jeu n'est **que** un lien : aucune donnée utile n'est montrée (**observé : aucune durée de jeu sur aucune des 12 références**).
- **Intérêt Game Over.** **Très fort.** C'est la seule chose que personne d'autre n'affiche et la raison d'être du site.
- **Contraintes.** Seulement ~15 % des articles ont une fiche. Il faut un comportement propre pour les 85 % restants (pas de carte vide, pas de fausse carte).

## 5. Colonne de lecture

- **Problème résolu.** Fatigue de lecture sur 400 à 900 mots.
- **Implémentation vue.** Mesures (voir benchmark 3.1) : 18 px est la taille modale ; interlignage de 1,4 à 1,7 ; largeur de 50 à 71 ch hors Polygon (97 ch). Les colonnes les plus agréables sur les captures : Aftermath (67 ch, 18 px, 1,6), Kotaku (71 ch, Georgia 18 px, 1,6), 404 Media (60 ch, 17,6 px, 1,7), The Verge (51 ch, 18 px, 1,6).
- **Avantages.** Coût nul. **Limites.** Les sites avec colonne latérale (GameSpot, Eurogamer, PC Gamer) réduisent la colonne à 55 – 66 ch mais encombrent la page (PC Gamer : 14 `aside`, 21 565 px de haut sur desktop).
- **Intérêt Game Over.** Fort : l'existant est à 800 px (environ 75 – 85 ch estimés).
- **Contraintes.** Sur mobile la mesure tombe à 30 – 40 ch quoi qu'on fasse : on règle la taille (≥ 17 px), pas la mesure.

## 6. Date relative et absolue

- **Problème résolu.** Situer la fraîcheur d'un coup d'œil.
- **Implémentation vue.** GameSpot : « 17 HRS AGO ». PC Gamer : « Published 3 days ago ». Les autres : date absolue.
- **Avantages.** Fraîcheur lisible. **Limites.** Une date relative se périme dans une page statique (rebuild horaire chez Game Over : acceptable, un décalage de moins d'une heure).
- **Intérêt Game Over.** Moyen. **Adaptation.** Aucun des 12 listings ne **regroupe par jour** : c'est une approche que Game Over peut prendre en propre, avec un titre de groupe (« Aujourd'hui », « Hier », « Jeudi 22 octobre »). **Contrainte.** Le fuseau (Paris) doit être fixé au build.

## 7. Modules « More in… » multicritères

- **Problème résolu.** Garder le lecteur après le dernier paragraphe.
- **Implémentation vue.** Aftermath : « More in AI » puis « More from Luke Plunkett ». The Verge : « More in Gaming », « MOST POPULAR ». GameSpot : « Latest on Featured Games », « Popular Stories », « Related Tags ». IGN : « Articles reliés » en tête de texte. Wired : « You Might Also Like ».
- **Avantages.** Rétention. **Limites.** Chaque site n'applique **un seul critère** par bloc ; aucun ne combine même jeu → même rubrique → récents.
- **Intérêt Game Over.** Fort. **Contraintes.** Avec ~60 articles et 15 % de liés, le critère « même jeu » donne 0 à 2 articles : prévoir la cascade et une taille fixe du module (3 articles).

## 8. Légèreté assumée

- **Problème résolu.** Temps de chargement et confort de lecture.
- **Implémentation vue.** The Pudding : 1 balise `script` externe sur le listing et sur l'article. Aftermath : 14 balises `script` externes, 52 – 60 requêtes, pas de colonne latérale. À l'opposé : GameSpot (982 requêtes sur un article), RPS (679), Kotaku (677).
- **Avantages.** Pas de décalage de mise en page, lecture immédiate. **Limites.** Sans régie, il faut un autre modèle économique (Aftermath : abonnements ; Game Over : affiliation).
- **Intérêt Game Over.** Fort : cohérent avec la stack statique et l'objectif de poids.
- **Contraintes.** Garder cette contrainte comme règle de la refonte (pas de lecteur vidéo flottant, pas de JS pour la mise en page).

## 9. Identité par la typographie

- **Problème résolu.** Se reconnaître d'un coup d'œil dans un marché de pages interchangeables.
- **Implémentation vue.** The Verge : « Gaming » en 160 px (Manuka) sur fond violet plein écran. Polygon : titres Montserrat extra-gras, soulignés. Aftermath : titres en Chakra Petch. The Pudding : titres en minuscules, numéros de capsule.
- **Avantages.** Mémorisable. **Limites.** Le Verge consomme le premier écran mobile sans montrer un seul article.
- **Intérêt Game Over.** Moyen : la marque a déjà sa typographie (Monument, noir, rose). **Contraintes.** En-tête de page compact (pas de plein écran), et licence web à confirmer (question déjà ouverte dans la recherche de la homepage).

## 10. Tendances écartées

| Tendance | Pourquoi écartée |
|---|---|
| **Numérotation des éditions** (The Pudding, « #226 ») | Ne s'applique pas à un flux de quelques articles par jour ; les numéros n'ont pas de sens éditorial ici |
| **Filtres par `select`** (Eurogamer) | Deux menus déroulants ne valent pas des routes ; non vérifié s'ils fonctionnent sans JS ; peu d'articles par catégorie pour justifier des filtres combinés |
| **Colonne latérale** (GameSpot, Eurogamer, PC Gamer, Wired) | Réduit la colonne de texte, ajoute des `aside` sans valeur de lecture |
| **Fil d'Ariane de 3 niveaux sur un article** | Aucune des 12 références n'en montre un visible dans le premier écran de l'article |
| **Vidéo flottante** (Kotaku, IGN) | Masque le texte, charge un lecteur, est mal tolérée en mobile |
| **Mur d'email** (404 Media) et **encart d'inscription** (Aftermath) | Conviennent à un média à abonnement ; Game Over n'a ni compte ni newsletter |
| **Mur de consentement plein écran** (IGN, Polygon, Eurogamer, Wired) | Hors design : à traiter à part (question déjà ouverte dans la recherche de la homepage) |
| **Titre de rubrique géant plein écran** (Verge) | Le premier écran mobile ne montre aucun article |
