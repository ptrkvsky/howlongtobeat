/**
 * POC: can HowLongToBeat game pages still be read, and which signals tell a
 * game known to the general public from an obscure one? Quality first: the
 * threshold is the most permissive rule that lets no obscure game through,
 * the resulting volume is only an outcome. Nothing is written to Sanity.
 *
 * 1. List the candidates (Wikidata items with an HLTB id + current catalog):
 *   pnpm tsx scripts/hltb-poc.ts --candidates
 * 2. Read a stratified sample of HLTB pages (+ Steam review counts):
 *   pnpm tsx scripts/hltb-poc.ts --sample [--limit 5]
 * 3. Feasibility, distributions and threshold grid, writes sample.csv:
 *   pnpm tsx scripts/hltb-poc.ts --analyze
 *
 * The `connu` column of .hltb-poc/sample.csv can be filled by hand (oui/non):
 * --analyze keeps it and uses it to measure the precision of each rule.
 * --sample resumes: games already in sample.jsonl are skipped, unless they
 * had errors.
 *
 * Env (.env.local / .env): SANITY_ID, SANITY_DATASET
 */
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { createClient } from '@sanity/client';
import {
  checkHltb,
  getHltbGame,
  HltbStructureError,
  type HltbGame,
} from './enrich/hltb';
import { errorMessage, HttpError, requestCounts } from './enrich/http';
import { getSteamReviews } from './enrich/steam';
import { getAllHltbItems } from './enrich/wikidata';

