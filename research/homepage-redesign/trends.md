# Tendances pertinentes pour Game Over

> **Sur quoi s'appuie ce document.** Il repose sur les 14 références de [`references.md`](references.md), dont 8 ont été vues en direct. L'échantillon est petit.
>
> **Ce qui compte comme tendance.** Une tendance n'est retenue que si elle est **observée** sur plusieurs références. Une tendance seulement annoncée dans des articles n'est pas retenue.
>
> **Comment lire les tableaux.** Le coût et le poids sont estimés pour la stack actuelle (Astro statique, CSS Modules, aucun framework JS) :
> - **Coût** : S = moins d'un jour, M = 2 à 5 jours, L = plus d'une semaine.
> - **Poids** : impact sur le transfert et le temps d'exécution.

## Synthèse

| # | Tendance | Observée sur | Fit Game Over | Coût | Poids | Verdict |
|---|---|---|---|---|---|---|
| 1 | Données en tuiles « HUD » et chiffres-monuments | Huxley, AI report, Backloggd | ★★★ | S | ~0 | **Retenue, centrale** |
| 2 | Typographie monumentale | Huxley, The Verge, Tie-break, (Game Over lui-même) | ★★★ | S | Police déjà chargée | **Retenue** |
| 3 | Base de données rendue narrative (data storytelling) | Tracing Art, ESPN F1, AI report, The Pudding | ★★★ | M | Faible si SVG / CSS | **Retenue, différenciante** |
| 4 | Recherche et navigation à personnalité | The Pudding, Backloggd, Letterboxd | ★★★ | M | Index JSON lazy | **Retenue, fonctionnelle** |
| 5 | Flux éditorial horodaté et numéroté | The Verge, The Pudding, AI report | ★★☆ | S | ~0 | **Retenue (actus)** |
| 6 | Serif display associé à une UI sans ou mono | Overworld, Letterboxd, Tie-break, AI report, The Verge | ★★☆ | S | +20 Ko (Cirka déjà présente) | **Optionnelle (direction 2)** |
| 7 | Noir atmosphérique et grain | Overworld, Huxley, Tie-break, Pudding, Verge, Backloggd | ★★☆ | S | ~1 Ko (SVG noise) | **Retenue avec mesure** |
| 8 | Site-jeu, mondes WebGL | Overworld, Tie-break, Bruno Simon, Ponpon Mania | ★☆☆ | L | +200 Ko à plusieurs Mo | **Écartée pour la home** (easter egg / 404 éventuel) |
| 9 | Smooth scroll et révélations au scroll | Huxley (Lenis) | ★☆☆ | S–M | +5–10 Ko | **Version native CSS seulement** |

## Détail

### 1. Données en tuiles « HUD » et chiffres-monuments

- **Preuves :**
  - Huxley aligne quatre tuiles de chiffres segmentés avec repères en croix ([capture](captures/ref-huxley-stats.jpg)).
  - AI report pose un « 25+ » géant dans un aplat ([capture](captures/ref-ai-design-report.jpg)).
  - Backloggd affiche ses compteurs « 72M / 379K / 43.3M ».
- **Pourquoi ça colle :** le produit de Game Over *est* un chiffre : 40 h, 80 h, 140 h, et une date. La fiche jeu a déjà des cartes de durée. Il suffit de leur donner une stature de monument.
- **Différenciation :** forte si l'unité devient graphique (« h », « sem. », « 3 DÉC. »). Elle est faible si l'on se contente de compteurs façon Backloggd.
- **Lisibilité :** excellente, à condition d'utiliser des chiffres tabulaires et d'accompagner chaque nombre d'un libellé en clair.
- **Coût et performance :** CSS seul.

### 2. Typographie monumentale

- **Preuves :**
  - Huxley : un wordmark de toute la largeur ([capture](captures/ref-huxley-hero.jpg)).
  - The Verge : un wordmark vertical en marge.
  - Tie-break : un serif italique géant.
  - Chez Game Over même, la page genre affiche un H1 d'environ 128 px ([capture](captures/gameover-genre-rpg-desktop.jpg)) et les fiches ont des titres de jeux en contour géant.
- **Pourquoi ça colle :** Monument Extended Black est déjà la voix de la marque. Il ne s'agit pas d'adopter une tendance mais d'**assumer un actif existant**.
- **Risques :**
  - le CLS au chargement de la police (la home affiche déjà un CLS de 0,058) : précharger la woff2 de Monument, environ 24 Ko ;
  - la casse des titres longs en français (césures, `text-wrap: balance`).
- **Coût :** S.

### 3. Base de données rendue narrative

- **Preuves :**
  - Tracing Art, Site of the Month en juillet 2025 : 12 millions d'enregistrements en constellations.
  - ESPN F1, Honorable Mention en juin 2026 : une frise depuis 1950.
  - AI report, Site of the Day en août 2026.
  - The Pudding : tout le média.
