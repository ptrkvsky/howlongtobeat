# Déroulé de la homepage, pour chaque direction

## Comment lire ce document

**Les sections suivent le produit réel**, pas une trame d'agence. Le brief demande « services, projets, clients ». Ici, ces sections deviennent : outils, jeux, preuves, actus. Une section qui ne sert pas un objectif (trafic SEO, décision du joueur, clic d'affiliation, lecture des actus) est supprimée.

**Colonne « Données » :**
- Elle indique d'où vient chaque contenu.
- Tout est disponible **au build**, via `getGames()` (`src/features/jeu/api/getGames.ts`) et `getNewsArticles()` (`src/features/actus/api.ts`).
- Les besoins nouveaux sont marqués **[NOUVEAU]**.

**Sections supprimées dans les trois directions**, parce que les fonctions n'existent pas :
- « Enregistrez-vous » ;
- « Ajoutez votre jeu » ;
- toute section témoignages ou clients.

---

## Direction 1 — « CONTINUE ? »

| # | Section | Message | Traitement visuel | Contenu et données | Interactions |
|---|---|---|---|---|---|
| 0 | **Barre HUD** | Je suis un outil, je réponds vite | Logo Monument, Genres, Actus, « Rechercher / » en mono. Repères en croix. | Statique | `/` ouvre la recherche. Le header devient compact au scroll. |
| 1 | **Hero « CONTINUE ? »** | Combien de temps avant la fin ? | « CONTINUE ? » à environ 24vw, champ « Tapez un jeu — PRESS START ». Fond noir, aucune image. | Index de recherche **[NOUVEAU]** | Décompte 9 → 0 non bloquant. Le choix d'un jeu recompose le texte en « 40 H · 80 H · 140 H », puis en « GAME OVER LE 3 DÉC. ». |
| 2 | **Proposition de valeur, aplat rose** | Nous ne donnons pas des heures, nous donnons une date | Section pleine en rose, texte noir Monument : « VOTRE PROCHAIN GAME OVER : 3 DÉC. » | Rythme par défaut (7 h) de `pace.ts` | Les chiffres défilent à l'entrée dans l'écran. |
| 3 | **Outils, « POWER-UPS »** | Ce que Game Over calcule pour vous | 4 cellules HUD : Durées · Verdict · À votre rythme · €/heure. Chacune montre un vrai exemple. | Un jeu exemple (popularité max) : `hltb`, `timeRank`, `price` | Survol : la cellule s'allume, le lien mène à la fiche exemple. |
| 4 | **Jeux, « HIGH SCORES »** | Le catalogue a des records | 4 tableaux d'arcade : Plus longs / Plus courts / Plus finis / Meilleur €/h. 10 lignes chacun, couvertures bichromes. | Tri au build sur `timeMainStory`, `completion.percent`, `price` / h, filtré par popularité | Onglets entre les tableaux. Survol couverture : bichrome → couleur. |
| 5 | **Actus, « NEWS FEED »** | Ce qui sort, et combien de temps ça dure | Fil horodaté en mono, 6 entrées, durée du jeu en badge | `getNewsArticles()` (6 dernières) ; durée via `gameId` | Aucune |
| 6 | **Preuves, « SCORE »** | Données vérifiées, sources citées | Compteur « 08 443 JEUX », sources en mono, date de mise à jour | Nombre de jeux, date du build | Le compteur défile une fois. |
| 7 | **CTA final** | À vous de jouer | « INSERT COIN » parodié en « INSERT GAME », avec une seconde recherche | Index de recherche | Aucune |
| 8 | **Footer** | — | Plan du site, genres en français, mentions | Genres | Aucune |

---

## Direction 2 — « Générique »

