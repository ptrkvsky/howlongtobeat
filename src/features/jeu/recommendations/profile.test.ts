import assert from 'node:assert/strict';
import { test } from 'node:test';
import { features, tags } from './fixtures';
import {
  buildProfile,
  cleanSummary,
  descriptor,
  descriptors,
  profileHash,
} from './profile';

const rimworld = features({
  name: `RimWorld`,
  genres: [`Simulator`, `Strategy`, `Indie`],
  steamTags: tags(`Colony Sim`, `Base-Building`, `Indie`, `Survival`),
  keywords: [`base building`, `the game awards - best indie - nominee`],
  themes: [`Science fiction`],
  gameModes: [`Single player`],
  summary: `RimWorld is a colony sim driven by an AI storyteller.`,
});

test(`descriptors merge the Steam tags and IGDB keywords spelled differently`, () => {
  assert.equal(descriptor(`Base-Building`), `base building`);
  const weights = descriptors(rimworld);
  // The tag weight wins over the keyword one
  assert.equal(weights.get(`base building`), 0.95);
  assert.equal(weights.get(`colony sim`), 1);
  assert.equal(weights.get(`science fiction`), 0.5);
});

test(`descriptors leave out the business and award ones`, () => {
  const weights = descriptors(rimworld);
  assert.equal(weights.has(`indie`), false);
  assert.ok(![...weights.keys()].some((key) => key.includes(`award`)));
});

test(`the profile has no name, studio nor platform`, () => {
  const profile = buildProfile(rimworld)!;
  assert.ok(!profile.includes(`RimWorld`));
  assert.match(profile, /^Genres: Simulator, Strategy$/m);
  assert.match(profile, /^Gameplay: Colony Sim, Base-Building, Survival$/m);
  assert.match(profile, /^Summary: the game is a colony sim/m);
});

test(`the name is only replaced as a whole word with the same case`, () => {
  assert.equal(
    cleanSummary(`Stray is a game about a stray cat.`, `Stray`),
    `the game is a game about a stray cat.`,
  );
  assert.equal(
    cleanSummary(`Inside the Inside.`, `Inside`),
    `the game the the game.`,
  );
});

test(`a long summary is cut on a word`, () => {
  const summary = cleanSummary(`word `.repeat(300), `X`);
  assert.ok(summary.length <= 801);
  assert.ok(summary.endsWith(`word…`));
});

test(`a game known by its name only has no profile`, () => {
  assert.equal(
    buildProfile(features({ name: `Nothing`, genres: [`Puzzle`] })),
    null,
  );
});

test(`the hash changes with the profile, the model or the dimensions`, () => {
  const hash = profileHash(`a`, `m`, 512);
  assert.equal(hash, profileHash(`a`, `m`, 512));
  assert.notEqual(hash, profileHash(`b`, `m`, 512));
  assert.notEqual(hash, profileHash(`a`, `n`, 512));
  assert.notEqual(hash, profileHash(`a`, `m`, 1024));
});
