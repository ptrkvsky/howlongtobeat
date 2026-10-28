/**
 * Evaluation of "D'autres jeux à terminer": the former rule and the variants
 * of the new one, on the reference games of evaluation/recommendations.
 *
 *   pnpm tsx scripts/evaluate-recommendations.ts [--tune]
 *
 * 1. Pools the top 10 of every variant (and the IGDB similar games) for each
 *    reference game into judgments.json, keeping the grades already given.
 *    Grades: 0 unrelated, 1 a few points in common, 2 credible alternative,
 *    3 very close gameplay. A null grade is still to judge.
 * 2. Writes report.md: P@5 and P@10 (grade >= 2), nDCG@10, the share of
 *    unrelated games in the top 5, and the lists side by side. Unjudged games
 *    are counted and shown, never taken as unrelated.
 * --tune: grid search of the weights, scored leave one reference out (the
 *    weights picked on the other games, measured on the held out one).
 *
 * Env (.env.local): DATABASE_URL
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import {
  COMPONENTS,
  WEIGHTS,
  type Weights,
} from '../src/config/recommendations';
import { closeDb } from '../src/db/client';
import { getGames } from '../src/features/jeu/api/getGames';
import { rank } from '../src/features/jeu/recommendations/score';
import { legacyRelatedGames } from './lib/legacyRelated';
import { createRecommender } from './lib/recommender';

for (const file of [`.env.local`, `.env`]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const { values: args } = parseArgs({
  options: { tune: { type: `boolean`, default: false } },
});

const DIR = `evaluation/recommendations`;
const JUDGMENTS = `${DIR}/judgments.json`;
const DEPTH = 10;
const RELEVANT = 2;

interface Judgment {
  grade: 0 | 1 | 2 | 3 | null;
  note?: string;
  // Who gave the grade: "claude-draft" until reviewed by a person
  by?: string;
}
type Judgments = Record<string, Record<string, Judgment>>;

const zero = Object.fromEntries(COMPONENTS.map((key) => [key, 0])) as Weights;
const VARIANTS: {
  key: string;
  label: string;
  weights?: Weights;
  mmr?: number;
  minScore?: number;
}[] = [
  { key: `legacy`, label: `Ancienne règle (prod)` },
  {
    key: `descriptors`,
    label: `Descripteurs seuls`,
    weights: { ...WEIGHTS, vector: 0 },
  },
  {
    key: `vector`,
    label: `Embeddings seuls`,
    weights: { ...zero, vector: 1 },
    minScore: 0,
  },
  { key: `hybrid`, label: `Hybride`, weights: WEIGHTS },
  { key: `hybrid-mmr`, label: `Hybride + MMR`, weights: WEIGHTS, mmr: 0.85 },
];

const mean = (values: number[]) =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : NaN;

function metrics(list: string[], judged: Record<string, Judgment>) {
  const grades = list
    .slice(0, DEPTH)
    .map((slug) => judged[slug]?.grade ?? null);
  const known = (n: number) =>
    grades.slice(0, n).filter((g) => g !== null) as number[];
  const precision = (n: number) =>
    // Fewer than n games: the missing ones count as not relevant
    grades.slice(0, n).filter((g) => g !== null && g >= RELEVANT).length / n;
  const ideal = Object.values(judged)
    .map((j) => j.grade ?? 0)
    .sort((a, b) => b - a)
    .slice(0, DEPTH);
  const dcg = (values: number[]) =>
    values.reduce<number>(
      (sum, g, i) => sum + (2 ** g - 1) / Math.log2(i + 2),
      0,
    );
  const idcg = dcg(ideal);
  return {
    p5: precision(5),
    p10: precision(10),
    ndcg: idcg ? dcg(grades.map((g) => g ?? 0)) / idcg : NaN,
    zero5: known(5).filter((g) => g === 0).length,
    unjudged: grades.filter((g) => g === null).length,
    relevantKnown: Object.values(judged).filter(
      (j) => (j.grade ?? 0) >= RELEVANT,
    ).length,
  };
}

async function main() {
  const references: string[] = JSON.parse(
    readFileSync(`${DIR}/references.json`, `utf8`),
  );
  const judgments: Judgments = existsSync(JUDGMENTS)
    ? JSON.parse(readFileSync(JUDGMENTS, `utf8`))
    : {};
  const recommender = await createRecommender();
  const games = await getGames();
  const bySlug = new Map(games.map((row) => [row.slug, row]));
  const slugById = new Map(games.map((row) => [row.id, row.slug]));
  const nameBySlug = new Map(games.map((row) => [row.slug, row.name]));
  const byIgdb = new Map(
    recommender.games.flatMap((row) =>
      row.igdbId ? [[row.igdbId, row.id]] : [],
    ),
  );

  const lists: Record<string, Record<string, string[]>> = {};
  const cached = new Map<
    string,
    Awaited<ReturnType<typeof recommender.candidates>>
  >();
  for (const slug of references) {
    const reference = bySlug.get(slug);
    const features = reference && recommender.catalog.games.get(reference.id);
    if (!reference || !features) {
      console.warn(`⚠ ${slug}: not published`);
      continue;
    }
    const candidates = await recommender.candidates(features);
    cached.set(slug, candidates);
    lists[slug] = {
      legacy: (await legacyRelatedGames(reference)).map((row) => row.slug),
    };
    for (const variant of VARIANTS.slice(1)) {
      lists[slug][variant.key] = rank(
        recommender.catalog,
        features,
        candidates,
        {
          weights: variant.weights!,
          mmrLambda: variant.mmr,
          minScore: variant.minScore,
        },
      ).map(({ id }) => slugById.get(id)!);
    }
    // Pool: the top of every variant and the IGDB similar games
    const pool = new Set(
      Object.values(lists[slug]).flatMap((list) => list.slice(0, DEPTH)),
    );
    for (const igdbId of features.similarIgdbIds) {
      const id = byIgdb.get(igdbId);
      if (id && slugById.has(id)) pool.add(slugById.get(id)!);
    }
    judgments[slug] ??= {};
    for (const candidate of pool) {
      judgments[slug][candidate] ??= { grade: null };
    }
  }
  // Names next to the slugs, to judge without looking them up
  const named = Object.fromEntries(
    Object.entries(judgments).map(([slug, judged]) => [
      slug,
      Object.fromEntries(
        Object.entries(judged)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([candidate, judgment]) => [
            candidate,
            { ...judgment, name: nameBySlug.get(candidate) },
          ]),
      ),
    ]),
  );
  writeFileSync(JUDGMENTS, JSON.stringify(named, null, 2) + `\n`);

  // ── Report ───────────────────────────────────────────────────────────────
  const out: string[] = [
    `# Évaluation des recommandations`,
    ``,
    `Généré par \`scripts/evaluate-recommendations.ts\`. Pertinent = note >= ${RELEVANT}. Les jeux non notés ne comptent ni comme pertinents ni comme hors sujet : leur nombre est indiqué.`,
    ``,
  ];
  const drafts = Object.values(judgments)
    .flatMap((judged) => Object.values(judged))
    .filter((j) => j.by === `claude-draft`).length;
  if (drafts) {
    out.push(
      `> **Provisoire** : ${drafts} notes sont des propositions (\`claude-draft\`) non relues.`,
      ``,
    );
  }
  const totals: Record<string, ReturnType<typeof metrics>[]> = {};
  const perGame: string[] = [];
  for (const slug of Object.keys(lists)) {
    const judged = judgments[slug];
    perGame.push(`## ${nameBySlug.get(slug)}`, ``);
    const header = VARIANTS.map((v) => v.label);
    perGame.push(
      `| # | ${header.join(` | `)} |`,
      `|---|${header.map(() => `---`).join(`|`)}|`,
    );
    for (let i = 0; i < DEPTH; i++) {
      const cells = VARIANTS.map((v) => {
        const candidate = lists[slug][v.key][i];
        if (!candidate) return ``;
        const grade = judged[candidate]?.grade;
        return `${nameBySlug.get(candidate)} (${grade ?? `?`})`;
      });
      perGame.push(`| ${i + 1} | ${cells.join(` | `)} |`);
    }
    perGame.push(``);
    const rows = VARIANTS.map((v) => {
      const m = metrics(lists[slug][v.key], judged);
      (totals[v.key] ??= []).push(m);
      return `| ${v.label} | ${m.p5.toFixed(2)} | ${m.p10.toFixed(2)} | ${m.ndcg.toFixed(2)} | ${m.zero5} | ${m.unjudged} |`;
    });
    const relevant = metrics([], judged).relevantKnown;
    perGame.push(
      `Jeux pertinents connus pour ce jeu : ${relevant}${relevant < DEPTH ? ` (moins de ${DEPTH} : P@10 plafonne à ${(relevant / DEPTH).toFixed(1)})` : ``}.`,
      ``,
      `| Variante | P@5 | P@10 | nDCG@10 | Hors sujet top 5 | Non notés top 10 |`,
      `|---|---|---|---|---|---|`,
      ...rows,
      ``,
    );
    // Relevant games found by no variant of the new engine
    const found = new Set(
      VARIANTS.slice(1).flatMap((v) => lists[slug][v.key].slice(0, DEPTH)),
    );
    const missed = Object.entries(judged)
      .filter(
        ([candidate, j]) => (j.grade ?? 0) >= RELEVANT && !found.has(candidate),
      )
      .map(([candidate]) => nameBySlug.get(candidate));
    if (missed.length)
      perGame.push(
        `Pertinents manqués par l'hybride : ${missed.join(`, `)}.`,
        ``,
      );
  }
  out.push(
    `## Moyennes sur ${Object.keys(lists).length} jeux de référence`,
    ``,
    `| Variante | P@5 | P@10 | nDCG@10 | Hors sujet top 5 (moy.) | Non notés top 10 (total) |`,
    `|---|---|---|---|---|---|`,
    ...VARIANTS.map((v) => {
      const list = totals[v.key] ?? [];
      return `| ${v.label} | ${mean(list.map((m) => m.p5)).toFixed(2)} | ${mean(list.map((m) => m.p10)).toFixed(2)} | ${mean(list.map((m) => m.ndcg).filter((x) => !Number.isNaN(x))).toFixed(2)} | ${mean(list.map((m) => m.zero5)).toFixed(1)} | ${list.reduce((sum, m) => sum + m.unjudged, 0)} |`;
    }),
    ``,
  );

  // ── Weights (--tune) ─────────────────────────────────────────────────────
  if (args.tune) {
    const steps = [0, 0.1, 0.2, 0.35, 0.5];
    const grid: Weights[] = [];
    for (const vector of steps)
      for (const descriptors of steps)
        for (const genres of [0, 0.05, 0.1, 0.2])
          for (const similar of [0, 0.05, 0.1])
            for (const time of [0, 0.05, 0.1])
              for (const quality of [0, 0.05, 0.1]) {
                if (!vector && !descriptors) continue;
                grid.push({
                  vector,
                  descriptors,
                  genres,
                  modes: 0.05,
                  similar,
                  time,
                  quality,
                });
              }
    const slugs = Object.keys(lists);
    // nDCG on the judged games only (condensed list): the unjudged picks of a
    // new combination are neither rewarded nor punished
    const scoreOf = (weights: Weights, slug: string) => {
      const reference = recommender.catalog.games.get(bySlug.get(slug)!.id)!;
      const judged = judgments[slug];
      const list = rank(recommender.catalog, reference, cached.get(slug)!, {
        weights,
        minScore: 0,
        count: 40,
      })
        .map(({ id }) => slugById.get(id)!)
        .filter((candidate) => judged[candidate]?.grade != null);
      return metrics(list, judged).ndcg;
    };
    const table = grid.map((weights) => ({
      weights,
      scores: slugs.map((slug) => scoreOf(weights, slug)),
    }));
    const heldOut = slugs.map((slug, i) => {
      const best = table
        .map((row) => ({
          ...row,
          train: mean(row.scores.filter((_, j) => j !== i)),
        }))
        .sort((a, b) => b.train - a.train)[0];
      return { slug, test: best.scores[i], weights: best.weights };
    });
    const overall = table
      .map((row) => ({ ...row, all: mean(row.scores) }))
      .sort((a, b) => b.all - a.all)[0];
    const current = mean(slugs.map((slug) => scoreOf(WEIGHTS, slug)));
    out.push(
      `## Pondérations (--tune, ${grid.length} combinaisons)`,
      ``,
      `nDCG@10 sur listes condensées (jeux notés seulement).`,
      ``,
      `- Poids actuels (\`src/config/recommendations.ts\`) : ${current.toFixed(3)}`,
      `- Leave-one-out (poids choisis sans le jeu testé) : ${mean(heldOut.map((h) => h.test)).toFixed(3)}`,
      `- Meilleure combinaison sur tout le panel : ${overall.all.toFixed(3)} avec \`${JSON.stringify(overall.weights)}\``,
      ``,
      `L'écart entre les deux dernières lignes mesure le surapprentissage.`,
      ``,
    );
  }

  out.push(...perGame);
  writeFileSync(`${DIR}/report.md`, out.join(`\n`));
  console.info(`${DIR}/report.md and ${JUDGMENTS} written`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDb);