for (const file of [`.env.local`, `.env`]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const { values: args } = parseArgs({
  options: {
    candidates: { type: `boolean`, default: false },
    sample: { type: `boolean`, default: false },
    analyze: { type: `boolean`, default: false },
    limit: { type: `string` },
    'per-stratum': { type: `string`, default: `50` },
    catalog: { type: `string`, default: `100` },
    concurrency: { type: `string`, default: `3` },
  },
});

const OUTPUT_DIR = join(process.cwd(), `.hltb-poc`);
const CANDIDATES_FILE = join(OUTPUT_DIR, `candidates.jsonl`);
const SAMPLE_FILE = join(OUTPUT_DIR, `sample.jsonl`);
const CSV_FILE = join(OUTPUT_DIR, `sample.csv`);
// Interval between two HLTB pages, see INTERVALS in enrich/http.ts
const HLTB_INTERVAL_S = 2;

// Hand-picked controls: HLTB ids checked against Wikidata or the catalog
const KNOWN: Record<number, string> = {
  38019: `The Legend of Zelda: Breath of the Wild`,
  6064: `Minecraft`,
  62941: `Hades`,
  34716: `Stardew Valley`,
  10270: `The Witcher 3: Wild Hunt`,
  4064: `Grand Theft Auto V`,
  27100: `Red Dead Redemption 2`,
  68151: `Elden Ring`,
  26286: `Hollow Knight`,
  42818: `Celeste`,
  7231: `Portal 2`,
  42833: `Super Mario Odyssey`,
  2224: `Dark Souls`,
  5635: `Mario Kart 8`,
  68240: `Animal Crossing: New Horizons`,
  30385: `Undertale`,
  2127: `Cyberpunk 2077`,
  9997: `The Last of Us`,
  9859: `The Elder Scrolls V: Skyrim`,
  74207: `Among Us`,
  80199: `It Takes Two`,
  57335: `Disco Elysium`,
  7169: `Pokémon Red and Blue`,
  9371: `Super Mario Bros.`,
  4248: `Half-Life 2`,
  1065: `BioShock`,
  5699: `Mass Effect 2`,
  10796: `Uncharted 2: Among Thieves`,
  21680: `Cuphead`,
  3521: `Final Fantasy VII`,
  7720: `Resident Evil 4`,
  9705: `Terraria`,
};
const OBSCURE: Record<number, string> = {
  86489: `Rescue Team: Planet Savers`,
  45318: `Arizona Rose and the Pirates' Riddles`,
  43440: `Skedaddle`,
  44764: `The guard of dungeon`,
  84339: `Lord of Djinn`,
  92413: `My Catgirl Maid Thinks She Runs the Place`,
  29981: `Botology`,
  54283: `Final Fleet`,
  34260: `Blood of Magic`,
  52104: `Ayakashigami`,
  159636: `Shokudo Underworld`,
  167326: `Witchfall: Secrets of Emotica`,
  113888: `Fishing Adventure VR`,
  91860: `Apollon 88`,
  131661: `Sophie: Starlight Whispers`,
  132291: `Kibbi Keeper`,
  81882: `Matchville - Match 3 Puzzle`,
  116364: `Haunted Hotel: Charles Dexter Ward Collector's Edition`,
  129856: `Ritual Night`,
  96662: `Bro Falls`,
};

// Wikipedia sitelinks buckets, [min, max]
const BUCKETS = [
  [0, 0],
  [1, 2],
  [3, 5],
  [6, 10],
  [11, 20],
  [21, Infinity],
] as const;
const bucketName = ([min, max]: (typeof BUCKETS)[number]) =>
  max === Infinity
    ? `sl ${min}+`
    : min === max
      ? `sl ${min}`
      : `sl ${min}-${max}`;

interface Candidate {
  hltb: number;
  label: string | null;
  qid: string | null;
  sitelinks: number | null; // null: not in Wikidata
  steam: number | null;
  inCatalog: boolean;
  totalPoll: number | null;
}

type Control = `known` | `obscure`;

interface Entry {
  hltb: number;
  stratum: string;
  control: Control | null;
  label: string | null;
  sitelinks: number | null;
  inCatalog: boolean;
  totalPoll: number | null;
  status: `ok` | `not_found` | `empty` | `error`;
  game: HltbGame | null;
  steamReviews: number | null;
  ms: number;
  error: string | null;
}

const readJsonl = <T>(file: string): T[] => {
  const content = readFileSync(file, `utf8`).trim();
  return content
    ? content.split(`\n`).map((line) => JSON.parse(line) as T)
    : [];
};

function readSample() {
  const entries = new Map<number, Entry>();
  if (!existsSync(SAMPLE_FILE)) return entries;
  // Last line wins: retries are appended after the first attempt
  for (const entry of readJsonl<Entry>(SAMPLE_FILE)) {
    entries.set(entry.hltb, entry);
  }
  return entries;
}

// Deterministic shuffle: the same sample is drawn on every run (resume)
function shuffled<T>(items: T[], seed = 42) {
  const copy = [...items];
  let state = seed;
  const random = () => {
    state = (state * 1_103_515_245 + 12_345) % 2 ** 31;
    return state / 2 ** 31;
  };
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const pct = (count: number, of: number) =>
  of ? `${Math.round((count / of) * 100)} %` : `-`;

function percentiles(values: number[], points = [0.1, 0.25, 0.5, 0.75, 0.9]) {
  const sorted = [...values].sort((a, b) => a - b);
  if (!sorted.length) return points.map(() => `-`).join(` / `);
  return points
    .map((point) => sorted[Math.floor(point * (sorted.length - 1))])
    .join(` / `);
}

// ── 1. Candidates ──────────────────────────────────────────────────────────

async function candidates() {
  const sanity = createClient({
    projectId: process.env.SANITY_ID,
    dataset: process.env.SANITY_DATASET,
    apiVersion: `2024-01-01`,
    useCdn: true,
  });
  const [wikidata, catalog] = await Promise.all([
    getAllHltbItems(),
    sanity.fetch<{ idHltb: number; name: string; totalPoll: number | null }[]>(
      `*[_type == "game"]{ idHltb, name, totalPoll }`,
    ),
  ]);
  const byHltb = new Map<number, Candidate>();
  for (const item of wikidata.values()) {
    byHltb.set(item.hltb, {
      hltb: item.hltb,
      label: item.label,
      qid: item.qid,
      sitelinks: item.sitelinks,
      steam: item.steam,
      inCatalog: false,
      totalPoll: null,
    });
  }
  for (const game of catalog) {
    const candidate = byHltb.get(game.idHltb) ?? {
      hltb: game.idHltb,
      label: game.name,
      qid: null,
      sitelinks: null,
      steam: null,
      inCatalog: true,
      totalPoll: null,
    };
    candidate.inCatalog = true;
    candidate.totalPoll = game.totalPoll;
    byHltb.set(game.idHltb, candidate);
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(
    CANDIDATES_FILE,
    [...byHltb.values()].map((c) => JSON.stringify(c)).join(`\n`) + `\n`,
  );

  const all = [...byHltb.values()];
  const inWikidata = all.filter((c) => c.sitelinks !== null);
  const catalogInWikidata = all.filter(
    (c) => c.inCatalog && c.sitelinks !== null,
  );
  const controls = [...Object.keys(KNOWN), ...Object.keys(OBSCURE)].map(Number);
  console.info(`\n── Candidates → ${CANDIDATES_FILE}`);
  console.info(`Wikidata items with an HLTB id: ${inWikidata.length}`);
  console.info(
    `Catalog: ${catalog.length}, in Wikidata ${catalogInWikidata.length} (${pct(catalogInWikidata.length, catalog.length)})`,
  );
  const knownIn = Object.keys(KNOWN).filter((id) => wikidata.has(Number(id)));
  console.info(
    `Known controls in Wikidata: ${knownIn.length}/${Object.keys(KNOWN).length}, missing: ${Object.entries(
      KNOWN,
    )
      .filter(([id]) => !wikidata.has(Number(id)))
      .map(([, name]) => name)
      .join(`, `)}`,
  );
  console.info(`Sitelinks (Wikidata items outside the catalog):`);
  for (const bucket of BUCKETS) {
    const count = inWikidata.filter(
      (c) =>
        !c.inCatalog &&
        !controls.includes(c.hltb) &&
        c.sitelinks! >= bucket[0] &&
        c.sitelinks! <= bucket[1],
    ).length;
    console.info(`  ${bucketName(bucket).padEnd(8)} ${count}`);
  }
}

// ── 2. Sample ──────────────────────────────────────────────────────────────

function drawSample(all: Candidate[]) {
  const perStratum = Number(args[`per-stratum`]);
  const catalogSize = Number(args.catalog);
  const byHltb = new Map(all.map((c) => [c.hltb, c]));
  const picks: Omit<
    Entry,
    `status` | `game` | `steamReviews` | `ms` | `error`
  >[] = [];
  const pick = (
    c: Candidate | undefined,
    hltb: number,
    stratum: string,
    control: Control | null,
    label: string | null,
  ) =>
    picks.push({
      hltb,
      stratum,
      control,
      label: label ?? c?.label ?? null,
      sitelinks: c?.sitelinks ?? null,
      inCatalog: c?.inCatalog ?? false,
      totalPoll: c?.totalPoll ?? null,
    });

  for (const [id, name] of Object.entries(KNOWN)) {
    pick(byHltb.get(Number(id)), Number(id), `control`, `known`, name);
  }
  for (const [id, name] of Object.entries(OBSCURE)) {
    pick(byHltb.get(Number(id)), Number(id), `control`, `obscure`, name);
  }
  const controls = new Set(picks.map((p) => p.hltb));
  const pool = shuffled(
    all.filter((c) => !controls.has(c.hltb)).sort((a, b) => a.hltb - b.hltb),
  );

  // Catalog: evenly spaced over the totalPoll ranking
  const catalog = all
    .filter((c) => c.inCatalog && !controls.has(c.hltb))
    .sort((a, b) => (b.totalPoll ?? 0) - (a.totalPoll ?? 0) || a.hltb - b.hltb);
  const step = catalog.length / catalogSize;
  for (let i = 0; i < catalogSize && i * step < catalog.length; i++) {
    const c = catalog[Math.floor(i * step)];
    pick(c, c.hltb, `catalog`, null, null);
  }
  for (const bucket of BUCKETS) {
    const members = pool.filter(
      (c) =>
        !c.inCatalog &&
        c.sitelinks !== null &&
        c.sitelinks >= bucket[0] &&
        c.sitelinks <= bucket[1],
    );
    for (const c of members.slice(0, perStratum)) {
      pick(c, c.hltb, bucketName(bucket), null, null);
    }
  }
  return picks;
}

async function sample() {
  if (!existsSync(CANDIDATES_FILE)) {
    throw new Error(`Run --candidates first`);
  }
  const startedAt = Date.now();
  const picks = drawSample(readJsonl<Candidate>(CANDIDATES_FILE));
  const done = readSample();
  const todo = picks.filter(
    (p) => !done.has(p.hltb) || done.get(p.hltb)!.status === `error`,
  );
  const pending = args.limit ? todo.slice(0, Number(args.limit)) : todo;
  console.info(
    `${picks.length} games in the sample, ${picks.length - todo.length} already done, ${pending.length} to read → ${SAMPLE_FILE} (~${Math.ceil((pending.length * HLTB_INTERVAL_S) / 60)} min)`,
  );
  if (!pending.length) return;
  await checkHltb();

  const candidates = new Map(
    readJsonl<Candidate>(CANDIDATES_FILE).map((c) => [c.hltb, c]),
  );
  let index = 0;
  let finished = 0;
  let stop: Error | null = null;
  const worker = async () => {
    while (!stop && index < pending.length) {
      const pick = pending[index++];
      const start = Date.now();
      const entry: Entry = {
        ...pick,
        status: `error`,
        game: null,
        steamReviews: null,
        ms: 0,
        error: null,
      };
      try {
        const result = await getHltbGame(pick.hltb);
        entry.ms = Date.now() - start;
        entry.status = result.status;
        if (result.status === `ok`) {
          entry.game = result.game;
          const steam = result.game.steam || candidates.get(pick.hltb)?.steam;
          if (steam) {
            try {
              entry.steamReviews = (await getSteamReviews(steam))?.total ?? 0;
            } catch (error) {
              entry.error = `steam: ${errorMessage(error)}`;
            }
          }
        }
      } catch (error) {
        entry.ms = Date.now() - start;
        entry.error = errorMessage(error);
        // The page shape changed or HLTB blocks us: no point going on
        const blocked =
          error instanceof HttpError && [403, 429].includes(error.status);
        if (error instanceof HltbStructureError || blocked) {
          stop = error as Error;
        }
      }
      appendFileSync(SAMPLE_FILE, `${JSON.stringify(entry)}\n`);
      finished++;
      const game = entry.game;
      console.info(
        `${entry.status === `ok` ? `✔` : `·`} [${finished}/${pending.length}] ${pick.stratum.padEnd(8)} ${game?.name ?? pick.label ?? pick.hltb} → ${
          game
            ? `${game.type}, total ${game.countTotal}, beat ${game.countComp}, main ${game.compMainCount}${entry.steamReviews !== null ? `, steam ${entry.steamReviews}` : ``}`
            : entry.status
        }${entry.error ? ` ⚠ ${entry.error}` : ``}`,
      );
    }
  };
  await Promise.all(
    Array.from({ length: Number(args.concurrency) }, () => worker()),
  );
  console.info(
    `Run: ${Math.round((Date.now() - startedAt) / 1000)} s ·`,
    Object.fromEntries(requestCounts),
  );
  if (stop) throw stop;
}

// ── 3. Analyze ─────────────────────────────────────────────────────────────

interface Rule {
  minMain: number; // A: comp_main_count, for a credible main story time
  minTotal: number; // X: count_total (players who added the game)
  minSitelinks: number; // Y
  // Sitelinks alone let unknown retro games in: they also need this count_total
  wikiMinTotal: number;
  minSteam: number; // Z: Steam reviews
}

// Chosen after the first sample (see docs/enrichissement-fiches-jeux.md):
// main ≥ 10 is where extras / 100 % times stop missing
const RECOMMENDED: Rule = {
  minMain: 10,
  minTotal: 1000,
  minSitelinks: 8,
  wikiMinTotal: 300,
  minSteam: 10_000,
};

// HLTB types that get a page: Minecraft is `endless`, It Takes Two `multi`.
// Left out: dlc, mod, compil (duplicates), omit (not games), empty type
const PAGE_TYPES = new Set([`game`, `multi`, `endless`, `sports`]);
const isPageType = (entry: Entry) => PAGE_TYPES.has(entry.game?.type ?? ``);

const passes = (entry: Entry, rule: Rule) => {
  const game = entry.game;
  if (!game || !isPageType(entry) || game.compMainCount < rule.minMain) {
    return false;
  }
  return (
    game.countTotal >= rule.minTotal ||
    ((entry.sitelinks ?? 0) >= rule.minSitelinks &&
      game.countTotal >= rule.wikiMinTotal) ||
    (entry.steamReviews ?? 0) >= rule.minSteam
  );
};

const ruleName = (rule: Rule) =>
  [
    `main≥${rule.minMain}`,
    `(total≥${rule.minTotal}`,
    rule.minSitelinks === Infinity
      ? null
      : `wiki≥${rule.minSitelinks}${rule.wikiMinTotal ? `&total≥${rule.wikiMinTotal}` : ``}`,
    rule.minSteam === Infinity ? null : `steam≥${rule.minSteam}`,
  ]
    .filter(Boolean)
    .join(` | `) + `)`;

const CSV_COLUMNS = [
  `hltb`,
  `name`,
  `stratum`,
  `control`,
  `type`,
  `sitelinks`,
  `countTotal`,
  `countComp`,
  `compMainCount`,
  `mainHours`,
  `steamReviews`,
  `url`,
  `connu`,
] as const;

const csvCell = (value: unknown) => {
  const text = value === null || value === undefined ? `` : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, `""`)}"` : text;
};

function parseCsv(content: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = ``;
  let quoted = false;
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (quoted) {
      if (char === `"` && content[i + 1] === `"`) {
        cell += `"`;
        i++;
      } else if (char === `"`) quoted = false;
      else cell += char;
    } else if (char === `"`) quoted = true;
    else if (char === `,`) {
      row.push(cell);
      cell = ``;
    } else if (char === `\n`) {
      rows.push([...row, cell.replace(/\r$/, ``)]);
      row = [];
      cell = ``;
    } else cell += char;
  }
  if (cell || row.length) rows.push([...row, cell]);
  return rows;
}

