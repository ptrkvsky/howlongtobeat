# Enrichissement des fiches jeux : périmètre fonctionnel

| | |
| --- | --- |
| **Statut** | Proposition, à valider |
| **Date** | 17 octobre 2026 |
| **Auteur** | Johan Petrikovsky (product owner) |
| **Étape suivante** | Modélisation de la base de données, à partir de la section 6 |

Ce document fixe la liste des fonctionnalités à ajouter aux pages jeux (`/jeu/[slug]`). Il sert de référence pour modéliser la base de données et découper le travail en lots. Il ne tranche pas le choix de la base (Sanity ou Postgres) : ce point fera l'objet d'une décision séparée.

## 1. Contexte

Aujourd'hui, une fiche jeu affiche :

- le nom, la jaquette et une bannière ;
- une description en français, traduite par IA ;
- les trois durées issues de HowLongToBeat : histoire principale, histoire + extras, complétionniste ;
- une note (`rating`) ;
- des jeux similaires, calculés à partir des genres.

Le catalogue compte environ 8 500 jeux. L'objectif est d'atteindre **au moins 30 000 jeux**, avec un coût d'exploitation proche de zéro. Le site est entièrement statique : il est généré sur un VPS une fois par semaine, puis déployé sur Vercel avec `vercel deploy --prebuilt` (voir la section 7).

Un POC d'enrichissement a été mené sur les 50 jeux les plus populaires ([scripts/enrich-games.ts](../scripts/enrich-games.ts)). Il croise quatre sources : Wikidata, IGDB, Steam et IsThereAnyDeal (ITAD). Les chiffres de couverture cités dans ce document en sont tirés.

## 2. Objectifs

1. **Répondre à la question suivante du joueur.** Après « combien de temps ? », il se demande : « est-ce que ça vaut le coup ? », « est-ce que les gens le finissent ? », « sur quoi y jouer ? ».
2. **Se différencier de HowLongToBeat.** Le site doit apporter des informations qu'on ne trouve pas sur HowLongToBeat, comme le taux de complétion réel ou le rapport prix/durée.
3. **Améliorer le référencement.** Des pages plus riches et uniques, avec des données structurées, sur 30 000 jeux.
4. **Garder le coût à zéro.** Les données sont récupérées hors ligne, puis figées dans les pages au build. Aucun appel d'API depuis le navigateur.

## 3. Principes communs à toutes les fonctionnalités

Ces règles s'appliquent à chaque fonctionnalité de la section 4.

- **Masquer plutôt que deviner.** Si une donnée manque, le bloc correspondant n'est pas affiché. Il n'y a ni « N/A » ni valeur par défaut. Environ la moitié du catalogue peu populaire n'est pas sur Steam (jeux console, rétro) : les fiches doivent rester correctes sans ces données.
- **Ne publier que des rapprochements sûrs.** Un jeu n'est enrichi que si ses identifiants externes sont confirmés : accord Wikidata + IGDB, aucun conflit. Les cas ambigus sont mis de côté pour relecture.
- **Citer les sources.** Chaque donnée externe affiche sa source. Le lien vers IsThereAnyDeal est **obligatoire** d'après leurs conditions d'utilisation, et leurs liens d'achat doivent rester tels quels.
- **Dater les données qui changent.** Les avis et les prix affichent leur date de mise à jour.
- **Tout en français.** Les libellés, les dates et les formats de nombres suivent les conventions françaises (`99 %`, `9,69 €`, `19 avril 2011`).
- **Garder des pages légères.** Une fiche pèse aujourd'hui environ 16 Ko compressée. L'enrichissement ne doit pas la multiplier par plus de deux.
- **Pouvoir corriger à la main.** Toute donnée importée peut être corrigée manuellement, et la correction n'est pas écrasée au prochain import.

## 4. Fonctionnalités

Priorités : **P1** pour le lot 1, **P2** pour le lot 2, **P3** à explorer. Les sources marquées « non mesurée » n'ont pas encore été testées à l'échelle du POC.

### F1. Fiche d'identité du jeu (P1)

**Besoin** : savoir de quel jeu on parle et sur quoi y jouer.

- Date de sortie
- Développeur(s) et éditeur(s)
- Plateformes (PC, PlayStation, Xbox, Switch…)
- Mention « contenu pour adultes » si le jeu est classé mature

