# Actus : fonctionnement et exploitation

|            |                                                                                                                                     |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Statut** | En place                                                                                                                            |
| **Date**   | 21 octobre 2026                                                                                                                     |
| **Code**   | [scripts/publish-news.ts](../scripts/publish-news.ts), [scripts/news.sh](../scripts/news.sh), [src/pages/actus](../src/pages/actus) |

Ce document explique comment les actus de `/actus` sont rédigées, stockées et mises en ligne, comment les exploiter au quotidien, et pourquoi elles fonctionnent ainsi.

## 1. Vue d'ensemble

Toutes les heures, à la 17e minute, le VPS rédige les actus jeux vidéo qui manquent, les enregistre dans Postgres, puis rebuild et redéploie le site si quelque chose a changé.

```
 VPS, timer « game-over-news » (toutes les heures, à HH:17)
 ┌──────────────────────────────────────────────────────────────────────┐
 │ scripts/news.sh                                                      │
 │                                                                      │
 │  1. scripts/publish-news.ts                                          │
 │     flux RSS GameSpot ──► OpenAI (rédaction) ──► table news_article  │
 │                              ▲                                       │
 │                  catalogue (durées, avis) + IGDB/Steam (image)       │
 │                                                                      │
 │  2. scripts/deploy.sh --news   (seulement si les actus ont changé)   │
 │     vercel build ──► contrôle du nombre de pages ──► deploy --prebuilt│
 └──────────────────────────────────────┬───────────────────────────────┘
                                        ▼
                 Vercel : pages statiques /actus, /actus/2…, /actus/<slug>
```

Tout est statique : Vercel ne fait que servir les fichiers construits sur le VPS. La base n'est jamais exposée sur Internet.

## 2. Rédaction

### Choix des actus à rédiger

- Source : les 20 derniers articles du flux `https://www.gamespot.com/feeds/news`.
- Seules les actus **publiées depuis moins de 48 h** sont rédigées : au-delà, Google News ne les reprend plus.
- Chaque actu est identifiée par un hash de son URL (`source_key`, 8 caractères). Une actu déjà en base n'est jamais réécrite.
- Au plus **3 articles par passage**, du plus récent au plus ancien. Le flux publie jusqu'à 4 actus par heure l'après-midi (heure US) : le retard est rattrapé dans la soirée.

### Règles éditoriales

Le détail est dans les prompts `GAME_PROMPT` et `WRITER_PROMPT` de `publish-news.ts`. En résumé :

- un **article original** en français, pas une traduction : pyramide inversée, 3 ou 4 intertitres ;
- **350 à 1 000 mots**, sinon l'article est refusé et retenté au passage suivant ;
- **uniquement les faits de la source** et de la fiche du jeu, sans invention ni révélation d'intrigue ;
- **jamais de mention du média source**, ni de lien ;
- si le jeu est au catalogue, une dernière section « Combien de temps pour finir … ? » rédigée à partir de sa fiche, et un lien vers `/jeu/<slug>` ;
- les vidéos YouTube de la source peuvent être gardées, jamais inventées.

### Image

Choisie par [scripts/news/image.ts](../scripts/news/image.ts) : un visuel IGDB ou Steam du jeu, sinon un visuel générique de la catégorie de l'actu.

### Auteur

Chaque actu est signée par l'un des trois auteurs de [src/config/authors.ts](../src/config/authors.ts), choisi selon sa catégorie :

| Auteur         | Catégories                      |
| -------------- | ------------------------------- |
| Léa Moreau     | `sortie`, `annonce`             |
| Thomas Ferrand | `materiel`, `industrie`         |
| Inès Bakri     | `mise-a-jour`, `promo`, `autre` |

Ce sont des personas : leur bio est inventée et leur avatar est une illustration générée une seule fois (`public/auteurs/`). Chacun a sa page `/auteurs/<slug>` avec sa bio et ses articles. La signature en haut de l'article, l'encadré en bas et les données structurées (`Person`, `ProfilePage`) renvoient tous vers cette page.

Pour changer la répartition, il faut modifier `categories` dans `authors.ts`. Seuls les nouveaux articles sont concernés : les anciens gardent leur colonne `author`.

## 3. Données

Table `news_article` ([src/db/schema.ts](../src/db/schema.ts)) :

| Colonne                            | Rôle                                                                            |
| ---------------------------------- | ------------------------------------------------------------------------------- |
| `slug`                             | URL `/actus/<slug>` : titre puis `source_key`, unique                           |
| `source_key`, `source_url`         | actu d'origine (l'URL n'est jamais affichée)                                    |
| `title`, `excerpt`, `content_html` | article ; le HTML est produit par le script, sans HTML brut venant du modèle    |
| `category`                         | `sortie`, `mise-a-jour`, `annonce`, `materiel`, `industrie`, `promo` ou `autre` |
| `author`                           | auteur qui signe l'article, d'après sa catégorie (voir « Auteur »)              |
| `image`                            | `{ url, width, height, alt }`                                                   |
| `game_id`                          | jeu du catalogue ; le lien n'est affiché que si le jeu est publié               |
| `is_published`                     | `false` pour retirer un article du site                                         |
| `published_at`                     | date affichée et ordre de la liste                                              |