// Hand labels from a previous sample.csv: hltb → true (connu) / false
function readLabels() {
  const labels = new Map<number, boolean>();
  if (!existsSync(CSV_FILE)) return labels;
  const [header, ...rows] = parseCsv(readFileSync(CSV_FILE, `utf8`));
  const hltbAt = header.indexOf(`hltb`);
  const labelAt = header.indexOf(`connu`);
  for (const row of rows) {
    const value = row[labelAt]?.trim().toLowerCase();
    if (value === `oui` || value === `non`) {
      labels.set(Number(row[hltbAt]), value === `oui`);
    }
  }
  return labels;
}

function writeCsv(entries: Entry[], labels: Map<number, boolean>) {
  const lines = entries.map((entry) => {
    const label = labels.get(entry.hltb);
    const row: Record<(typeof CSV_COLUMNS)[number], unknown> = {
      hltb: entry.hltb,
      name: entry.game?.name ?? entry.label,
      stratum: entry.stratum,
      control: entry.control,
      type: entry.game?.type,
      sitelinks: entry.sitelinks,
      countTotal: entry.game?.countTotal,
      countComp: entry.game?.countComp,
      compMainCount: entry.game?.compMainCount,
      mainHours: entry.game?.compMain
        ? Math.round((entry.game.compMain / 3600) * 10) / 10
        : null,
      steamReviews: entry.steamReviews,
      url: `https://howlongtobeat.com/game/${entry.hltb}`,
      connu:
        label === undefined
          ? entry.control
            ? entry.control === `known`
              ? `oui`
              : `non`
            : ``
          : label
            ? `oui`
            : `non`,
    };
    return CSV_COLUMNS.map((column) => csvCell(row[column])).join(`,`);
  });
  writeFileSync(CSV_FILE, [CSV_COLUMNS.join(`,`), ...lines].join(`\n`) + `\n`);
}

