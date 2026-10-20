# Mise à jour hebdomadaire sur le VPS

Chaque lundi vers 4 h, le VPS récupère le code, met les données à jour, builde le site, vérifie le résultat, puis le déploie sur Vercel avec `vercel deploy --prebuilt`. Aucune minute de build Vercel n'est consommée.

## Installation

Prérequis sur le VPS : Node 24, pnpm, le CLI Vercel (`npm i -g vercel`), git, curl et Docker.

1. Cloner le dépôt dans `~/howlongtobeat`, puis y copier le `.env.local` (`DATABASE_URL`, IGDB, Steam, ITAD…).
   La base Postgres tourne dans le conteneur `gameover-postgres`, qui n'écoute que sur `127.0.0.1:5433` :

   ```bash
   umask 077; echo "POSTGRES_PASSWORD=$(openssl rand -hex 24)" > ~/.config/game-over/postgres.env
   docker compose -f infra/postgres/docker-compose.yml --env-file ~/.config/game-over/postgres.env up -d
   # .env.local : DATABASE_URL=postgres://gameover:<mot de passe>@127.0.0.1:5433/gameover
   pnpm db:migrate
   ```

2. Créer le fichier d'environnement du déploiement :

   ```bash
   mkdir -p ~/.config/game-over
   cp scripts/systemd/deploy.env.example ~/.config/game-over/deploy.env
   chmod 600 ~/.config/game-over/deploy.env
   # puis renseigner VERCEL_TOKEN, VERCEL_ORG_ID et VERCEL_PROJECT_ID
   ```

3. Tester un déploiement à la main :

   ```bash
   set -a; . ~/.config/game-over/deploy.env; set +a
   scripts/deploy.sh
   ```

4. Installer et activer le timer :

   ```bash
   mkdir -p ~/.config/systemd/user
   cp scripts/systemd/game-over-deploy.{service,timer} ~/.config/systemd/user/
   systemctl --user daemon-reload
   systemctl --user enable --now game-over-deploy.timer
   # Lancer les unités utilisateur même sans session ouverte
   sudo loginctl enable-linger "$USER"
   ```

## Exploitation

| Besoin                                                    | Commande                                                                                                          |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Prochain run prévu                                        | `systemctl --user list-timers game-over-deploy.timer`                                                             |
| Lancer un run maintenant                                  | `systemctl --user start game-over-deploy.service`                                                                 |
| Logs du dernier run                                       | `journalctl --user -u game-over-deploy.service -e`                                                                |
| Forcer le déploiement malgré la baisse du nombre de pages | `FORCE=1 scripts/deploy.sh` (après avoir chargé `deploy.env`)                                                     |
| Revenir à la version précédente                           | `vercel rollback --token "$VERCEL_TOKEN"`                                                                         |
| Restaurer la base                                         | `docker exec -i gameover-postgres pg_restore -U gameover -d gameover --clean < ~/backups/gameover/<fichier>.dump` |
| Corriger des données à la main, depuis ton poste          | `ssh -N -L 5433:127.0.0.1:5433 ubuntu@51.38.191.183`, puis `pnpm db:studio`                                       |

## Actus

Toutes les heures (à la 17e minute), `scripts/publish-news.ts` rédige un article à partir de la dernière actu jeux vidéo pas encore traitée et le publie sur Vercel Blob. Les pages `/actus` le lisent à la demande : aucun déploiement n'est nécessaire.

Le `.env.local` du VPS doit contenir `OPENAI_API_KEY` et `BLOB_READ_WRITE_TOKEN`, en plus de `DATABASE_URL` et des identifiants IGDB.

```bash
cp scripts/systemd/game-over-news.{service,timer} ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now game-over-news.timer
```

| Besoin                           | Commande                                         |
| -------------------------------- | ------------------------------------------------ |
| Publier un article maintenant    | `systemctl --user start game-over-news.service`  |
| Logs                             | `journalctl --user -u game-over-news.service -e` |
| Tester sans publier              | `pnpm tsx scripts/publish-news.ts --dry-run`     |
| Supprimer les fichiers orphelins | `pnpm tsx scripts/publish-news.ts --purge`       |

## Garde-fous

- **Nombre de pages.** Le script refuse de déployer si le build contient moins de 95 % des pages du déploiement précédent : une API en panne ne vide pas le site.
- **Un seul run à la fois**, grâce à un verrou `flock`.
- **Sauvegarde de la base** avant chaque run (`pg_dump`). Les 8 dernières sont gardées dans `~/backups/gameover/`.
- **Alerte.** Avec `HEALTHCHECK_URL`, healthchecks.io prévient quand un run échoue, ou quand aucun run n'a eu lieu dans la semaine.
- **Pas de build Vercel au push.** `vercel.json` désactive les déploiements Git (`git.deploymentEnabled: false`) : seul ce script déploie.