- **Pourquoi ça colle :** Game Over possède 8 443 jeux avec trois durées, une popularité, un percentile, une complétion Steam et un prix. **Aucun concurrent du secteur ne met en scène cette matière.** Backloggd et HowLongToBeat la listent. Les sites gaming primés en 2026 sont des studios et des mini-jeux, pas des bases de données. Le terrain est libre.
- **Forme recommandée :** des barres à l'échelle de la durée et une règle graduée en heures, en SVG ou CSS rendus au build. Pas de WebGL.
- **Lisibilité :** il faut un équivalent texte pour chaque barre, ce que l'existant fait déjà (« 40 h »).
- **Coût :** M. Le calcul a lieu au build (`getGames()` fournit déjà `timeRank` et `popularity`).

### 4. Recherche et navigation à personnalité

- **Preuves :**
  - The Pudding ouvre sa page sur « Find a story… » ([capture](captures/ref-the-pudding.jpg)).
  - Backloggd et Letterboxd ont la recherche dans le header.
- **Pourquoi ça colle :** l'intention n°1 d'un visiteur est « mon jeu ». C'est aujourd'hui **impossible** sur Game Over, qui n'a aucune recherche.
- **Différenciation :** ce n'est pas une tendance esthétique, c'est un prérequis. La différenciation vient de la **réponse instantanée** : taper « elden » affiche directement « 40 h · fin vers le 3 déc. », pas une liste de liens.
- **Coût :** M. Un index JSON généré au build et chargé au focus. Voir [`technical-feasibility.md`](technical-feasibility.md).

### 5. Flux éditorial horodaté et numéroté

- **Preuves :**
  - The Verge : Quick Posts avec heure ([capture](captures/ref-the-verge.jpg)).
  - The Pudding : « #226 · OCT 2026 ».
  - AI report : chapitres 01 / 02 / 03.
- **Pourquoi ça colle :** les actus sont publiées toutes les heures. Un flux horodaté en mono dit la fraîcheur sans effort.
- **Garde-fou :** horodater, c'est aussi exposer le rythme mécanique (« :17 » chaque heure). Voir les questions ouvertes dans [`decision.md`](decision.md).
- **Coût :** S.

### 6. Serif display associé à une UI sans ou mono

- **Preuves :** Overworld (Ivar avec capitales espacées), Letterboxd (Tiempos avec Graphik), Tie-break (Instrument italique), The Verge (PolySans Mono pour les heures).
- **Pourquoi c'est optionnel :** la tendance apporte chaleur et autorité éditoriale. Mais elle éloigne de l'énergie Monument et rose. **PP Cirka Variable est déjà dans le dépôt, non utilisée.** C'est une opportunité à coût nul *si sa licence web est confirmée*.
- **Usage :** pertinent pour la direction 2 (« Générique »).

### 7. Noir atmosphérique et grain

- **Preuves :** six des huit sites vus en direct sont sombres. Overworld et Tie-break ajoutent un grain argentique.
- **Pourquoi « avec mesure » :**
  - Game Over est déjà noir. Le grain peut adoucir le noir `#010103` très dur.
  - En excès, il nuit à la lisibilité et peut coûter en rendu s'il est animé.
  - Recommandation : un grain statique en SVG `feTurbulence` à faible opacité, jamais animé.

### 8. Site-jeu et mondes WebGL — écartée pour la home

- **Preuves :** Overworld ([capture](captures/ref-overworld-hero.jpg)), Tie-break, Bruno Simon (Site of the Month janvier 2026), Ponpon Mania (Site of the Month octobre 2025).
- **Pourquoi l'écarter :**
  - L'usage de Game Over est de chercher puis de lire.
  - Une navigation par exploration ralentit l'accès, n'est pas indexable et pèse lourd (Overworld a la note de performance la plus basse de sa fiche).
  - L'historique du dépôt montre que le preloader GSAP a déjà été retiré.
- **Ce qu'on peut garder :** un mini-jeu en easter egg sur la **404** (« Game over : cette page n'existe pas »), chargé à la demande.

### 9. Smooth scroll et révélations au scroll — version native uniquement

- **Preuves :** Lenis sur Huxley. D'autres sites ont des révélations au scroll citées par Awwwards mais non observées.
- **Recommandation :**
  - Pas de librairie de scroll.
  - Les CSS scroll-driven animations (`animation-timeline: view()`) suffisent pour faire grandir des barres et révéler des sections. Elles ont un repli statique si le navigateur ne les supporte pas.
  - Le scroll natif est conservé, ce qui préserve l'accessibilité, le scroll au clavier et `prefers-reduced-motion`.

## Tendances non retenues faute de preuve

| Tendance | Pourquoi elle n'est pas retenue |
|---|---|
| **View Transitions, variable fonts animées, typographie cinétique avancée** | Souvent annoncées comme tendance 2026, mais **non observées** sur les références examinées. Elles ne sont donc pas présentées comme tendances. Elles restent des **outils** pertinents (voir la faisabilité). |
| **Esthétique pixel / rétro gaming** | Seulement esquissée : chiffres segmentés de Huxley, jeu pixel de basement de 2023. Aucun exemple fort en 2025–26 dans l'échantillon. C'est un argument de plus pour **ne pas** faire du rétro au premier degré. |
