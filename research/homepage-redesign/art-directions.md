# Trois directions artistiques

## L'insight commun

> HowLongToBeat donne des **heures**. Game Over peut donner une **date**.

Le nom de la marque désigne l'écran de fin, le moment où l'on *termine*. Le produit, lui, sait déjà calculer quand ce moment arrivera. Le calculateur des fiches affiche « …soit une fin vers le **3 décembre** ». Personne d'autre dans le secteur ne fait cela, et la home ne le montre pas.

**Promesse proposée** : *« Votre prochain Game Over : le 3 décembre. »*

Les trois directions partent de cette promesse et la mettent en scène de trois façons différentes :
- par le **jeu** (direction 1) ;
- par le **récit** (direction 2) ;
- par la **mesure** (direction 3).

Toutes trois respectent les mêmes invariants :

| Invariant | Pourquoi |
|---|---|
| Recherche visible dès le premier écran | L'intention n°1 du visiteur est de trouver son jeu. |
| Aucune intro bloquante | Leçon du commit `b2d9da0`. |
| Contenu réel issu de la base | Pas d'images fictives pour des jeux réels. |
| Français soigné, sources citées | Promesse de confiance du produit. |
| Budget de poids ≤ 2× l'actuel | Règle produit. |
| `prefers-reduced-motion` respecté | Absent aujourd'hui de tout le site. |

---

## Direction 1 — « CONTINUE ? »

*La voie audacieuse et expérimentale.*

### 1. Idée directrice

L'écran « CONTINUE ? 9… 8… 7… » est l'interface du temps la plus connue de la culture jeu vidéo : un compte à rebours, une décision. La home de Game Over **devient cet écran, réinventé**. Le compte à rebours ne menace pas, il *calcule*. La question n'est plus « voulez-vous continuer ? » mais « **combien de temps avant la fin ?** ».

### 2. Émotion et message

- **Émotion :** l'adrénaline, le jeu, la fierté du score.
- **Message :** « Game Over sait exactement combien de temps il vous reste. »

### 3. Système graphique

- **Couleurs :**
  - noir `#010103` et rose `#ff008a` **poussé en aplats pleins** : des sections entières en rose, avec le texte en noir (contraste 5,6:1, conforme AA) ;
  - crème `#fff6e6` pour le texte sur noir ;
  - un seul signal additionnel, le vert « temps restant » déjà utilisé par l'anneau des fiches.
- **Typographie :**
  - **Monument Extended Black à l'échelle de l'écran** : mots à 18–28vw, chiffres tabulaires ;
  - PolySans pour le texte courant ;
  - une mono libre (Geist Mono ou JetBrains Mono, licence OFL) pour les libellés HUD.
- **Composition :**
  - blocs plein écran à coupes franches, sans arrondis ;
  - repères en croix aux angles des cellules, comme un HUD discret ;
  - grille stricte à 12 colonnes.
- **Images :** uniquement des couvertures IGDB réelles, **traitées en bichromie rose et noir** en CSS (`mix-blend-mode` / `filter`). Elles reprennent leurs couleurs au survol. La bichromie unifie des couvertures hétérogènes et devient une signature.
- **Textures :** aucune trame CRT ni pixel. Le « rétro » passe uniquement par la grammaire (compte à rebours, high scores, 1UP), jamais par le pastiche visuel.

### 4. Hero

- **Texte :** « CONTINUE ? » sur toute la largeur. Dessous, un champ « Tapez un jeu » et l'invite « PRESS START » (avec la touche `/` comme raccourci).
- **Mouvement :**
  - au chargement, un seul décompte 9 → 0 en 1,2 s, **décoratif et non bloquant** : le champ est actif dès le premier paint ;
  - quand un jeu est choisi, les lettres du hero se recomposent en « **40 H · 80 H · 140 H** », puis « GAME OVER LE 3 DÉC. ».
- **CTA :** « Voir la fiche → ».
- **Sans JavaScript :** le hero reste un formulaire qui mène à une page de résultats statique.

### 5. Navigation et rythme

- Une barre HUD minimale : logo, Genres, Actus, Rechercher `/`.
- La page avance par « niveaux » plein écran, avec des coupes franches plutôt que des fondus : NIVEAU 1, NIVEAU 2…
- Rythme rapide et percussif : chaque section tient sur un écran.

### 6. Jeux, chiffres et preuves

- **« HIGH SCORES »**, des tableaux de classement façon arcade :
  - les plus longs ;
  - les plus courts ;
  - les plus *finis* (taux de complétion Steam) ;
  - le meilleur €/heure.
