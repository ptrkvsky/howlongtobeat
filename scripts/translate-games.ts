/**
 * Translates game descriptions (EN -> FR) with the OpenAI API, and cleans the
 * endings of already published descriptions. Nothing is written to the
 * database until `--write` is run on a reviewed file.
 *
 * Translate untranslated games (best rated first) into a JSONL file:
 *   pnpm tsx scripts/translate-games.ts --limit 50 [--out <file>]
 * Re-translate the games of a previous file from their original source:
 *   pnpm tsx scripts/translate-games.ts --retranslate <file>
 * Clean the endings of published descriptions (".." / "," / cut sentences):
 *   pnpm tsx scripts/translate-games.ts --polish [--limit 20]
 * Write a reviewed file to the database (entries with issues are skipped):
 *   pnpm tsx scripts/translate-games.ts --write <file>
 *
 * Passing an existing `--out` file resumes a run: games already in it are
 * skipped. Each translation is validated, rejected ones are retried once.
 *
 * Only descriptions made of a single plain paragraph are handled.
 *
 * Env (.env.local): OPENAI_API_KEY, OPENAI_MODEL, DATABASE_URL
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
import { and, desc, eq, inArray, ne, or, sql } from 'drizzle-orm';
import OpenAI from 'openai';
import { closeDb, getDb } from '../src/db/client';
import { game } from '../src/db/schema';
import { escapeMarkdown, plainParagraph } from './lib/markdown';

for (const file of [`.env.local`, `.env`]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const { values: args } = parseArgs({
  options: {
    limit: { type: `string`, default: `50` },
    'batch-size': { type: `string`, default: `20` },
    concurrency: { type: `string`, default: `4` },
    'max-usd': { type: `string`, default: `2` },
    out: { type: `string` },
    write: { type: `string` },
    retranslate: { type: `string` },
    polish: { type: `boolean`, default: false },
  },
});

const OUTPUT_DIR = join(process.cwd(), `.translations`);

// USD per 1M tokens (input, output), standard tier
const PRICES: Record<string, [number, number]> = {
  'gpt-6-luna': [0.1, 0.5],
  'gpt-4.1-nano': [0.1, 0.4],
};

type Mode = `translate` | `polish`;

interface Job {
  // game.id, or the Sanity document id in files made before the migration
  _id: string;
  name: string;
  source: string;
  // Text when the job was created: --write skips the game if it changed
  previous?: string;
  mode: Mode;
}

interface Entry extends Job {
  text: string;
  issues: string[];
}

const fields = {
  id: game.id,
  sanityId: game.sanityId,
  name: game.name,
  descriptionMd: game.descriptionMd,
};

const COMMON_RULES = `- Le texte source contient parfois des caractères corrompus (�), le plus souvent à la place d'une apostrophe ou d'un guillemet : corrige-les.
- Beaucoup de textes sont coupés en plein milieu d'une phrase. Dans ce cas, supprime le fragment final incomplet pour terminer sur la dernière phrase complète. Si cela ne laisse aucune phrase, termine la phrase en quelques mots sans inventer d'information.
- Le texte doit toujours se terminer par une ponctuation finale (. ! ? ou …), jamais par une virgule ni par « .. ».
Réponds uniquement avec le JSON demandé, avec le même id pour chaque texte.`;

const PROMPTS: Record<Mode, string> = {
  translate: `Tu traduis en français (France) des descriptions de jeux vidéo écrites en anglais, pour un site qui indique la durée de vie des jeux.
- Traduction fidèle et naturelle, sans rien ajouter ni retirer.
- Garde tels quels les noms de jeux, de personnages, de studios et de lieux.
- Si le texte est déjà en français, renvoie-le en corrigeant seulement les fautes évidentes.
${COMMON_RULES}`,
  polish: `Tu corriges la fin de descriptions de jeux vidéo déjà écrites en français.
- Ne modifie que la fin du texte : tout le reste doit rester strictement identique, mot pour mot.
- Seule exception : rétablis les lettres accentuées manquantes dans les mots abîmés (ex. « prsentateur » → « présentateur », « sicles » → « siècles »), sans rien reformuler.
${COMMON_RULES}`,
};

const RESPONSE_FORMAT = {
  type: `json_schema` as const,
  json_schema: {
    name: `translations`,
    strict: true,
    schema: {
      type: `object`,
      additionalProperties: false,
      required: [`translations`],
      properties: {
        translations: {
          type: `array`,
          items: {
            type: `object`,
            additionalProperties: false,
            required: [`id`, `text`],
            properties: { id: { type: `string` }, text: { type: `string` } },
          },
        },
      },
    },
  },
};

const ENDS_WELL = /[.!?…"”»)]$/;
const EN_WORDS = /\b(the|and|with|your|you|of|to|is|in|this)\b/gi;
const FR_WORDS = /\b(le|la|les|des|et|une|un|dans|vous|pour|est|du)\b/gi;

function validate(job: Job, text: string): string[] {
  const issues: string[] = [];
  const ratio = text.length / Math.max(1, job.source.length);

  if (!ENDS_WELL.test(text)) issues.push(`bad-ending`);
  if (/\.\.$|,$/.test(text)) issues.push(`bad-ending`);
  if (text.includes(`�`)) issues.push(`replacement-char`);
  if (job.mode === `translate` && (ratio < 0.3 || ratio > 2)) {
    issues.push(`length-ratio:${ratio.toFixed(2)}`);
  }
  if (job.mode === `polish` && (ratio < 0.5 || ratio > 1.05)) {
    issues.push(`length-ratio:${ratio.toFixed(2)}`);
  }
  const name = job.name.toLowerCase();
  if (
    job.source.toLowerCase().includes(name) &&
    !text.toLowerCase().includes(name)
  ) {
    issues.push(`name-missing`);
  }
  const withoutName = text.split(job.name).join(` `);
  const en = withoutName.match(EN_WORDS)?.length || 0;
  const fr = withoutName.match(FR_WORDS)?.length || 0;
  if (en >= 4 && en > fr * 2) issues.push(`looks-english`);
  // Polish may only touch the ending (and restore lost accented letters)
  if (job.mode === `polish`) {
    const ascii = (value: string) => value.replace(/[^\x20-\x7e]/g, ``);
    const length = Math.max(
      0,
      Math.min(ascii(job.source).length, ascii(text).length) - 100,
    );
    if (ascii(job.source).slice(0, length) !== ascii(text).slice(0, length)) {
      issues.push(`changed-before-ending`);
    }
  }

  return [...new Set(issues)];
}

function readEntries(file: string) {
  const content = readFileSync(file, `utf8`).trim();
  if (!content) return new Map<string, Entry>();
  // .json files from the first runs are arrays without mode/issues
  const raw: Partial<Entry>[] = content.startsWith(`[`)
    ? JSON.parse(content)
    : content.split(`\n`).map((line) => JSON.parse(line));
  const entries = new Map<string, Entry>();
  for (const item of raw) {
    // Last line wins: retries are appended after the first attempt
    entries.set(
      item._id as string,
      {
        mode: `translate`,
        issues: [],
        ...item,
      } as Entry,
    );
  }
  return entries;
}

async function callModel(openai: OpenAI, model: string, jobs: Job[]) {
  const completion = await openai.chat.completions.create({
    model,
    response_format: RESPONSE_FORMAT,
    messages: [
      { role: `developer`, content: PROMPTS[jobs[0].mode] },
      {
        role: `user`,
        content: JSON.stringify(
          jobs.map((job) => ({ id: job._id, text: job.source })),
        ),
      },
    ],
  });

  const content = completion.choices[0]?.message.content;
  if (!content) throw new Error(`Empty response`);
  const { translations } = JSON.parse(content) as {
    translations: { id: string; text: string }[];
  };
  return {
    texts: new Map(translations.map((t) => [t.id, t.text.trim()])),
    usage: completion.usage,
  };
}

async function loadJobs(): Promise<Job[]> {
  const limit = Number(args.limit);

  if (args.retranslate) {
    return [...readEntries(args.retranslate).values()].map(
      ({ _id, name, source }) => ({ _id, name, source, mode: `translate` }),
    );
  }

  if (args.polish) {
    const games = await getDb()
      .db.select(fields)
      .from(game)
      .where(eq(game.isTranslated, true))
      .orderBy(desc(game.rating));
    const jobs: Job[] = [];
    let multiBlock = 0;
    for (const row of games) {
      const text = plainParagraph(row.descriptionMd);
      if (text === undefined) {
        multiBlock += 1;
        continue;
      }
      if (!ENDS_WELL.test(text.trimEnd()) || /\.\.,?$/.test(text.trimEnd())) {
        jobs.push({
          _id: String(row.id),
          name: row.name,
          source: text,
          previous: text,
          mode: `polish`,
        });
      }
    }
    console.info(
      `${jobs.length} published descriptions to polish, ${multiBlock} skipped (formatted or several paragraphs, fix them in pnpm db:studio)`,
    );
    return jobs.slice(0, limit);
  }

  const games = await getDb()
    .db.select(fields)
    .from(game)
    .where(and(eq(game.isTranslated, false), ne(game.descriptionMd, ``)))
    .orderBy(desc(game.rating))
    .limit(limit);
  return games.flatMap((row) => {
    const text = plainParagraph(row.descriptionMd);
    return text
      ? [
          {
            _id: String(row.id),
            name: row.name,
            source: text,
            previous: text,
            mode: `translate` as const,
          },
        ]
      : [];
  });
}

async function run() {
  const model = process.env.OPENAI_MODEL;
  if (!process.env.OPENAI_API_KEY || !model) {
    throw new Error(`OPENAI_API_KEY and OPENAI_MODEL must be set`);
  }
  const price = PRICES[model];
  if (!price) console.warn(`⚠ no price known for ${model}: no budget check`);
  const maxUsd = Number(args[`max-usd`]);
  const batchSize = Number(args[`batch-size`]);
  const concurrency = Number(args.concurrency);
  const openai = new OpenAI();

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const file =
    args.out ||
    join(
      OUTPUT_DIR,
      `${new Date().toISOString().replace(/[:.]/g, `-`)}-${args.polish ? `polish` : `translate`}-${model}.jsonl`,
    );
  const done = existsSync(file) ? readEntries(file) : new Map<string, Entry>();

  let jobs = await loadJobs();
  const total = jobs.length;
  jobs = jobs.filter(
    (job) => !done.get(job._id) || done.get(job._id)!.issues.length,
  );

  console.info(
    `${total} games, ${done.size} already done, ${jobs.length} to send to ${model} → ${file}`,
  );

  let inputTokens = 0;
  let outputTokens = 0;
  const cost = () =>
    price ? (inputTokens * price[0] + outputTokens * price[1]) / 1_000_000 : 0;

  const processJobs = async (pending: Job[]) => {
    const batches: Job[][] = [];
    for (let i = 0; i < pending.length; i += batchSize) {
      batches.push(pending.slice(i, i + batchSize));
    }
    let next = 0;
    const worker = async () => {
      while (next < batches.length) {
        if (cost() > maxUsd) {
          console.error(`✖ budget of $${maxUsd} reached, stopping`);
          return;
        }
        const batch = batches[next++];
        try {
          const { texts, usage } = await callModel(openai, model, batch);
          inputTokens += usage?.prompt_tokens || 0;
          outputTokens += usage?.completion_tokens || 0;
          for (const job of batch) {
            const text = texts.get(job._id) || ``;
            const issues = text ? validate(job, text) : [`missing`];
            const entry = { ...job, text, issues };
            appendFileSync(file, `${JSON.stringify(entry)}\n`);
            done.set(job._id, entry);
          }
        } catch (error) {
          console.error(`✖ batch failed: ${(error as Error).message}`);
        }
        console.info(
          `✔ ${done.size}/${total} · ${inputTokens} in / ${outputTokens} out · $${cost().toFixed(3)}`,
        );
      }
    };
    await Promise.all(Array.from({ length: concurrency }, worker));
  };

  await processJobs(jobs);

  // Retry rejected entries once
  const rejected = jobs.filter((job) => done.get(job._id)?.issues.length);
  if (rejected.length && cost() <= maxUsd) {
    console.info(`Retrying ${rejected.length} rejected entries…`);
    await processJobs(rejected);
  }

  const entries = [...readEntries(file).values()];
  const withIssues = entries.filter((entry) => entry.issues.length);
  const report = {
    file,
    model,
    total: entries.length,
    ok: entries.length - withIssues.length,
    rejected: withIssues.map(({ _id, name, issues, source, text }) => ({
      _id,
      name,
      issues,
      source,
      text,
    })),
    tokens: { input: inputTokens, output: outputTokens },
    usd: Number(cost().toFixed(4)),
  };
  writeFileSync(`${file}.report.json`, JSON.stringify(report, null, 2));
  console.info(
    `\n${report.ok}/${report.total} valid, ${withIssues.length} rejected · $${report.usd}\nReport: ${file}.report.json`,
  );
}

async function write(file: string) {
  const { db } = getDb();
  const entries = [...readEntries(file).values()].filter((entry) => {
    if (entry.issues.length || !entry.text) {
      console.warn(`⚠ skipped ${entry.name}: ${entry.issues.join(`, `)}`);
      return false;
    }
    return true;
  });

  let written = 0;
  for (let i = 0; i < entries.length; i += 100) {
    const chunk = entries.slice(i, i + 100);
    const isId = (entry: Entry) => /^\d+$/.test(entry._id);
    const rows = await db
      .select(fields)
      .from(game)
      .where(
        or(
          inArray(
            game.id,
            chunk.filter(isId).map((entry) => Number(entry._id)),
          ),
          inArray(
            game.sanityId,
            chunk.filter((entry) => !isId(entry)).map((entry) => entry._id),
          ),
        ),
      );
    const byId = new Map(
      rows.flatMap((row) => [
        [String(row.id), row],
        ...(row.sanityId ? [[row.sanityId, row] as const] : []),
      ]),
    );

    await db.transaction(async (tx) => {
      for (const entry of chunk) {
        const row = byId.get(entry._id);
        const current = row && plainParagraph(row.descriptionMd);
        if (!row || current === undefined) {
          console.warn(`⚠ skipped ${entry.name}: unexpected description`);
          continue;
        }
        if (entry.previous !== undefined && current !== entry.previous) {
          console.warn(`⚠ skipped ${entry.name}: changed since`);
          continue;
        }
        // Only if the description did not change in the meantime
        const updated = await tx
          .update(game)
          .set({
            descriptionMd: escapeMarkdown(entry.text),
            isTranslated: true,
            // Imported games are published by scripts/import-games.ts
            // --publish, once their ids and cover are confirmed
            isPublished: sql`${game.isPublished} or ${game.source} = 'legacy'`,
            updatedAt: new Date(),
          })
          .where(
            and(eq(game.id, row.id), eq(game.descriptionMd, row.descriptionMd)),
          )
          .returning({ id: game.id });
        written += updated.length;
      }
    });
    console.info(`✔ ${Math.min(i + 100, entries.length)}/${entries.length}`);
  }
  console.info(`${written} descriptions written to the database`);
}

(args.write ? write(args.write) : run())
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDb);