| # | Section | Message | Traitement visuel | Contenu et données | Interactions |
|---|---|---|---|---|---|
| 0 | **Header** | Un média de référence | Logo, Genres, Actus, loupe. Filet rose sous le header. | Statique | Aucune |
| 1 | **Hero, « À l'affiche »** | Chaque jeu a un générique : voici quand vous verrez le vôtre | Key art 16:9 en plein cadre, crédit vertical en marge, H1 en Cirka, champ « Quel jeu ? » | Jeu de la semaine (popularité × fraîcheur) ; key art **[NOUVEAU : artworks IGDB à synchroniser]** | Fondu lent de l'image. Le champ fonctionne dès le premier paint. |
| 2 | **01 — Programmes** (proposition de valeur et curation) | Le bon jeu pour le temps que vous avez | 4 colonnes « Une soirée / Un week-end / Un mois / Une saison », 4 affiches par colonne, durées en Cirka italique | Filtre par `timeMainStory` (< 4 h, < 15 h, < 40 h, > 80 h) × popularité | Survol d'une affiche : lift léger et crédit qui apparaît. |
| 3 | **02 — Ce que nous mesurons** (outils) | Plus qu'une durée | Mise en page magazine : pleine page Elden Ring en exemple, annotée en marge (« 96 % du catalogue est plus court », « 20 films », « 1,27 €/h ») | Un jeu exemple : `timeRank`, `hltb`, `price` | Les annotations apparaissent au scroll. |
| 4 | **03 — Équivalences** | Une durée, c'est de la culture | Affiche double « ELDEN RING = 20 FILMS » | Calcul existant (« X films ») | Aucune |
| 5 | **04 — Dépêches** (actus) | Toute l'actu, avec sa durée | Liste éditoriale : heure en mono, titre en Cirka, auteur, durée du jeu concerné | `getNewsArticles()` (8 dernières) | Aucune |
| 6 | **05 — Par genre** | Explorer autrement | Index typographique des 24 genres, **en français**, avec la durée médiane de chacun | Genres et médiane calculée au build **[NOUVEAU : libellés FR]** | Survol : la couverture du jeu le plus populaire du genre apparaît (comme le bloc « D'autres jeux » actuel). |
| 7 | **Générique de fin** (preuves, CTA et footer) | Transparence | Crédits centrés qui défilent (sources, nombre de jeux, date de mise à jour, auteurs), puis « GAME OVER » en Monument. Liens du footer intégrés aux crédits. | Statique et données du build | Défilement lié au scroll (CSS scroll-driven). Version statique avec réduction des animations. |

---

## Direction 3 — « Ligne d'arrivée » (recommandée)

| # | Section | Message | Traitement visuel | Contenu et données | Interactions |
|---|---|---|---|---|---|
| 0 | **Header** | Outil et marque | Logo Monument, Genres, Actus, recherche compacte. Fond en papier millimétré qui commence ici. | Statique | `/` donne le focus à la recherche. |
| 1 | **Hero, « Quand verrez-vous la fin ? »** | Game Over vous donne une date | Phrase-formulaire « J'ai [7 h ▾] par semaine. Je veux finir [Elden Ring ▾]. » Dessous, une règle graduée d'aujourd'hui → date, la barre du jeu (pleine, contour, hachures), « GAME OVER · 3 DÉC. » en Monument géant. | `PACES` / `paceDays` / `formatPace` (`pace.ts`), `hltb` du jeu par défaut. Index de recherche **[NOUVEAU]**. | Changer le rythme ou le jeu : la date roule et la barre se redimensionne (View Transition). Drapeau planté à l'arrivée. Rendu statique par défaut sans JS. |
| 2 | **Proposition de valeur** | Heures → semaines → date | Trois jalons sur la règle : « 40 h » → « 6 semaines » → « 3 décembre », avec une phrase de 15 mots maximum chacun | Mêmes données que le hero | Les jalons apparaissent en séquence au scroll. |
| 3 | **« Avant Noël »** (curation datée, équivalent « projets ») | À votre rythme, voici ce que vous pouvez finir | Liste de 8 jeux. Chaque ligne : pastille couverture, nom, barre à l'échelle, date de fin. Le titre suit le prochain jalon du calendrier (Noël, vacances d'hiver, été). | Listes **pré-calculées au build pour 3 / 7 / 15 / 30 h** × popularité, avec une date de référence au build | Le sélecteur du hero bascule entre les listes. Sans JS, la liste à 7 h s'affiche. |
| 4 | **« La règle »** (pièce signature data-viz) | Tout le catalogue sur une même échelle | Grande frise 0 → 200 h, environ 40 jeux populaires placés à leur durée. Horizontale avec scroll sur desktop, verticale sur mobile. | `timeMainStory` des 40 jeux les plus populaires | Survol ou focus : nom, durée, lien. Les barres grandissent au scroll. Liste équivalente en texte. |
| 5 | **Outils** (équivalent « services ») | Chaque fiche répond à 4 questions | 4 jalons sur une règle : Combien de temps ? · Est-ce que je vais le finir ? (rythme) · Les gens le finissent-ils ? (complétion Steam) · Ça vaut le coup ? (€/h). Chaque jalon a un mini-exemple réel. | `hltb`, `completion`, `price` d'un jeu exemple | Lien vers la fiche exemple |
| 6 | **Actus chronométrées** | L'actu, avec la durée du jeu | 6 cartes, chacune avec la barre de durée du jeu concerné. Heure en mono. | `getNewsArticles()` + `gameId` → durées | Aucune. Une carte sans jeu lié n'a pas de barre (et cela doit devenir rare). |
| 7 | **Par genre et par durée** | Explorer par le temps | Les 24 genres (libellés FR) avec la distribution des durées en mini-histogramme | Médiane et répartition par genre calculées au build **[NOUVEAU : libellés FR]** | Lien vers le genre, tri par durée **[NOUVEAU : à prévoir sur les pages genre]** |
| 8 | **Preuves et CTA final** | Données ouvertes, sources citées | Note de bas de graphique : « 8 443 jeux · durées HowLongToBeat · avis Steam · prix IsThereAnyDeal · mis à jour le… ». CTA : « Et vous, quand est votre prochain Game Over ? » avec retour au hero. | Statique et date du build | Le CTA ramène au hero et donne le focus au champ. |
| 9 | **Footer** | — | Plan du site, mentions | Statique | Aucune |

### Notes spécifiques à la direction 3

- **Date de référence.** Le site est rebuilt toutes les heures. La date « aujourd'hui » rendue au build est donc juste à une heure près. Au chargement, le JS recalcule la date côté client pour le cas d'une page servie depuis un cache plus ancien.
- **Ton.** La date n'est pas une promesse. Elle est donnée comme une estimation (« vers le 3 décembre ») : c'est déjà le wording de la fiche.
- **Mobile.** L'axe vertical de la règle fait du scroll une progression dans le temps. Le hero tient en un écran de 390 × 844 : la phrase-formulaire sur 2 lignes, la date en Monument à environ 18vw.