- Chaque ligne affiche rang, couverture bichrome, nom et durée.
- Chiffres de preuve en compteur de score : « 08 443 JEUX CHRONOMÉTRÉS ».

### 7. Animations et leur utilité

| Animation | Utilité |
|---|---|
| Décompte initial | Pose le concept sans bloquer. |
| Recomposition du hero | Feedback immédiat de la recherche. |
| Compteurs qui défilent à l'entrée dans l'écran | Hiérarchiser les chiffres. |
| Bichromie → couleur au survol | Indiquer ce qui est cliquable. |

Avec `prefers-reduced-motion`, tous les états finaux s'affichent directement.

### 8. Références

- [Huxley Saga](references.md) : tuiles HUD, repères en croix, wordmark de toute la largeur.
- [The Verge](references.md) : aplomb typographique.
- [Overworld](references.md) : ce qu'il ne faut **pas** faire (porte d'entrée, exploration).
- Le preloader « GAME / OVER » supprimé du dépôt : même énergie, mais il bloquait l'accès.

### 9. Ce qui est original

- Le compte à rebours est **branché sur de vraies données**, pas sur une fin décorative.
- Les high scores sont faits de **temps de jeu**, pas de points.
- La bichromie systématique des couvertures donne une identité à un catalogue d'images qui ne nous appartiennent pas.

### 10. Faisabilité

- **Coût : M à L.** La recomposition typographique demande du JS (Web Animations API ; GSAP, désormais gratuit, seulement si nécessaire).
- **Risques :**
  - cliché rétro si l'exécution dérape ;
  - lisibilité des aplats roses sur de longues sections ;
  - fatigue sur mobile, où le plein écran systématique rallonge le scroll ;
  - CLS de la police monumentale.
- **Performance :** correcte si les couvertures sont chargées en lazy et le hero sans image.

---

## Direction 2 — « Générique »

*La voie éditoriale et cinématographique.*

### 1. Idée directrice

Tout jeu se termine par un **générique**. La home de Game Over se lit comme un générique de fin doublé d'un magazine de cinéma. Elle traite chaque jeu comme une œuvre, avec une affiche, des crédits et une durée. Elle traite le visiteur comme un spectateur qui choisit sa séance selon le temps qu'il a.

### 2. Émotion et message

- **Émotion :** le plaisir de choisir, la nostalgie, la confiance.
- **Message :** « Choisissez le bon jeu pour le temps que vous avez. »

### 3. Système graphique

- **Couleurs :** nuit `#010103` et crème `#fff6e6`. Le rose **réduit à un filet et à un index** (numéros, soulignés).
- **Typographie :**
  - **PP Cirka** (serif display, déjà dans le dépôt, sous réserve de licence) pour les titres, en grand corps et en italique pour les citations ;
  - PolySans pour l'UI ;
  - les listes de crédits en PolySans Slim capitales, interlettrage +0,2 em, centrées comme un générique ;
  - Monument réservé au mot « GAME OVER » de fin de page.
- **Composition :**
  - grille éditoriale asymétrique ;
  - grandes respirations ;
  - bandes noires façon letterbox autour des images ;
  - crédit vertical en marge (à la manière de Letterboxd).
- **Images :** **key art 16:9 en plein cadre** (artworks et captures IGDB) et couvertures traitées comme des affiches.
- **Texture :** grain argentique statique très léger.

### 4. Hero

