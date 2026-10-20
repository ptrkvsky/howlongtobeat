# game-over.io

Le temps de jeu de vos jeux favoris : durées pour finir l'histoire, l'histoire et les extras, ou le jeu à 100 %, avec des fiches jeux enrichies (genres, éditeurs, avis Steam, liens externes…).

Site : [game-over.io](https://game-over.io)

## Stack

- [Astro](https://astro.build) 7 en sortie **100 % statique** (`build.format: file`, servi sans `.html` grâce à `cleanUrls` dans `vercel.json`)
- TypeScript, CSS Modules
- PostgreSQL 17 + [Drizzle ORM](https://orm.drizzle.team) (lu au build uniquement)
- Node 24, pnpm 10
- Hébergement : Vercel (CDN statique + Blob), build sur un VPS

## Hébergement et déploiement

Le site est buildé **sur un VPS**, pas chez Vercel. Vercel ne sert que les fichiers statiques déjà construits.

```
                    VPS (chaque lundi vers 4 h, timer systemd)
 ┌─────────────────────────────────────────────────────────────────────────┐
 │ scripts/deploy.sh                                                       │
 │   git pull → pg_dump → db:migrate → update-catalog.sh                   │
 │   → vercel build → contrôle du nombre de pages → vercel deploy --prebuilt│
 │                       │                                                 │
 │                       ▼                                                 │
 │   Postgres (Docker « gameover-postgres », 127.0.0.1:5433 uniquement)     │
 └───────────────────────┬─────────────────────────────────────────────────┘
                         │ build prêt à servir
                         ▼
               Vercel : CDN statique game-over.io (+ fonction pour /actus)
                         ▲
                         │ /actus rendu à la demande, mis en cache par le CDN
               Vercel Blob ◄── timer « game-over-news » du VPS (toutes les heures)
```

Pourquoi ce montage :

- **Aucune minute de build Vercel** : le build, long (plusieurs milliers de pages et mise à jour des données), tourne sur le VPS.
- **La base n'est jamais exposée** : Postgres n'écoute que sur la boucle locale du VPS. Seuls le build et les scripts d'import y accèdent.
- **Pas de déploiement au push** : `vercel.json` désactive les déploiements Git (`git.deploymentEnabled: false`). Seul `scripts/deploy.sh` met la production à jour.

Garde-fous de `scripts/deploy.sh` :

- refus de déployer si le build contient moins de 95 % des pages du déploiement précédent (`FORCE=1` pour passer outre) ;
- un seul déploiement à la fois (verrou `flock`) ;
- sauvegarde `pg_dump` avant chaque run, les 8 dernières sont gardées ;
- alerte [healthchecks.io](https://healthchecks.io) si un run échoue ou n'a pas lieu (`HEALTHCHECK_URL`) ;
- retour arrière avec `vercel rollback`.

Installation du VPS, du timer et commandes d'exploitation (logs, run manuel, restauration de la base) : **[scripts/systemd/README.md](scripts/systemd/README.md)**.

### Actus

Toutes les heures, le timer `game-over-news` du VPS lance [scripts/publish-news.ts](scripts/publish-news.ts). Le script rédige avec OpenAI un article original à partir d'une actu jeux vidéo en anglais, l'enrichit avec les données du catalogue (durée de vie, avis), l'illustre avec un visuel IGDB ou Steam du jeu, puis le publie en JSON sur Vercel Blob. Les pages `/actus`, `/actus/[slug]` et `/actus/sitemap.xml` sont les seules rendues à la demande (adaptateur `@astrojs/vercel`, `prerender = false`) : aucune reconstruction du site n'est nécessaire.

## Développement local

Prérequis : Node 24 (`.nvmrc`), pnpm 10, le CLI Vercel pour déployer.

```bash
pnpm install
cp <votre .env.local> .env.local
pnpm dev            # http://localhost:2811
```

La base tourne sur le VPS. Pour builder ou lancer les scripts depuis votre poste, ouvrez un tunnel SSH, puis pointez `DATABASE_URL` sur `127.0.0.1:5433` :

```bash
ssh -N -L 5433:127.0.0.1:5433 ubuntu@51.38.191.183
```

### Variables d'environnement (`.env.local`)

| Variable                               | Utilisée par                                     |
| -------------------------------------- | ------------------------------------------------ |
| `DATABASE_URL`                         | build du site, scripts, Drizzle                  |
| `IGDB_CLIENT_ID`, `IGDB_CLIENT_SECRET` | enrichissement IGDB (identifiants Twitch)        |
| `STEAM_API_KEY`                        | avis et succès Steam                             |
| `ITAD_API_KEY`                         | prix IsThereAnyDeal (POC `enrich-games.ts`)      |
| `OPENAI_API_KEY`, `OPENAI_MODEL`       | traduction des descriptions, rédaction des actus |
| `BLOB_READ_WRITE_TOKEN`                | publication des actus                            |
| `SANITY_ID`, `SANITY_DATASET`          | migration ponctuelle depuis Sanity uniquement    |

Les variables du déploiement (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `UPDATE_CMD`, `HEALTHCHECK_URL`…) sont décrites dans [scripts/systemd/deploy.env.example](scripts/systemd/deploy.env.example).

### Scripts npm

| Commande           | Rôle                                                |
| ------------------ | --------------------------------------------------- |
| `pnpm dev`         | serveur de développement sur le port 2811           |
| `pnpm build`       | build statique dans `dist/`                         |
| `pnpm start`       | prévisualise le build sur le port 2881              |
| `pnpm type-check`  | `astro check`                                       |
| `pnpm lint`        | ESLint sur `src` et `scripts`                       |
| `pnpm format`      | Prettier sur `src`                                  |
| `pnpm commit`      | commit guidé (Commitizen)                           |
| `pnpm db:generate` | génère une migration depuis `src/db/schema.ts`      |
| `pnpm db:migrate`  | applique les migrations de `drizzle/`               |
| `pnpm db:studio`   | Drizzle Studio, pour corriger des données à la main |

## Données du catalogue

Le catalogue vit dans Postgres (schéma : [src/db/schema.ts](src/db/schema.ts)) : jeux, genres, surcharges manuelles, et une table par source externe (identifiants, IGDB, Steam, HowLongToBeat).

| Script                                                   | Rôle                                                                                                           |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [scripts/update-catalog.sh](scripts/update-catalog.sh)   | chaîne hebdomadaire lancée par `deploy.sh` (`UPDATE_CMD`) : import → enrichissement → traduction → publication |
| [scripts/import-games.ts](scripts/import-games.ts)       | importe les jeux qui passent le seuil de popularité, puis publie ceux qui sont prêts (`--publish`)             |
| [scripts/sync.ts](scripts/sync.ts)                       | remplit les tables des sources externes (`ids`, `igdb`, `steam`, `summary`), avec reprise après arrêt          |
| [scripts/translate-games.ts](scripts/translate-games.ts) | traduit les descriptions EN → FR avec OpenAI, dans un fichier relu avant `--write`                             |
| [scripts/publish-news.ts](scripts/publish-news.ts)       | rédige et publie une actu par heure sur Vercel Blob                                                            |
| [scripts/deploy.sh](scripts/deploy.sh)                   | build et déploiement (voir plus haut)                                                                          |
| `scripts/enrich-games.ts`, `scripts/hltb-poc.ts`         | POC : couverture des sources et seuil de popularité. Rien n'est écrit en base                                  |
| `scripts/migrate-from-sanity.ts`                         | migration ponctuelle Sanity → Postgres                                                                         |

Le périmètre fonctionnel des fiches jeux et l'étude du seuil de popularité sont dans [docs/enrichissement-fiches-jeux.md](docs/enrichissement-fiches-jeux.md).

## Structure du dépôt

- [`src/pages`](src/pages) : accueil, `/jeu/[slug]`, `/genre/[slug]`, `/actus`, plan du site, pages légales
- [`src/db`](src/db) : client et schéma Drizzle
- [`src/features`](src/features), [`src/components`](src/components), [`src/layouts`](src/layouts), [`src/styles`](src/styles) : interface
- [`scripts`](scripts) : données, déploiement, unités systemd
- [`drizzle`](drizzle) : migrations SQL
- [`infra/postgres`](infra/postgres) : `docker-compose.yml` de la base sur le VPS
- [`docs`](docs) : documentation fonctionnelle
- [`.github/workflows`](.github/workflows) : CI des PR

## Qualité

- ESLint + Prettier, lancés sur les fichiers modifiés par Husky et lint-staged
- Commits au format [Conventional Commits](https://www.conventionalcommits.org), vérifiés par commitlint
- CI sur chaque PR : type-check, lint, messages de commit ([.github/workflows/ci.yml](.github/workflows/ci.yml))
- Dépendances mises à jour par Renovate

## Historique

1. **Next.js + Prisma**, puis **Sanity** comme source des jeux (avec GraphQL/Apollo et une authentification, retirée depuis).
2. **v2** : Next 16 / React 19 en export statique, puis App Router et CSS Modules.
3. **Migration vers Astro**, site entièrement statique.
4. **Build sur VPS** et déploiement `--prebuilt` sur Vercel, à la place des builds Vercel au push.
5. **Postgres + Drizzle** à la place de Sanity, enrichissement des fiches (IGDB, Steam, HLTB) et import automatique des jeux connus.

## Licence

MIT, voir [LICENSE.md](LICENSE.md).