function analyze() {
  if (!existsSync(SAMPLE_FILE) || !existsSync(CANDIDATES_FILE)) {
    throw new Error(`Run --candidates and --sample first`);
  }
  const entries = [...readSample().values()];
  const candidates = readJsonl<Candidate>(CANDIDATES_FILE);
  const labels = readLabels();
  const ok = entries.filter((entry) => entry.status === `ok`);

  // Feasibility
  const byStatus = Object.groupBy(entries, (entry) => entry.status);
  const httpErrors = Object.groupBy(
    entries.filter((entry) => entry.error),
    (entry) => /HTTP (\d+)/.exec(entry.error!)?.[1] ?? `other`,
  );
  const latencies = ok.map((entry) => entry.ms);
  const hours = (count: number) =>
    `${Math.round(((count * HLTB_INTERVAL_S) / 3600) * 10) / 10} h`;
  console.info(`\n── Feasibility (${entries.length} pages)`);
  console.info(
    `Status:`,
    Object.fromEntries(
      Object.entries(byStatus).map(([status, list]) => [status, list!.length]),
    ),
  );
  console.info(
    `Errors by HTTP status:`,
    Object.fromEntries(
      Object.entries(httpErrors).map(([status, list]) => [
        status,
        list!.length,
      ]),
    ),
  );
  console.info(
    `Latency (ms, p10/p25/p50/p75/p90, throttle wait included): ${percentiles(latencies)}`,
  );
  console.info(
    `Full pass at ${HLTB_INTERVAL_S} s/page: catalog ${candidates.filter((c) => c.inCatalog).length} pages ${hours(candidates.filter((c) => c.inCatalog).length)}, all candidates ${candidates.length} pages ${hours(candidates.length)}`,
  );
  const types = Object.groupBy(ok, (entry) => entry.game!.type || `?`);
  console.info(
    `Game types:`,
    Object.fromEntries(
      Object.entries(types).map(([type, list]) => [type, list!.length]),
    ),
  );

  // Distributions
  const strata = [`control`, `catalog`, ...BUCKETS.map(bucketName)];
  console.info(
    `\n── Distributions (p10 / p25 / p50 / p75 / p90, page types only)`,
  );
  for (const stratum of strata) {
    const list = ok.filter(
      (entry) => entry.stratum === stratum && isPageType(entry),
    );
    if (!list.length) continue;
    const groups =
      stratum === `control`
        ? ([`known`, `obscure`] as const).map(
            (control) =>
              [
                `control ${control}`,
                list.filter((entry) => entry.control === control),
              ] as const,
          )
        : [[stratum, list] as const];
    for (const [name, group] of groups) {
      const steam = group.flatMap((entry) =>
        entry.steamReviews === null ? [] : [entry.steamReviews],
      );
      console.info(`${name} (${group.length})`);
      console.info(
        `  total      ${percentiles(group.map((e) => e.game!.countTotal))}`,
      );
      console.info(
        `  beat       ${percentiles(group.map((e) => e.game!.countComp))}`,
      );
      console.info(
        `  main count ${percentiles(group.map((e) => e.game!.compMainCount))}`,
      );
      console.info(
        `  steam      ${percentiles(steam)} (${steam.length} on Steam)`,
      );
    }
  }

  // Reliability of the main story time by number of submissions
  console.info(
    `\n── Main story time reliability (|average - median| / median, missing categories)`,
  );
  const mainBuckets = [
    [1, 2],
    [3, 5],
    [6, 10],
    [11, 20],
    [21, 50],
    [51, Infinity],
  ] as const;
  for (const [min, max] of mainBuckets) {
    const list = ok.filter(
      (entry) =>
        isPageType(entry) &&
        entry.game!.compMainCount >= min &&
        entry.game!.compMainCount <= max &&
        entry.game!.compMainMed > 0,
    );
    if (!list.length) continue;
    const gaps = list.map((entry) =>
      Math.round(
        (Math.abs(entry.game!.compMain - entry.game!.compMainMed) /
          entry.game!.compMainMed) *
          100,
      ),
    );
    const missing = list.filter(
      (entry) => !entry.game!.compPlus || !entry.game!.comp100,
    ).length;
    console.info(
      `  main ${`${min}${max === Infinity ? `+` : `-${max}`}`.padEnd(6)} ${String(list.length).padStart(4)} games, gap % p50/p75/p90 ${percentiles(gaps, [0.5, 0.75, 0.9])}, extras or 100 % missing ${pct(missing, list.length)}`,
    );
  }

  // Weights: each sampled game stands for the games of its stratum
  const controlIds = new Set(
    [...Object.keys(KNOWN), ...Object.keys(OBSCURE)].map(Number),
  );
  const stratumSize = new Map<string, number>();
  stratumSize.set(
    `catalog`,
    candidates.filter((c) => c.inCatalog && !controlIds.has(c.hltb)).length,
  );
  for (const bucket of BUCKETS) {
    stratumSize.set(
      bucketName(bucket),
      candidates.filter(
        (c) =>
          !c.inCatalog &&
          !controlIds.has(c.hltb) &&
          c.sitelinks !== null &&
          c.sitelinks >= bucket[0] &&
          c.sitelinks <= bucket[1],
      ).length,
    );
  }
  const sampled = Object.groupBy(
    entries.filter((entry) => entry.status !== `error`),
    (entry) => entry.stratum,
  );
  const weight = (entry: Entry) =>
    entry.stratum === `control`
      ? 0
      : (stratumSize.get(entry.stratum) ?? 0) /
        (sampled[entry.stratum]?.length ?? 1);

  const evaluate = (rule: Rule) => {
    const known = ok.filter((entry) => entry.control === `known`);
    const obscure = ok.filter((entry) => entry.control === `obscure`);
    const catalog = entries.filter(
      (entry) => entry.stratum === `catalog` && entry.status !== `error`,
    );
    const labeled = ok.filter(
      (entry) =>
        !entry.control && labels.has(entry.hltb) && passes(entry, rule),
    );
    return {
      rule,
      knownKept: known.filter((entry) => passes(entry, rule)).length,
      knownTotal: known.length,
      obscureKept: obscure.filter((entry) => passes(entry, rule)).length,
      obscureTotal: obscure.length,
      catalogKept: catalog.filter((entry) => passes(entry, rule)).length,
      catalogTotal: catalog.length,
      labeledKept: labeled.length,
      labeledKnown: labeled.filter((entry) => labels.get(entry.hltb)).length,
      volume: Math.round(
        ok
          .filter((entry) => passes(entry, rule))
          .reduce((sum, entry) => sum + weight(entry), 0),
      ),
    };
  };

  const grid: Rule[] = [];
  for (const minMain of [3, 5, 10, 20]) {
    for (const minTotal of [500, 1000, 1500, 2000, 5000]) {
      for (const minSitelinks of [5, 8, 10, 20, Infinity]) {
        for (const wikiMinTotal of [0, 300]) {
          for (const minSteam of [2000, 10_000, 20_000, Infinity]) {
            grid.push({
              minMain,
              minTotal,
              minSitelinks,
              wikiMinTotal,
              minSteam,
            });
          }
        }
      }
    }
  }
  const results = grid.map(evaluate);
  // Quality first: no obscure control, and ≥ 95 % known among hand labels
  const precise = results
    .filter(
      (r) =>
        r.obscureKept === 0 &&
        (r.labeledKept < 10 || r.labeledKnown / r.labeledKept >= 0.95),
    )
    .sort((a, b) => b.volume - a.volume);

  const print = (r: ReturnType<typeof evaluate>) =>
    console.info(
      `  ${ruleName(r.rule).padEnd(48)} known ${`${r.knownKept}/${r.knownTotal}`.padStart(5)} · obscure ${`${r.obscureKept}/${r.obscureTotal}`.padStart(5)} · catalog ${pct(r.catalogKept, r.catalogTotal).padStart(5)} · labels ${r.labeledKept ? `${pct(r.labeledKnown, r.labeledKept)} of ${r.labeledKept}` : `-`} · ~${r.volume} games`,
    );
  console.info(
    `\n── Thresholds: no obscure control kept${labels.size ? `, ≥ 95 % known in hand labels` : ``} (${labels.size} labels), largest first`,
  );
  for (const r of precise.slice(0, 15)) print(r);
  console.info(`\nFor reference:`);
  // Former scraper rule: more than 30 "Beat"
  const formerRule = ok.filter(
    (entry) => isPageType(entry) && entry.game!.countComp > 30,
  );
  console.info(
    `  former rule (beat > 30): known ${formerRule.filter((e) => e.control === `known`).length}/${ok.filter((e) => e.control === `known`).length} · obscure ${formerRule.filter((e) => e.control === `obscure`).length}/${ok.filter((e) => e.control === `obscure`).length} · ~${Math.round(formerRule.reduce((sum, e) => sum + weight(e), 0))} games`,
  );
  console.info(`Recommended:`);
  const best = evaluate(RECOMMENDED);
  print(best);

  // Catalog games that the rule would drop, and new games it would add: the
  // obscure controls are rejected by any rule, the real frontier is here
  {
    const added = ok.filter(
      (entry) => !entry.control && !entry.inCatalog && passes(entry, best.rule),
    );
    console.info(
      `\nNew games kept by ${ruleName(best.rule)} (${added.length} sampled, check them by hand):`,
    );
    for (const entry of added) {
      console.info(
        `  ${entry.stratum.padEnd(8)} ${entry.game!.name} (${entry.game!.type}, total ${entry.game!.countTotal}, main ${entry.game!.compMainCount}, wiki ${entry.sitelinks}, steam ${entry.steamReviews ?? `-`})`,
      );
    }
    const dropped = entries.filter(
      (entry) =>
        entry.stratum === `catalog` &&
        entry.status !== `error` &&
        !passes(entry, best.rule),
    );
    console.info(
      `\nCatalog games below ${ruleName(best.rule)} (${dropped.length}/${best.catalogTotal} sampled):`,
    );
    console.info(
      `  ${dropped
        .slice(0, 30)
        .map(
          (entry) =>
            `${entry.game?.name ?? entry.label} (${entry.game?.countTotal ?? entry.status})`,
        )
        .join(` · `)}`,
    );
  }

  writeCsv(entries, labels);
  console.info(
    `\nCSV → ${CSV_FILE} (fill the "connu" column, then rerun --analyze)`,
  );
}

const command = args.candidates
  ? candidates
  : args.sample
    ? sample
    : args.analyze
      ? async () => analyze()
      : null;
if (!command) {
  console.error(`Usage: --candidates | --sample [--limit n] | --analyze`);
  process.exit(1);
}
command().catch((error) => {
  console.error(error);
  process.exit(1);
});