- **Image :** le key art du « jeu de la semaine », choisi automatiquement parmi les sorties récentes populaires (ou repris de l'actu la plus lue). Crédit vertical en marge : « HOLLOW KNIGHT: SILKSONG (2025) — 27 H ».
- **H1 (serif) :** « Chaque jeu a un générique. **Voici quand vous verrez le vôtre.** »
- **Recherche :** sous le titre, en champ éditorial (« Quel jeu ? »).
- **CTA :** « Combien de temps ? → » vers la fiche du jeu de la semaine.
- **Mouvement :** un fondu lent de l'image au premier paint, rien d'autre.

### 5. Navigation et rythme

- Header fin : logo, Genres, Actus, recherche.
- La page se lit **comme des chapitres numérotés** : 01 Ce soir, 02 Ce week-end, 03 Les dépêches, 04 Générique.
- Rythme lent et respirant, alternant des pleines pages d'image et des pages de texte.

### 6. Jeux, chiffres et preuves

- **« Programmes »** : la curation par temps disponible.

  | Programme | Durée |
  |---|---|
  | **Une soirée** | < 4 h |
  | **Un week-end** | < 15 h |
  | **Un mois** | < 40 h |
  | **Une saison** | > 80 h |

  Chaque programme montre 4 affiches, filtrées et triées par popularité au build.
- **Équivalences :** « Elden Ring = 20 films », mis en scène comme une affiche double.
- **Preuves en générique :** le footer déroule les crédits du site. « Durées : HowLongToBeat. Avis : Steam. Prix : IsThereAnyDeal. Images : IGDB. 8 443 jeux. Mis à jour le… » La **transparence des sources devient un objet graphique.**

### 7. Animations et leur utilité

| Animation | Utilité |
|---|---|
| Défilement du générique en pied de page, lié au scroll (CSS scroll-driven) | Signature de fin de page, qui se termine sur « GAME OVER ». |
| Révélation douce des chapitres | Rythme de lecture. |
| Transition affiche → fiche (View Transition cross-document) | Continuité de la navigation. |

### 8. Références

- [Letterboxd](references.md) : backdrop crédité, affiches.
- [The Verge](references.md) : dépêches horodatées.
- [AI in Design Report](references.md) : chapitres numérotés, chiffres-callouts.
- [Tie-break](references.md) : serif italique, grain.
- [The Pudding](references.md) : numérotation éditoriale.

### 9. Ce qui est original

- Le **générique comme système de sourcing**.
- La curation **par séance** plutôt que par genre.
- L'équivalence jeu / films, qui transforme une durée en culture.

### 10. Faisabilité

- **Coût : S à M.**
- **Risques :**
  - **dépendance au key art**. La base ne stocke pas d'artworks (fonction F8 non construite). Il faudrait ajouter `artworks` / `screenshots` IGDB à la synchro, ce que le script d'actus fait déjà au moment de l'écriture.
  - **poids et LCP** de l'image plein cadre (IGDB `1080p` en hotlink). Il faut des tailles responsives et un `fetchpriority` adapté.
  - **ton** proche d'un média cinéma, donc moins « gaming » ;
  - **licence de PP Cirka** à confirmer.

---

## Direction 3 — « Ligne d'arrivée »

*La voie inattendue : le temps comme matière graphique.*

### 1. Idée directrice

Le temps n'est pas illustré, il **est** la mise en page. La home est le calculateur. On y lit une phrase à compléter : « J'ai **[7 h]** par semaine et je veux finir **[Elden Ring]** ». La page répond par une **ligne d'arrivée datée** : une règle graduée qui part d'aujourd'hui, une barre à l'échelle du jeu, un drapeau sur « GAME OVER · 3 DÉC. ».

Plus bas, chaque jeu, chaque actu, chaque genre est représenté par **sa barre de durée**. Le langage graphique est une unité de mesure.

### 2. Émotion et message

- **Émotion :** le contrôle, la clarté, la satisfaction de se dire « je peux le faire ».
- **Message :** « Game Over vous dit **quand** vous verrez la fin. »

### 3. Système graphique

- **Couleurs :** noir, crème et rose `#ff008a`. Le rose devient le **code de la durée** :

  | Durée | Traitement de la barre |
  |---|---|
  | Histoire principale | Barre pleine |
  | + Extras | Contour |
  | 100 % | Hachures |

  Le système marche en monochrome et ne repose pas sur la couleur seule.
- **Typographie :**
  - Monument Extended pour la **date** (« 3 DÉC. ») en très grand ;
  - une mono libre pour toutes les graduations et les chiffres (« 0 h · 10 h · 20 h ») ;
  - PolySans pour les phrases.
- **Composition :**
  - fond en **papier millimétré** très discret (filets crème à 6 % d'opacité, tous les 8 px et tous les 40 px) ;
  - l'**axe du temps organise tout**. Sur desktop, il est horizontal. **Sur mobile, il devient vertical, et scroller, c'est faire passer le temps.**
- **Images :** les couvertures restent petites, comme des pastilles au départ des barres. La donnée est l'image.
- **Texture :** la grille et les graduations, rien d'autre.

### 4. Hero

- **H1 :** « Quand verrez-vous la fin ? »
- **Phrase-formulaire :** « J'ai **[7 h ▾]** par semaine. Je veux finir **[Elden Ring ▾]**. »
  - Le premier sélecteur reprend `PACES = [3, 7, 15, 30]` de `src/features/jeu/components/Pace/pace.ts`.
  - Le second est un champ de recherche.
- **Résultat :** une règle graduée d'aujourd'hui à la date de fin, la barre du jeu, puis **« GAME OVER · 3 DÉC. »** en Monument géant.
- **État par défaut :** rendu **statiquement au build**, avec 7 h par semaine et un jeu populaire du moment. Le hero est donc complet sans JS, indexable et sans CLS.
- **CTA :** « Voir la fiche » et « Changer de jeu ».

### 5. Navigation et rythme

- Header fin avec recherche.
- La page descend **le long de la règle**. Chaque section est un jalon (« Dans une soirée », « Avant Noël », « Cette semaine dans les actus »).
- Le rythme est régulier, comme les graduations d'un mètre ruban.

### 6. Jeux, chiffres et preuves

- **« Avant Noël »** : à votre rythme, les jeux populaires que vous pouvez finir avant le 25 décembre. Les listes sont **pré-calculées au build pour chacun des quatre rythmes**, et le sélecteur du hero bascule de l'une à l'autre.
- **« La règle »** : une grande frise de 0 à 200 h où environ 40 jeux populaires sont placés à leur durée réelle. C'est la pièce data-viz signature, celle qu'on partage.
- **Actus chronométrées** : chaque carte d'actu porte la barre de durée du jeu concerné. Cela oblige à tenir la promesse affichée sur `/actus`.
- **Preuves :** « 8 443 jeux · durées HowLongToBeat · avis Steam · prix IsThereAnyDeal · mis à jour le… », écrit comme une **note de bas de graphique**.

### 7. Animations et leur utilité

| Animation | Utilité |
|---|---|
| Les barres grandissent jusqu'à leur longueur à l'entrée dans l'écran (CSS scroll-driven) | Fait *sentir* les durées relatives. |
| Changement de rythme : la date roule et les barres se réarrangent (`document.startViewTransition`, même document) | Feedback de l'outil. |
| Drapeau « GAME OVER » qui se plante à l'arrivée de la barre | **Le seul moment de célébration**, emprunté à la direction 1. |

Avec `prefers-reduced-motion`, les états finaux s'affichent instantanément.

### 8. Références

- [The Pudding](references.md) : recherche d'abord, donnée expressive.
- [Tracing Art](references.md) et [ESPN F1](references.md) : base de données rendue narrative, frise.
- [Huxley](references.md) : tuiles de chiffres.
- [Tie-break](references.md) : un élément du sujet devient la grille (ici, la règle graduée).
- [Backloggd](references.md) : le plancher du secteur à dépasser.

### 9. Ce qui est original

- **Aucun site du secteur ne montre une date de fin.** Game Over transforme sa seule fonction propriétaire en identité.
- L'**axe vertical sur mobile**, où scroller fait passer le temps.
- Un **système de barres réutilisable partout** (fiches, genres, actus). La refonte de la home corrige aussi, par ricochet, la pauvreté des pages genre.

### 10. Faisabilité

- **Coût : M.**
  - Toutes les données existent : `getGames()` fournit durées, popularité et `timeRank`.
  - La logique du rythme existe déjà (`paceDays`, `formatPace`).
  - JS estimé entre 8 et 12 Ko gzip.
- **Risques :**
  - **« faire outil »** plutôt que marque. Le remède est la date en Monument géant, le drapeau GAME OVER et une écriture éditoriale ;
  - **data-viz sur petit écran**, résolu par l'axe vertical ;
  - **accessibilité de la frise** : il faut une liste équivalente en texte et un ordre de tabulation logique.

---

## Comparatif

| Critère | 1. CONTINUE ? | 2. Générique | 3. Ligne d'arrivée |
|---|---|---|---|
| Différenciation dans le secteur | Forte | Moyenne (le registre de Letterboxd existe) | **Très forte** (aucun équivalent) |
| Fidélité à l'ADN actuel (noir, rose, Monument) | **Très forte** | Moyenne (Cirka prend le dessus) | Forte |
| Sert l'usage (trouver un jeu, décider) | Moyen | Moyen à fort | **Très fort** |
| SEO et contenu indexable sur la home | Moyen | Fort | **Fort** (listes et frise rendues au build) |
| Lisibilité et accessibilité | Risquée (aplats, plein écran) | **Excellente** | Bonne, si la frise a un équivalent texte |
| Coût de développement | M à L | S à M (+ synchro des artworks) | M |
| Risque de performance | Moyen | Moyen à élevé (key art) | **Faible** |
| Mémorabilité | Forte | Moyenne | Forte (« le site qui m'a donné une date ») |

Recommandation argumentée : voir [`decision.md`](decision.md).
