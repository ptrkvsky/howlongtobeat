# Recommandation et décisions à valider

## Recommandation

**Retenir la direction 3, « Ligne d'arrivée », comme ossature.** Elle emprunte deux éléments, et deux seulement, aux autres directions :

| Emprunt | Vient de | Rôle |
|---|---|---|
| **Le moment « GAME OVER »** : le drapeau et la date en Monument géant qui se plantent au bout de la barre. Le noir, le rose `#ff008a` et Monument gardent la voix de la marque. | Direction 1 | Charge émotionnelle et signature |
| **Les sources en générique** : la note de bas de graphique qui crédite HowLongToBeat, Steam, IsThereAnyDeal et IGDB. | Direction 2 | Confiance |

### Pourquoi la direction 3

1. **Elle met en avant la seule chose que Game Over fait et que personne d'autre ne fait.**
   - Les durées viennent de HowLongToBeat, donc la donnée n'est pas propriétaire.
   - Le calcul d'une **date de fin** à son rythme est propre à Game Over. Il existe déjà (`pace.ts`), mais il est enfoui au milieu des fiches.
   - La direction 3 en fait la porte d'entrée et l'identité.
2. **Elle sert l'usage réel.**
   - Le visiteur veut savoir si un jeu tient dans sa vie. La home répond en une phrase, puis propose une curation datée (« Avant Noël ») qui débouche sur des fiches.
   - C'est aussi le chemin vers les clics d'affiliation (prix par heure).
3. **Elle est la plus solide techniquement.**
   - Le hero est typographique, sans image, donc avec un LCP rapide.
   - Les listes sont pré-calculées au build, puis enrichies en JS (8 à 12 Ko).
   - Aucune nouvelle dépendance n'est nécessaire.
   - Elle colle à la règle « ≤ 2× le poids » et à l'historique : pas de preloader.
4. **Elle améliore le reste du site.**
   - Le composant « barre de durée » réparera les pages genre (aujourd'hui de simples listes de noms).
   - Il apportera de la cohérence aux actus (une barre par actu).
5. **Elle est mémorable sans être un gimmick.** « Le site qui m'a donné une date » est une histoire qui se raconte, et une og:image qui se partage.

### Pourquoi pas les deux autres comme ossature

- **CONTINUE ?** est la plus spectaculaire et la plus fidèle à l'ADN visuel. Mais :
  - le risque de pastiche rétro est réel ;
  - le plein écran systématique fatigue sur mobile ;
  - la recomposition typographique coûte cher pour un bénéfice d'usage modeste ;
  - c'est une excellente *source de signature*, pas une ossature.
- **Générique** est la plus élégante et la plus lisible. Mais :
  - elle dépend d'images que la base ne stocke pas (artworks) ;
  - son poids et son LCP sont les plus risqués ;
  - son registre ressemble à Letterboxd, ce qui la rend moins différenciante ;
  - elle déplace la marque vers le cinéma.

## Risques de la recommandation et parades

| Risque | Parade |
|---|---|
| Faire « outil » ou « dashboard » plutôt que marque | La date en Monument géant, le drapeau GAME OVER, une écriture éditoriale (phrases, pas de libellés techniques). Le papier millimétré reste à peine visible. |
| Data-viz illisible sur mobile | Axe vertical sur mobile. Une donnée par ligne. Libellés en clair (« 40 h »), jamais la couleur seule (plein, contour, hachures). |
| Accessibilité de la frise | Une liste équivalente en texte, un focus clavier sur chaque jeu, `aria-label` sur les barres, un ordre de tabulation logique. |
| La date perçue comme une promesse | Le wording reste une estimation (« vers le 3 décembre ») : c'est déjà celui des fiches. Le rythme est modifiable en un geste. |
| Fraîcheur de la date « aujourd'hui » | Rebuild horaire, puis recalcul côté client au chargement. |
| Jalons de calendrier (« Avant Noël ») à maintenir | Une table de jalons dans le code (Noël, vacances scolaires, été), choisie automatiquement au build. |

## Questions ouvertes, hors design pur mais qui conditionnent la home

1. **Auteurs.** `docs/actus.md` décrit Léa Moreau, Thomas Ferrand et Inès Bakri comme des personas inventés. Leurs pages leur donnent un parcours (« Dans le jeu vidéo depuis 2012 »). Les articles sont rédigés automatiquement à partir de GameSpot et publiés toutes les heures.
   - **Recommandation :** ne pas mettre ces auteurs en avant sur la home comme une preuve de crédibilité. La preuve doit venir des données et des sources.
   - **Plus largement :** une décision éditoriale de transparence est à prendre (mention de la rédaction assistée, ou identité réelle). Le sujet touche à la confiance des lecteurs et aux critères de qualité de Google (E-E-A-T).
2. **Consentement.** GTM se charge sans bannière de consentement. C'est à traiter avant ou avec la refonte. Une bannière ajoutée après coup cassera la composition du premier écran : il faut la prévoir dans la maquette.
3. **Mentions légales et politique de confidentialité.** Elles sont obsolètes : hébergeur OVH au lieu de Vercel, SIREN vide, newsletter, paiement et commentaires inexistants. À corriger, indépendamment de la DA.
4. **Licences des polices.** Monument Extended, PolySans et PP Cirka sont des polices commerciales. La licence web doit être confirmée avant d'en faire la signature monumentale de la home.
5. **Logo.** Il n'existe aujourd'hui qu'en texte. Faut-il un vrai logotype (par exemple Monument plus un drapeau d'arrivée) dans cette refonte ou plus tard ?
6. **Libellés des genres en français** et doublon « Platform » / `platformd`. C'est un prérequis de la section « Par genre ».
7. **Actus sans jeu lié.** Seules 2 des 8 actus vérifiées pointent vers une fiche. La section « Actus chronométrées » suppose un lien jeu presque systématique, ce qui relève du pipeline d'actus.

## Décisions à valider avant la Phase 2

| # | Décision | Proposition |
|---|---|---|
| D1 | Direction retenue | **3, « Ligne d'arrivée »**, plus le moment GAME OVER (direction 1) et les sources en générique (direction 2) |
| D2 | Promesse de marque | « Votre prochain Game Over : [date]. » / H1 « Quand verrez-vous la fin ? » |
| D3 | Palette et typographie | Garder noir `#010103`, crème `#fff6e6`, rose `#ff008a`, Monument et PolySans. Ajouter une mono OFL. Ne pas utiliser Cirka (réservée à la direction 2). |
| D4 | Recherche | Index JSON maison chargé au focus. Pagefind en repli si l'index dépasse 150 Ko gzip. |
| D5 | Image du hero | Retirer `bg.jpg`. Hero sans photo. |
| D6 | Périmètre Phase 2 | Home et composant barre de durée. Pages genre (tri par durée, libellés FR) dans un lot suivant. |
| D7 | Animations | CSS scroll-driven et View Transitions natives, sans librairie, avec `prefers-reduced-motion` global |
| D8 | Budget | JS ≤ 15 Ko gzip hors index, LCP mobile < 2 s, CLS < 0,05 |
| D9 | Auteurs sur la home | Non mis en avant (voir la question ouverte 1) |
| D10 | Consentement | Prévu dans la maquette (voir la question ouverte 2) |

## Prochaine étape proposée

Après validation, et avant d'écrire le moindre composant : **une maquette HTML statique du hero et de « La règle »** (desktop et mobile), sur données réelles. Elle sert à valider le rendu de la date, de la grille et des barres, ainsi que l'axe vertical sur mobile. C'est la partie la plus risquée de la direction.