**Sources** : IGDB, avec ITAD en secours. Couverture non mesurée : le POC ne récupère aujourd'hui que le nom et l'année depuis IGDB.

**Critères d'acceptation**
- Les quatre informations s'affichent dans un bloc dédié, près du titre.
- Un jeu sans plateforme connue n'affiche pas la ligne « Plateformes ».
- Les plateformes affichées sont une liste fermée et normalisée (pas de « PC (Microsoft Windows) » brut).

### F2. Avis des joueurs (P1)

**Besoin** : savoir si le jeu est apprécié.

- Pourcentage d'avis positifs sur Steam, avec le libellé traduit (« Extrêmement positives ») et le nombre d'avis
- Metascore et note des utilisateurs Metacritic, si disponibles

**Sources** : API publique des avis Steam, notes agrégées d'ITAD. Couverture POC : 45/45 jeux reliés à Steam.

**Critères d'acceptation**
- Le nombre d'avis est arrondi (« 468 000 avis »).
- Chaque note indique sa source et la date de mise à jour.
- Ces notes **ne sont pas** déclarées comme `aggregateRating` dans les données structurées : Google interdit d'y reprendre des avis collectés sur d'autres sites.
- Il faut décider ce que devient la note actuelle (`rating`) : la remplacer, ou l'afficher à côté (voir la section 9).

### F3. Taux de complétion réel (P1)

**Besoin** : savoir si les joueurs vont au bout. C'est la fonctionnalité la plus différenciante : « seulement 52 % des joueurs ont terminé Portal ».

- Pourcentage de joueurs Steam ayant débloqué le succès de fin de jeu
- Nom du succès utilisé, pour la transparence

**Sources** : statistiques globales des succès Steam. Couverture POC : 18/45. Le taux est fiable quand il est trouvé, mais la détection automatique ne fonctionne que si le nom du succès contient un mot-clé (« Complete », « Finish », dernier chapitre…).

**Critères d'acceptation**
- Un taux n'est publié qu'après validation, automatique pour les règles sûres, sinon manuelle.
- Un jeu à plusieurs fins additionne les succès correspondants.
- Il faut décider comment traiter l'autre moitié des jeux : saisie manuelle pour les plus populaires, ou proposition par IA puis relecture (voir la section 9).

### F4. Succès et badges (P2)

**Besoin** : informer les chasseurs de succès, en lien avec la durée « complétionniste ».

- Nombre de succès
- Succès le plus rare, avec son pourcentage
- Badges : « Succès Steam », « Cartes à échanger », « Early Access »

**Sources** : Steam pour les succès, ITAD pour les badges. Couverture POC sur les succès : tous les jeux Steam qui en ont.

**Critères d'acceptation**
- Le badge « Early Access » est visible en haut de fiche, car il signale que la durée peut encore évoluer.
- Le nom du succès le plus rare est affiché dans sa langue d'origine s'il n'existe pas en français.

### F5. Tags (P2)

**Besoin** : décrire le jeu plus finement que les genres actuels (« Puzzle », « Humour noir », « Vue à la première personne »).

- Les 5 à 8 premiers tags Steam, traduits en français

**Sources** : tags Steam fournis par ITAD. Couverture non mesurée.

**Critères d'acceptation**
- Les tags sont traduits à partir d'une table de correspondance maintenue à la main, pas traduits à la volée.
- Les pages « tag » (`/tag/[slug]`) sont hors du lot 2 : elles posent la même question de poids que les pages genre, qui devront déjà être paginées pour 30 000 jeux.

### F6. Liens externes (P1)

**Besoin** : permettre d'aller plus loin, et respecter les obligations d'attribution.

