/**
 * One-off: original artworks for the featured genres of /genres, with the
 * OpenAI Images API. Never run by the build or on a visit; the result is
 * converted to webp and committed in public/genres/.
 *
 *   tsx scripts/generate-genre-images.ts --out /tmp/genres [slug…] [--dry]
 *
 * Env (read from .env.local when present): OPENAI_API_KEY, and optionally
 * GENRE_IMAGE_MODEL (default gpt-image-2). Prints the token usage of each
 * image so the cost can be computed from the current price list.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import OpenAI from 'openai';

if (existsSync(`.env.local`)) process.loadEnvFile(`.env.local`);

const STYLE = [
  `Wide editorial illustration for a video game website, flat graphic style with grain and halftone texture.`,
  `Limited palette: near-black #010103 background, warm cream #fff6e6 shapes, and hot pink #ff008a used sparingly as the single accent.`,
  `Strong silhouettes that stay readable when shrunk to a thumbnail, large simple shapes, a lot of negative space on the left third.`,
  `Original scene with no characters, no faces, no text, no letters, no logos, no user interface, nothing taken from an existing game.`,
].join(` `);

const SCENES: Record<string, string> = {
  adventure: `A lone cream-colored path winding up a dark mountain toward a distant pink sun, a small stone arch and a tiny lantern on the trail.`,
  'role-playing-rpg': `A towering ruined citadel on a cliff above a sea of fog, a long stairway of cream steps climbing into a pink moonlit sky.`,
  strategy: `A top-down map seen at an angle: a cream grid of fields and rivers on black, small pink banners marking positions, a few chess-like tower silhouettes.`,
  simulator: `A cutaway of a tiny floating island with a cream workshop, gears, conveyor belts and a pink glowing reactor, drawn like an isometric blueprint.`,
  shooter: `A long dark corridor in strong one-point perspective, cream light slits on the walls, a pink laser line crossing the frame toward a vanishing point.`,
  platform: `Floating cream platforms and a pink crescent bridge over a bottomless black void, stepped like a staircase, with small spikes and a distant goal flag shape.`,
  puzzle: `An abstract arrangement of interlocking cream blocks and one pink piece, a half-solved geometric mechanism on a dark grid.`,
  'hack-and-slash-beat-em-up': `A cream arc of a huge sword slash cutting across a dark ruined arena with shattered pillars, pink sparks flying from the impact.`,
  'visual-novel': `A quiet empty room at night seen from the doorway: a cream desk with an open book and a small lamp, a large window framing a huge pink moon, a single branching path of light on the floor splitting in two.`,
};

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: `string` },
    dry: { type: `boolean`, default: false },
  },
});
const outDir = values.out ?? ``;
if (!outDir) throw new Error(`--out <dir> is required`);

const slugs = positionals.length ? positionals : Object.keys(SCENES);
const unknown = slugs.filter((slug) => !SCENES[slug]);
if (unknown.length) throw new Error(`No scene for: ${unknown.join(`, `)}`);

if (values.dry) {
  for (const slug of slugs) console.log(`${slug}: ${STYLE} ${SCENES[slug]}`);
  process.exit(0);
}

async function main() {
  if (!process.env.OPENAI_API_KEY) throw new Error(`OPENAI_API_KEY is missing`);
  const client = new OpenAI();
  const model = process.env.GENRE_IMAGE_MODEL || `gpt-image-2`;
  mkdirSync(outDir, { recursive: true });

  for (const slug of slugs) {
    const result = await client.images.generate({
      model,
      prompt: `${STYLE} ${SCENES[slug]}`,
      size: `1536x1024`,
      quality: `medium`,
      n: 1,
    });
    const data = result.data?.[0]?.b64_json;
    if (!data) throw new Error(`No image for ${slug}`);
    writeFileSync(join(outDir, `${slug}.png`), Buffer.from(data, `base64`));
    console.log(`${slug}: ${JSON.stringify(result.usage ?? {})}`);
  }
}

void main();
