import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { HltbGame } from '../enrich/hltb';
import type { WikidataRecentGame } from '../enrich/wikidata';
import { matchRecent, normalizeName } from './match-recent';

const hltb = (over: Partial<HltbGame>): HltbGame => ({
  id: 1,
  name: `Game`,
  type: `game`,
  parent: 0,
  countTotal: 0,
  countComp: 0,
  countBacklog: 0,
  countPlaying: 0,
  countReview: 0,
  reviewScore: 0,
  compMainCount: 0,
  compPlusCount: 0,
  comp100Count: 0,
  compAllCount: 0,
  compMain: 0,
  compMainMed: 0,
  compPlus: 0,
  comp100: 0,
  steam: 0,
  platforms: ``,
  developer: ``,
  publisher: ``,
  releaseWorld: `0000-00-00`,
  summary: ``,
  image: ``,
  genres: ``,
  ...over,
});

const wikidata = (over: Partial<WikidataRecentGame>): WikidataRecentGame => ({
  qid: `Q1`,
  label: `Game`,
  date: `2026-10-15`,
  sitelinks: 9,
  steam: null,
  igdb: null,
  ...over,
});

const belmont = hltb({
  id: 181987,
  name: `Castlevania: Belmont's Curse`,
  steam: 4231820,
  releaseWorld: `2026-10-15`,
});

describe(`normalizeName`, () => {
  it(`ignores case, accents, punctuation and ampersands`, () => {
    assert.equal(
      normalizeName(`Pokémon: Scarlet & Violet!`),
      normalizeName(`pokemon scarlet and violet`),
    );
  });
});

describe(`matchRecent`, () => {
  it(`matches by Steam id, whatever the name`, () => {
    const match = matchRecent(
      wikidata({ label: `Belmont’s Curse (renamed)`, steam: 4231820 }),
      [hltb({ id: 5 }), belmont],
    );
    assert.equal(match.kind, `sure`);
    assert.equal(match.kind === `sure` && match.hltb.id, 181987);
    assert.equal(match.kind === `sure` && match.reason, `steam`);
  });

  it(`matches by name and release month without a Steam id`, () => {
    const match = matchRecent(
      wikidata({ label: `Castlevania: Belmont's Curse`, steam: null }),
      [belmont],
    );
    assert.equal(match.kind, `sure`);
    assert.equal(match.kind === `sure` && match.reason, `name+date`);
  });

  it(`sets aside a same name with another release month (remake, sequel)`, () => {
    const match = matchRecent(
      wikidata({ label: `Resident Evil 4`, date: `2026-03-24` }),
      [hltb({ id: 9, name: `Resident Evil 4`, releaseWorld: `2005-01-11` })],
    );
    assert.equal(match.kind, `uncertain`);
  });

  it(`never matches two different Steam ids by name`, () => {
    const match = matchRecent(
      wikidata({ label: `Game`, steam: 111, date: `2026-10-01` }),
      [hltb({ steam: 222, releaseWorld: `2026-10-01` })],
    );
    assert.equal(match.kind, `none`);
  });

  it(`ignores DLC and compilations sharing the Steam id`, () => {
    const dlc = hltb({ id: 7, type: `dlc`, steam: 4231820 });
    const match = matchRecent(wikidata({ steam: 4231820 }), [dlc, belmont]);
    assert.equal(match.kind, `sure`);
    assert.equal(match.kind === `sure` && match.hltb.id, 181987);
  });

  it(`sets aside several game pages with the same Steam id`, () => {
    const match = matchRecent(wikidata({ steam: 4231820 }), [
      belmont,
      hltb({ id: 8, steam: 4231820 }),
    ]);
    assert.equal(match.kind, `uncertain`);
  });

  it(`returns none without a Steam match or a label`, () => {
    assert.equal(
      matchRecent(wikidata({ label: null, steam: 1 }), [belmont]).kind,
      `none`,
    );
    assert.equal(
      matchRecent(wikidata({ label: `Other game` }), [belmont]).kind,
      `none`,
    );
  });
});