- Page Steam du jeu
- Page IsThereAnyDeal du jeu (obligatoire dès qu'une donnée ITAD est affichée)
- Page IGDB

**Sources** : identifiants confirmés à l'étape de rapprochement. Couverture POC : 45/50 pour Steam.

**Critères d'acceptation**
- Les liens s'ouvrent dans un nouvel onglet, avec `rel="noopener"`.
- Aucun lien n'est affiché si l'identifiant n'est pas confirmé.

### F7. Prix et rapport prix/durée (P3, à arbitrer)

**Besoin** : répondre à « est-ce que ça vaut le coup ? ».

- Meilleur prix du moment et boutique
- Plus bas prix historique
- Coût par heure de jeu, calculé sur la durée « histoire principale »

**Sources** : ITAD. Couverture POC : 37/45. Les 8 jeux manquants ne sont plus vendus à l'unité.

**Points d'attention**
- Ce sont des données **dynamiques**, alors que le site est statique et que le choix initial était de se limiter aux données stables. Un prix affiché peut être faux quelques jours après le build.
- Le coût par heure pénalise les jeux très courts (The Stanley Parable à 12 €/h) et n'a pas de sens pour un jeu gratuit.
- Une option intermédiaire : n'afficher que le **plus bas prix historique** et son coût par heure. Il change rarement, et il reste vrai même si le build date.

### F8. Médias (P3)

**Besoin** : rendre la fiche plus vivante.

- Captures d'écran
- Bande-annonce (vidéo YouTube intégrée au clic)
- Jaquette de secours quand le jeu n'en a pas

**Sources** : IGDB, ITAD pour les jaquettes. Couverture non mesurée.

**Points d'attention** : seules les URL des CDN sont stockées, jamais les images. La vidéo n'est chargée qu'au clic, pour ne pas alourdir la page.

### F9. Données structurées (P1)

**Besoin** : améliorer l'affichage dans les résultats Google.

- Balisage schema.org `VideoGame` : nom, image, date de sortie, genres, plateformes, développeur et éditeur

**Critères d'acceptation**
- Le balisage est validé par l'outil de test des résultats enrichis de Google.
- Il est construit uniquement à partir des données réellement affichées sur la page.

## 5. Hors périmètre

- Données en temps réel : nombre de joueurs actuels, promotions en cours, waitlist ITAD.
- Historique et courbes de prix.
- Comptes utilisateurs, notes et avis propres au site.
- Abonnements (Game Pass, PS Plus) et bundles : données trop changeantes pour un site statique.
- Fiches pour les DLC.

## 6. Données nécessaires par fonctionnalité

Ce tableau est l'entrée de la modélisation. Il liste les données, sans présumer de leur structure.

| Donnée | Fonctionnalités | Source | Rythme de mise à jour |
| --- | --- | --- | --- |
| Identifiants Steam, IGDB, ITAD, Wikidata + statut du rapprochement | Toutes | Wikidata, IGDB | Une fois, puis correction manuelle |
| Date de sortie | F1, F9 | IGDB | Stable |
| Développeurs, éditeurs | F1, F9 | IGDB | Stable |
| Plateformes | F1, F9 | IGDB | Stable |
| Contenu mature | F1 | ITAD | Stable |
| Avis Steam : pourcentage, libellé, nombre | F2 | Steam | Hebdomadaire |
| Metascore, note des utilisateurs Metacritic | F2 | ITAD | Hebdomadaire |
| Succès de fin retenu, taux, règle de détection, statut de validation | F3 | Steam | Hebdomadaire (le choix du succès, une fois) |
| Nombre de succès, succès le plus rare | F4 | Steam | Hebdomadaire |
| Badges : succès, cartes, Early Access | F4 | ITAD | Lent |
| Tags et leur traduction | F5 | ITAD + table manuelle | Lent |
| Prix actuel, plus bas historique, boutique, lien d'achat | F7 | ITAD | Dynamique |
| Captures, vidéos, jaquette de secours | F8 | IGDB, ITAD | Stable |
| Date de dernière mise à jour, par source | F2, F7 | Interne | À chaque import |
| Valeurs corrigées à la main | Toutes | Interne | Manuel |

Pour 30 000 jeux, l'import complet prend au moins 2 h 30, à cause de la limite d'ITAD (1 000 requêtes par tranche de 5 minutes). Il doit pouvoir reprendre là où il s'est arrêté.

## 7. Mise à jour hebdomadaire

Le site est mis à jour **une fois par semaine**, le lundi vers 4 h. Tout le travail se fait sur le VPS. Vercel ne fait que servir les pages et ne consomme aucune minute de build.

**Déroulé d'un run** ([scripts/deploy.sh](../scripts/deploy.sh))

1. Récupération du code (`git pull`).
2. Mise à jour des données : nouveaux jeux, enrichissement, traduction des nouveaux jeux uniquement.
3. Build du site (`vercel build --prod`).
4. Contrôle : pas de déploiement si le build échoue, ou s'il contient moins de 95 % des pages de la semaine précédente.
5. Déploiement en production (`vercel deploy --prebuilt --prod`).

**Pourquoi le VPS**
- Pas de limite de durée : l'import ITAD de 30 000 jeux prend au moins 2 h 30.
- Le cache des réponses d'API reste sur le disque d'une semaine à l'autre : seuls les éléments qui changent sont redemandés.
- Coût nul, puisque le VPS existe déjà.

**Exigences d'exploitation**
- Une alerte est envoyée si un run échoue, ou si aucun run n'a eu lieu dans la semaine (healthchecks.io).
- La version précédente peut être remise en ligne en quelques secondes (`vercel rollback`).
- Un push sur GitHub ne déclenche plus de build chez Vercel : seul le VPS déploie.
- Solution de secours si le VPS tombe : une GitHub Action planifiée, sur le même script.

**Conséquences sur le produit**
- Les avis, les succès et les notes ont au plus une semaine de retard. C'est acceptable.
- Un prix peut avoir jusqu'à une semaine de retard, ce qui renforce la recommandation de la décision D3.

L'installation et l'exploitation sont décrites dans [scripts/systemd/README.md](../scripts/systemd/README.md).

## 8. Découpage en lots

| Lot | Contenu | Pourquoi d'abord |
| --- | --- | --- |
| **Lot 0 : qualité** | Corriger les durées à 0 (série Assassin's Creed), choisir le bon appid quand il y en a plusieurs, dédoublonner les slugs | Les données de base doivent être justes avant d'en ajouter |
| **Lot 1** | F1, F2, F3 (règles automatiques sûres), F6, F9 | Sources fiables, bonne couverture, plus forte valeur |
| **Lot 2** | F3 (relecture des cas restants), F4, F5 | Demande de la relecture ou une table de traduction |
| **Lot 3** | F7, F8 | Dépend d'arbitrages sur la fraîcheur et le poids des pages |

## 9. Décisions à prendre

| # | Question | Options | Recommandation |
| --- | --- | --- | --- |
| D1 | Que devient la note actuelle (`rating`) ? | La remplacer par l'avis Steam / garder les deux / la retirer | Identifier d'abord son origine, puis décider |
| D2 | Taux de complétion des jeux sans succès de fin détecté | Saisie manuelle / proposition par IA + relecture / ne rien afficher | IA + relecture, pour les 2 000 jeux les plus populaires |
| D3 | Prix | Hors périmètre / plus bas historique seul / prix complet daté | Plus bas historique seul |
| D4 | Afficher Metacritic ? | Oui, via ITAD / non | Oui, avec la source citée |
| D5 | Base de données | Sanity / Postgres sur Neon / Postgres ou SQLite sur le VPS | **Décidé le 19 octobre 2026 : Postgres sur le VPS**, avec Drizzle ORM. La base, dans le conteneur `gameover-postgres`, n'est lue qu'au build et n'est pas exposée sur Internet. Le schéma est dans [src/db/schema.ts](../src/db/schema.ts), et les corrections manuelles vont dans la table `game_override` |

## 10. Indicateurs de succès

- Part des fiches avec au moins un bloc enrichi (cible à fixer après le lot 1)
- Part des fiches avec un taux de complétion
- Évolution des impressions et des clics dans la Search Console sur les pages jeux
- Poids moyen d'une fiche, et durée du build complet pour 30 000 jeux

## 11. Seuil de popularité et faisabilité HLTB (POC du 19 octobre 2026)

Le but est de garder des jeux **connus du grand public, avec des durées fiables**. Le volume n'est pas un objectif : c'est une conséquence du seuil. Le script est [scripts/hltb-poc.ts](../scripts/hltb-poc.ts). Ses résultats sont dans `.hltb-poc/`, qui n'est pas versionné.

### Méthode

- **Liste des candidats** : les 48 569 éléments Wikidata qui ont un ID HowLongToBeat (P2816), plus le catalogue actuel. Aucun appel à la recherche ni à l'API de HLTB.
- **Échantillon** : 452 pages HLTB lues. Il comprend :
  - 32 jeux grand public de contrôle ;
  - 20 jeux obscurs de contrôle ;
  - 100 jeux du catalogue actuel, répartis selon leur popularité ;
  - 300 jeux hors catalogue, répartis selon leur nombre de pages Wikipédia.
- **Signaux** :
  - côté HLTB : nombre de joueurs qui ont ajouté le jeu (`count_total`), nombre de temps « histoire » saisis (`comp_main_count`), type de jeu ;
  - nombre de pages Wikipédia (sitelinks Wikidata) ;
  - nombre d'avis Steam.

### Faisabilité

- Une page jeu se lit en simple requête HTTP : les données sont dans le JSON `__NEXT_DATA__`. Il n'y a pas besoin de navigateur.
- Résultat : 443 pages lues sur 452, 9 jeux supprimés (404), **aucun blocage** (ni 403, ni 429, ni défi anti-bot). Le rythme était d'une page toutes les 2 s.
- Un passage complet prend environ 4 h 45 pour le catalogue actuel et environ 28 h pour les 50 000 candidats. C'est compatible avec le VPS, à condition d'étaler le travail ou de ne relire chaque semaine que les jeux à rafraîchir.
- Wikidata couvre 78 % du catalogue actuel et les 32 jeux grand public de contrôle.

### Fiabilité des durées

Avec moins de 10 temps « histoire » saisis, la durée est fragile :

| Temps « histoire » saisis | Écart entre moyenne et médiane (90ᵉ centile) | Jeux sans temps « extras » ou « 100 % » |
| --- | --- | --- |
| 1 à 2 | non mesurable | 71 % |
| 3 à 5 | 44 % | 50 % |
| 6 à 10 | 20 % | 30 % |
| 11 à 20 | 25 % | 3 % |
| 21 à 50 | 10 % | 0 % |
| Plus de 50 | 7 % | 0 % |

### Seuil recommandé

Un jeu a sa fiche si les trois conditions suivantes sont remplies :

1. son type HLTB est `game`, `multi`, `endless` ou `sports`. Les DLC, mods, compilations et non-jeux sont exclus. Les types `endless` et `multi` sont nécessaires pour garder Minecraft, Among Us ou It Takes Two ;
2. il a **au moins 10 temps « histoire » saisis** ;
3. il remplit au moins un critère de notoriété :
   - **au moins 1 000 joueurs HLTB**,
   - **ou au moins 10 000 avis Steam**,
   - **ou au moins 8 pages Wikipédia et au moins 300 joueurs HLTB**. Ce palier rattrape les classiques console et rétro absents de Steam (Skies of Arcadia, Klonoa 2…).

Les liens Wikipédia seuls ne suffisent pas : ils font entrer des jeux rétro inconnus, comme Astroblast ou Talmit's Adventure.

**Résultats**

- 32 jeux grand public sur 32 sont gardés, et 0 jeu obscur sur 20 passe.
- Environ **5 800 jeux** au total, estimés sur les 48 500 candidats.
- Les jeux ajoutés sont surtout des sorties récentes, absentes du catalogue construit en 2021 : Alan Wake 2, Helldivers 2, Final Fantasy XVI, Donkey Kong Bananza…

**Conséquence sur le catalogue actuel** : seulement 56 % du catalogue actuel passe ce seuil. Les jeux exclus sont :
- des DLC et des épisodes, ce qui relève du lot 0 ;
- des jeux avec trop peu de temps saisis ;
- des jeux de niche (Shan Gui, Bientôt l'été…).

L'ancien filtre (« plus de 30 Beat ») aurait donné environ 12 000 jeux, mais avec des durées souvent incomplètes.

### Limites et suite

- Les jeux obscurs de contrôle sont rejetés par toutes les règles testées. La vraie frontière se trouve dans les jeux de niche hors catalogue. Il reste à **relire à la main** la colonne `connu` de `.hltb-poc/sample.csv`, puis à relancer `--analyze` pour mesurer la précision réelle.
- 22 % du catalogue n'est pas dans Wikidata : des jeux connus peuvent échapper à cette liste de candidats. Pour être exhaustif, il faudrait aussi parcourir les IDs HLTB.
- La valeur `totalPoll` stockée dans Sanity est périmée (scraping de 2021) et parfois fausse : par exemple, « 146K » a été lu 146 000 au lieu de 26 510 pour BioShock. Elle ne doit plus servir au tri.
- Décision à prendre : retirer les jeux du catalogue actuel qui sont sous le seuil, ou les garder en `noindex`.