Les articles publiés avant ce fonctionnement (sur Vercel Blob, jusqu'au 21 octobre 2026) ont été repris par [scripts/import-news-from-blob.ts](../scripts/import-news-from-blob.ts). Leur `source_url` est vide.

## 4. Mise en ligne

`scripts/deploy.sh --news` reconstruit le site avec le code déjà présent sur le VPS (sans `git pull`, sans mise à jour du catalogue) et le déploie :

- **Seulement s'il y a du nouveau.** L'état des actus publiées (nombre et date de la plus récente) est comparé à celui du dernier déploiement, gardé dans `~/.local/state/game-over/news-deployed`. Un déploiement raté est donc rattrapé au passage suivant, même sans nouvel article.
- **Un seul déploiement à la fois.** Si le déploiement hebdomadaire tourne, celui des actus est reporté : le build hebdomadaire lit lui aussi la base.
- **Délai de mise en ligne** : environ 1 minute de build et l'envoi vers Vercel, soit quelques minutes après la rédaction.
- Les garde-fous de `deploy.sh` s'appliquent : contrôle du nombre de pages, `vercel rollback` possible.

Pages produites : `/actus` (20 articles par page, puis `/actus/2`…), une page par article, et `/actus/sitemap.xml` (sitemap Google News des articles des 48 dernières heures, recalculé à chaque déploiement). Les articles figurent aussi dans le sitemap général.

> ⚠️ Un déploiement d'actus met en ligne **le code présent sur le VPS**. Un déploiement fait depuis un poste avec un autre code est donc écrasé dans l'heure. Pour livrer du code : pousser sur `main`, puis lancer `systemctl --user start game-over-deploy.service` sur le VPS.

## 5. Exploitation

Sur le VPS, dans `~/howlongtobeat` :

| Besoin                                    | Commande                                                                             |
| ----------------------------------------- | ------------------------------------------------------------------------------------ |
| Lancer un passage maintenant              | `systemctl --user start game-over-news.service`                                      |
| Logs                                      | `journalctl --user -u game-over-news.service -e`                                     |
| Prochain passage                          | `systemctl --user list-timers game-over-news.timer`                                  |
| Tester la rédaction sans rien enregistrer | `pnpm tsx scripts/publish-news.ts --dry-run`                                         |
| Rédiger toutes les actus en attente       | `pnpm tsx scripts/publish-news.ts --all`                                             |
| Redéployer même sans changement           | `set -a; . ~/.config/game-over/deploy.env; set +a; FORCE=1 scripts/deploy.sh --news` |

**Retirer un article** : passer `is_published` à `false` (Drizzle Studio, `pnpm db:studio`), puis lancer un passage. Le changement est détecté et le site redéployé ; l'URL de l'article renvoie ensuite une 404.

**Corriger un article** : modifier `title`, `excerpt` ou `content_html` en base, puis redéployer avec `FORCE=1` (une correction de texte ne change pas l'état comparé).

**Réécrire un article** : supprimer sa ligne en base. Il sera rédigé à nouveau au passage suivant si sa source a moins de 48 h, avec un nouveau slug si le titre change.

## 6. Coûts et limites

| Poste                   | Consommation                                                                  | Limite                |
| ----------------------- | ----------------------------------------------------------------------------- | --------------------- |
| OpenAI                  | 2 appels par article (identification du jeu, rédaction), environ 3 000 jetons | facturé à part        |
| Déploiements Vercel     | 10 à 15 par jour                                                              | 100 par jour en Hobby |
| Minutes de build Vercel | aucune, le build tourne sur le VPS                                            | —                     |
| Vercel Blob             | plus utilisé                                                                  | —                     |

Le site reste dans le plan Hobby gratuit.

## 7. Dépannage

| Symptôme                                     | Cause probable                       | Que faire                                             |
| -------------------------------------------- | ------------------------------------ | ----------------------------------------------------- |
| Un article est en base mais pas en ligne     | déploiement reporté ou échoué        | lire les logs ; le passage suivant redéploie          |
| « Article rejected (N words) » dans les logs | article trop court ou trop long      | rien : il est retenté au passage suivant              |
| « news deployment postponed »                | le déploiement hebdomadaire tourne   | rien : il inclut les actus                            |
| « Page count dropped »                       | build incomplet (base injoignable…)  | vérifier la base, puis relancer                       |
| Une actu du flux n'a jamais été rédigée      | plus de 48 h de retard (VPS arrêté…) | `publish-news.ts --all` ne la reprendra pas : ignorer |

## 8. Décisions

**Pourquoi la base et des pages statiques ?** Jusqu'au 21 octobre 2026, les articles étaient des fichiers JSON sur Vercel Blob, lus à la demande par une fonction Vercel. Ce montage posait trois problèmes :

- **Des articles disparaissaient du sitemap.** Le script relisait la liste via le CDN de Blob, qui servait parfois une version vieille de plusieurs heures. Chaque réécriture effaçait alors les articles ajoutés entre-temps.
- **Le quota gratuit de Blob était presque atteint** (2 000 opérations d'écriture et de listage par mois en Hobby), et un dépassement bloque Blob pendant 30 jours.
- **Pas d'historique** : `/actus` n'affichait que les 5 derniers articles.

**Pourquoi ne pas faire lire la base directement par Vercel ?** Il faudrait l'exposer sur Internet, et le site dépendrait de la disponibilité du VPS. Le build sur le VPS lit la base en local, comme pour le catalogue.

**Pourquoi ne pas rédiger tout le flux ?** Les actus de plus de 48 h n'intéressent plus Google News ni Discover. Limiter à 3 articles par passage borne aussi le coût OpenAI d'un passage.
