# Recommandations "D'autres jeux à terminer"

Sur chaque page de jeu, la liste "D'autres jeux à terminer" propose 12 jeux au gameplay proche. Les listes sont calculées hors ligne, stockées en base, puis lues au build. Aucun calcul de similarité n'a lieu pendant le rendu d'une page.

## Vue d'ensemble

```
Steam tags + IGDB (genres, mots-clés, thèmes...)
        |
        v
scripts/embed-games.ts      profil de gameplay -> embedding OpenAI -> game_embedding
        |
        v
scripts/recommend.ts        score hybride -> game_recommendation (12 jeux par jeu)
        |
        v
src/features/jeu/api/getRelatedGames.ts   lecture au build, repli par genres
```

`scripts/update-catalog.sh` enchaîne ces étapes chaque semaine. Si les embeddings échouent, les recommandations ne sont pas recalculées : le build garde les listes précédentes, ou le repli.

## Le score

Chaque jeu candidat reçoit un score entre 0 et 1, somme pondérée de sept signaux (`WEIGHTS` dans `src/config/recommendations.ts`) :

| Signal | Poids | Ce qu'il mesure |
|---|---|---|
| `vector` | 0,35 | Proximité des embeddings (similarité cosinus) |
| `descriptors` | 0,35 | Tags Steam et mots-clés IGDB en commun, pondérés par les votes |
| `genres` | 0,10 | Genres IGDB en commun (sans "Indie") |
| `modes` | 0,05 | Modes de jeu en commun (solo, coop...) |
| `similar` | 0,05 | Le jeu figure dans les "jeux similaires" d'IGDB |
| `time` | 0,05 | Durée de l'histoire principale proche |
| `quality` | 0,05 | Note du jeu |

Règles appliquées ensuite :
- sous `MIN_SCORE` (0,3), un jeu n'est pas recommandé : une liste plus courte vaut mieux que du remplissage ;
- au plus `MAX_PER_SERIES` (2) jeux d'une même franchise ou collection ;
- `MMR_LAMBDA` vaut 1 : pas de diversification (voir "Évaluation").

Le profil de gameplay exclut volontairement les noms, studios, plateformes et dates : deux jeux ne doivent pas se ressembler à cause d'une marque. Les tags sans rapport avec le gameplay (récompenses, boutiques, "indie", "great soundtrack"...) sont listés dans `IGNORED_DESCRIPTORS`.

## Repli

Un jeu sans recommandation en base (pas de profil, score trop bas partout) reçoit la règle historique par genres : au moins deux genres en commun, hors les quatre genres "remplissage" (Adventure, Indie, Simulator, Strategy) que le scraping de 2021 a posés sur 45 % des anciens jeux.

## Commandes

Variables dans `.env.local` : `DATABASE_URL`, `OPENAI_API_KEY`, `EMBEDDING_MODEL` (par défaut `text-embedding-3-small`).

```sh
# Estimer le coût sans rien envoyer
pnpm tsx scripts/embed-games.ts --dry-run

# Embeddings des profils nouveaux ou modifiés, avec un budget en dollars
pnpm tsx scripts/embed-games.ts --max-usd 1

# Voir les recommandations de quelques jeux sans écrire en base
pnpm tsx scripts/recommend.ts --dry-run --slug rimworld,factorio

# Calculer et écrire toutes les listes (pas d'appel API, quelques minutes)
pnpm tsx scripts/recommend.ts
```

`embed-games.ts` ne renvoie que les jeux dont le profil, le modèle ou les dimensions ont changé : un run hebdomadaire sans nouveauté ne coûte rien.

## Base de données

Les embeddings utilisent l'extension pgvector (colonne `vector(512)`). Postgres doit donc tourner avec l'image `pgvector/pgvector` (voir `infra/postgres/docker-compose.yml`), basée sur Debian trixie comme `postgres:17.6` : même glibc, donc mêmes collations. La recherche des voisins est exacte (sans index approché) : le catalogue est assez petit.

Tables : `game_embedding`, `game_recommendation`, `steam_tags`, et de nouvelles colonnes dans `igdb_info` (migrations `0009_pgvector.sql` et `0010_recommendations.sql`).

## Évaluation

`evaluation/recommendations/` contient 17 jeux de référence (`references.json`), les notes de pertinence (`judgments.json`, de 0 hors sujet à 3 gameplay très proche) et le rapport généré (`report.md`).

```sh
pnpm tsx scripts/evaluate-recommendations.ts          # régénère report.md
pnpm tsx scripts/evaluate-recommendations.ts --tune   # recherche des poids
```

Le script ajoute à `judgments.json` les jeux proposés par chaque variante qui n'ont pas encore de note, sans écraser les notes existantes. Une note `null` reste à juger. Les notes marquées `claude-draft` sont des propositions non relues : le rapport le signale.

Résultats de la version `hybrid-1` (17 jeux, pertinent = note >= 2) :

| Variante | P@5 | P@10 | nDCG@10 |
|---|---|---|---|
| Ancienne règle | 0,11 | 0,09 | 0,11 |
| Descripteurs seuls | 0,75 | 0,68 | 0,69 |
| Embeddings seuls | 0,74 | 0,61 | 0,67 |
| Hybride | 0,79 | 0,68 | 0,72 |
| Hybride + MMR | 0,73 | 0,65 | 0,68 |

L'hybride est la meilleure variante ; le MMR la dégrade, d'où `MMR_LAMBDA = 1`.

## Changer l'algorithme

1. Modifier les poids ou filtres dans `src/config/recommendations.ts`, c'est le seul endroit.
2. Relancer l'évaluation et comparer avec le tableau ci-dessus. Avec 17 jeux, éviter de sur-ajuster : un écart de quelques centièmes n'est pas significatif.
3. Incrémenter `ALGO_VERSION` : les lignes d'une ancienne version sont ignorées à la lecture.
4. Lancer `scripts/recommend.ts` pour recalculer les listes, puis rebuild.
