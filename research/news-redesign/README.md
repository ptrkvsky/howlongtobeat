# Refonte des actus : benchmark UX/UI

Dossier de recherche du 24 octobre 2026. Aucun fichier applicatif n'a été modifié.

| Fichier | Contenu |
|---|---|
| [audit-existant.md](audit-existant.md) | Diagnostic des actus actuelles, **par lecture du code** (pas de capture de l'existant) |
| [benchmark.md](benchmark.md) | 12 références observées (listing et article, desktop 1440 et mobile 390), mesures de lecture, limites |
| [tendances-ux-ui.md](tendances-ux-ui.md) | 12 tendances, retenues ou écartées, avec leur implémentation observée |
| [recommandations.md](recommandations.md) | Synthèse, verdict sur la direction pressentie, recommandations listing et détail |
| [decisions-implementation.md](decisions-implementation.md) | Composants, routes, règles de sélection, tailles, mobile, accessibilité, SEO |
| [screenshots/](screenshots/) | 48 captures du premier écran : `<site>-<listing\|article>-<desktop\|mobile>.png` |

## Références observées

IGN France, GameSpot, Polygon, Eurogamer, PC Gamer, Rock Paper Shotgun, The Verge, Wired, The Pudding, Aftermath, Kotaku, 404 Media.

## Ce que le benchmark établit

1. **Aucune des 12 références n'affiche une durée de jeu dans une actualité.** Seuls IGN (jeu dans l'URL et en surtitre) et GameSpot (nœud `VideoGame` dans le JSON-LD, module « Latest on Featured Games ») traitent le jeu comme une entité.
2. **Aucun des 12 listings ne regroupe par jour.** Le regroupement est une approche disponible.
3. **Colonne de lecture :** 18 px est la taille modale (5 sites sur 12), l'interlignage va de 1,4 à 1,7, la largeur médiane est de 60 ch (50 à 71 ch, Polygon à 97 ch). L'existant, à 800 px, est estimé à 75 – 85 ch (non mesuré).
4. **Le texte est dans le HTML** sur les 11 articles contrôlés avec `curl` (GameSpot a répondu 403) ; la différence se joue sur le poids de la régie : de 20 à 982 requêtes.
5. **Aucune référence ne propose précédent / suivant ni cascade d'articles associés.**

## Limites de la session

- Le MCP `chrome-devtools` étant indisponible, les observations viennent d'un Chrome headless piloté par Playwright.
- Plusieurs bandeaux de consentement n'ont pas pu être fermés et recouvrent des captures.
- Wired : la rubrique jeux répond 404, les captures montrent la rubrique Culture et un article hors jeu.
- Pas de capture de l'existant Game Over (consigne de la session).

## Direction recommandée

- **Listing :** en-tête compact, « À la une » (1 grand + 2) choisie par règle, flux groupé par jour à densité variable, catégories en routes statiques, rangée « Jeux dans l'actu » avec seuil de masquage.
- **Détail :** colonne unique de 66 ch, carte jeu avec durées intercalée dans le texte, 3 articles associés en cascade (même jeu, même catégorie, récents), précédent / suivant, sans colonne latérale.

**En une phrase :** les médias gaming disent de quoi on parle ; Game Over peut dire combien de temps ça prend. *« L'actu, et le temps qu'il faut pour y jouer. »*
