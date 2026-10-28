import assert from 'node:assert/strict';
import { test } from 'node:test';
import { WEIGHTS, type Weights } from '../../../config/recommendations';
import { features, tags } from './fixtures';
import {
  baseTitle,
  combine,
  components,
  createCatalog,
  descriptorNeighbours,
  isVariant,
  modesSimilarity,
  rank,
  timeSimilarity,
} from './score';

const colony = [`Colony Sim`, `Base-Building`, `Survival`, `Management`];
const rimworld = features({
  name: `RimWorld`,
  igdbId: 1,
  genres: [`Simulator`, `Strategy`],
  steamTags: tags(...colony, `Sci-fi`),
  gameModes: [`Single player`],
  timeMainStory: 64,
});
const oxygen = features({
  name: `Oxygen Not Included`,
  igdbId: 2,
  genres: [`Simulator`, `Strategy`],
  steamTags: tags(...colony, `Space`),
  gameModes: [`Single player`],
  timeMainStory: 57,
});
// Shares the science fiction theme and a broad genre only
const shooter = features({
  name: `Space Shooter`,
  igdbId: 3,
  genres: [`Shooter`, `Strategy`],
  steamTags: tags(`FPS`, `Sci-fi`, `Action`, `Multiplayer`),
  gameModes: [`Multiplayer`],
  timeMainStory: 10,
});
const filler = Array.from({ length: 20 }, (_, i) =>
  features({
    name: `Filler ${i}`,
    genres: [`Strategy`],
    steamTags: tags(`Sci-fi`, `Puzzle ${i}`),
  }),
);
const games = [rimworld, oxygen, shooter, ...filler];
const catalog = createCatalog(games);
const descriptorsOnly: Weights = { ...WEIGHTS, vector: 0 };

test(`a colony sim is closer than a game sharing a theme and a broad genre`, () => {
  const close = combine(components(catalog, rimworld, oxygen), descriptorsOnly);
  const far = combine(components(catalog, rimworld, shooter), descriptorsOnly);
  assert.ok(close > 0.7, `colony sim: ${close}`);
  assert.ok(far < 0.3, `shooter: ${far}`);
});

test(`a frequent descriptor weighs less than a rare one`, () => {
  const [first] = descriptorNeighbours(catalog, rimworld, 5);
  assert.equal(first, oxygen.id);
});

test(`a missing embedding is left out of the mean, not counted as 0`, () => {
  const values = components(catalog, rimworld, oxygen);
  assert.equal(values.vector, undefined);
  assert.equal(
    combine(values, WEIGHTS),
    combine(values, { ...WEIGHTS, vector: 0 }),
  );
  const withVector = combine({ ...values, vector: 0 }, WEIGHTS);
  assert.ok(withVector < combine(values, WEIGHTS));
});

test(`a game without any data scores only on the neutral signals`, () => {
  const empty = features({ name: `Unknown` });
  const values = components(catalog, rimworld, empty);
  assert.equal(values.descriptors, undefined);
  assert.equal(values.genres, undefined);
  assert.ok(combine(values, WEIGHTS) < 0.3);
});

test(`modes: solo and multiplayer games do not match`, () => {
  assert.equal(modesSimilarity([`Single player`], [`Single player`]), 1);
  assert.equal(modesSimilarity([`Single player`], [`Multiplayer`]), 0);
  assert.equal(
    modesSimilarity([`Single player`], [`Single player`, `Co-operative`]),
    0.5,
  );
  assert.equal(modesSimilarity([], [`Multiplayer`]), 0.5);
});

test(`time: same length 1, eight times longer 0, unknown neutral`, () => {
  assert.equal(timeSimilarity(10, 10), 1);
  assert.equal(timeSimilarity(10, 80), 0);
  assert.equal(timeSimilarity(0, 10), 0.5);
});

test(`editions and remasters are variants, sequels are not`, () => {
  assert.equal(
    baseTitle(`Tomb Raider: Definitive Edition (2014)`),
    baseTitle(`Tomb Raider`),
  );
  const base = features({ name: `Dark Souls`, igdbId: 10 });
  assert.ok(isVariant(base, features({ name: `Dark Souls: Remastered` })));
  assert.ok(
    isVariant(
      base,
      features({ name: `Prepare to Die`, parentIgdbId: 10, igdbId: 11 }),
    ),
  );
  assert.ok(!isVariant(base, features({ name: `Dark Souls II`, igdbId: 12 })));
  // Names emptied by the cleaning are not all the same game
  assert.ok(
    !isVariant(features({ name: `Edition` }), features({ name: `HD` })),
  );
});

test(`rank leaves out the variants and keeps a few games per series`, () => {
  const series = Array.from({ length: 4 }, (_, i) =>
    features({
      name: `Colony ${i + 2}`,
      seriesIds: [`f1`],
      genres: [`Simulator`, `Strategy`],
      steamTags: tags(...colony),
      gameModes: [`Single player`],
    }),
  );
  const remaster = features({
    name: `RimWorld Remastered`,
    steamTags: tags(...colony),
  });
  const reference = { ...rimworld, seriesIds: [`f1`] };
  const all = [reference, oxygen, shooter, remaster, ...series, ...filler];
  const local = createCatalog(all);
  const result = rank(
    local,
    reference,
    all.map(({ id }) => ({ id })),
    { weights: descriptorsOnly },
  );
  const ids = result.map(({ id }) => id);
  assert.ok(!ids.includes(reference.id));
  assert.ok(!ids.includes(remaster.id));
  // The reference counts in its series: one more game of it
  assert.equal(
    ids.filter((id) => series.some((game) => game.id === id)).length,
    1,
  );
  assert.ok(ids.includes(oxygen.id));
});

test(`rank prefers a short list to filler under the threshold`, () => {
  const result = rank(
    catalog,
    rimworld,
    games.map(({ id }) => ({ id })),
    { weights: descriptorsOnly, minScore: 0.5 },
  );
  assert.deepEqual(
    result.map(({ id }) => id),
    [oxygen.id],
  );
});

test(`rank keeps the score order without diversification`, () => {
  const result = rank(
    catalog,
    rimworld,
    games.map(({ id }) => ({ id })),
    { weights: descriptorsOnly, minScore: 0 },
  );
  const scores = result.map(({ score }) => score);
  assert.deepEqual(
    scores,
    [...scores].sort((a, b) => b - a),
  );
});

test(`rank leaves out a DLC whose base game is in the catalog`, () => {
  const base = features({
    name: `Base Colony`,
    igdbId: 50,
    steamTags: tags(...colony),
    genres: [`Simulator`, `Strategy`],
  });
  const dlc = features({
    name: `Base Colony - Expansion`,
    igdbId: 51,
    parentIgdbId: 50,
    steamTags: tags(...colony),
    genres: [`Simulator`, `Strategy`],
  });
  const all = [rimworld, base, dlc, ...filler];
  const ids = rank(
    createCatalog(all),
    rimworld,
    all.map(({ id }) => ({ id })),
    { weights: descriptorsOnly, minScore: 0 },
  ).map(({ id }) => id);
  assert.ok(ids.includes(base.id));
  assert.ok(!ids.includes(dlc.id));
});
