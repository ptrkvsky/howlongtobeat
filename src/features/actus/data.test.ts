import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { NewsCategory, NewsSummary } from '@/config/news';
import {
  adjacentArticles,
  categoriesWithCount,
  groupByDay,
  pickLead,
  relatedArticles,
  topGames,
} from './data';

const article = (
  slug: string,
  date: string,
  extra: {
    category?: NewsCategory;
    game?: string;
    fallbackImage?: boolean;
  } = {},
): NewsSummary => ({
  slug,
  date,
  category: extra.category ?? `autre`,
  author: `lea-moreau`,
  image: {
    url: extra.fallbackImage ? `/actus/autre.webp` : `https://img/${slug}.jpg`,
    width: 1600,
    height: 900,
    alt: slug,
  },
  title: slug,
  excerpt: slug,
  game: extra.game
    ? {
        name: extra.game,
        slug: extra.game,
        cover: null,
        timeMainStory: 10,
        timeCompletionists: 30,
      }
    : null,
});

describe(`pickLead`, () => {
  it(`puts articles about a game first, then real artworks, keeping recency`, () => {
    const list = [
      article(`a`, `2026-10-23T10:00:00Z`, { fallbackImage: true }),
      article(`b`, `2026-10-23T09:00:00Z`),
      article(`c`, `2026-10-23T08:00:00Z`, { game: `zelda` }),
      article(`d`, `2026-10-23T07:00:00Z`, { game: `mario` }),
    ];
    assert.deepEqual(
      pickLead(list).map((item) => item.slug),
      [`c`, `d`, `b`],
    );
  });

  it(`takes one story per game`, () => {
    const list = [
      article(`a`, `2026-10-23T10:00:00Z`, { game: `zelda` }),
      article(`b`, `2026-10-23T09:00:00Z`, { game: `zelda` }),
      article(`c`, `2026-10-23T08:00:00Z`, { game: `mario` }),
      article(`d`, `2026-10-23T07:00:00Z`),
    ];
    assert.deepEqual(
      pickLead(list).map((item) => item.slug),
      [`a`, `c`, `d`],
    );
  });

  it(`works with fewer articles than the lead size`, () => {
    assert.equal(pickLead([article(`a`, `2026-10-23T10:00:00Z`)]).length, 1);
    assert.deepEqual(pickLead([]), []);
  });

  it(`ignores articles older than the pool`, () => {
    const list = Array.from({ length: 20 }, (_, index) =>
      article(`n${index}`, `2026-10-23T10:00:00Z`, {
        game: index === 19 ? `old` : undefined,
      }),
    );
    assert.ok(!pickLead(list).some((item) => item.slug === `n19`));
  });
});

describe(`groupByDay`, () => {
  it(`groups by Paris day, not UTC day`, () => {
    const groups = groupByDay([
      article(`a`, `2026-10-23T22:30:00Z`), // 24 Oct 00:30 in Paris
      article(`b`, `2026-10-23T10:00:00Z`),
      article(`c`, `2026-10-22T10:00:00Z`),
    ]);
    assert.deepEqual(
      groups.map((group) => [group.key, group.articles.length]),
      [
        [`2026-10-24`, 1],
        [`2026-10-23`, 1],
        [`2026-10-22`, 1],
      ],
    );
  });

  it(`returns nothing for an empty list`, () => {
    assert.deepEqual(groupByDay([]), []);
  });
});

describe(`relatedArticles`, () => {
  const list = [
    article(`self`, `2026-10-23T10:00:00Z`, {
      category: `sortie`,
      game: `zelda`,
    }),
    article(`other-game`, `2026-10-23T09:00:00Z`, { category: `sortie` }),
    article(`same-game`, `2026-10-20T09:00:00Z`, {
      category: `annonce`,
      game: `zelda`,
    }),
    article(`unrelated`, `2026-10-23T08:00:00Z`, { category: `promo` }),
  ];

  it(`ranks the same game before the same category and skips unrelated`, () => {
    assert.deepEqual(
      relatedArticles(list[0], list).map((item) => item.slug),
      [`same-game`, `other-game`],
    );
  });

  it(`returns nothing when nothing relates`, () => {
    const lonely = article(`x`, `2026-10-23T10:00:00Z`, { category: `promo` });
    assert.deepEqual(relatedArticles(lonely, [lonely]), []);
  });

  it(`respects the size`, () => {
    assert.equal(relatedArticles(list[0], list, 1).length, 1);
  });
});

describe(`adjacentArticles`, () => {
  const list = [
    article(`new`, `2026-10-23T10:00:00Z`),
    article(`mid`, `2026-10-22T10:00:00Z`),
    article(`old`, `2026-10-21T10:00:00Z`),
  ];

  it(`gives the newer and older neighbours`, () => {
    const { newer, older } = adjacentArticles(list[1], list);
    assert.equal(newer?.slug, `new`);
    assert.equal(older?.slug, `old`);
  });

  it(`has no neighbour at the ends`, () => {
    assert.equal(adjacentArticles(list[0], list).newer, undefined);
    assert.equal(adjacentArticles(list[2], list).older, undefined);
  });
});

describe(`categoriesWithCount`, () => {
  it(`lists only used categories, in the config order`, () => {
    const result = categoriesWithCount([
      article(`a`, `2026-10-23T10:00:00Z`, { category: `promo` }),
      article(`b`, `2026-10-23T10:00:00Z`, { category: `sortie` }),
      article(`c`, `2026-10-23T10:00:00Z`, { category: `sortie` }),
    ]);
    assert.deepEqual(result, [
      { category: `sortie`, count: 2 },
      { category: `promo`, count: 1 },
    ]);
  });
});

describe(`topGames`, () => {
  const now = new Date(`2026-10-24T00:00:00Z`);

  it(`counts recent articles per game and ignores old ones`, () => {
    const result = topGames(
      [
        article(`a`, `2026-10-23T10:00:00Z`, { game: `zelda` }),
        article(`b`, `2026-10-22T10:00:00Z`, { game: `zelda` }),
        article(`c`, `2026-10-22T10:00:00Z`, { game: `mario` }),
        article(`d`, `2026-08-01T10:00:00Z`, { game: `old` }),
        article(`e`, `2026-10-22T10:00:00Z`),
      ],
      now,
    );
    assert.deepEqual(
      result.map((game) => [game.slug, game.count]),
      [
        [`zelda`, 2],
        [`mario`, 1],
      ],
    );
  });
});
