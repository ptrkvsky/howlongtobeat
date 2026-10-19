/**
 * Which games get a page: popularity threshold chosen with the HLTB POC
 * (scripts/hltb-poc.ts, docs/enrichissement-fiches-jeux.md §11).
 */

export interface Rule {
  minMain: number; // A: comp_main_count, for a credible main story time
  minTotal: number; // X: count_total (players who added the game)
  minSitelinks: number; // Y
  // Sitelinks alone let unknown retro games in: they also need this count_total
  wikiMinTotal: number;
  minSteam: number; // Z: Steam reviews
}

// Chosen after the first sample: main ≥ 10 is where extras / 100 % times
// stop missing
export const RECOMMENDED: Rule = {
  minMain: 10,
  minTotal: 1000,
  minSitelinks: 8,
  wikiMinTotal: 300,
  minSteam: 10_000,
};

// HLTB types that get a page: Minecraft is `endless`, It Takes Two `multi`.
// Left out: dlc, mod, compil (duplicates), omit (not games), empty type
export const PAGE_TYPES = new Set([`game`, `multi`, `endless`, `sports`]);

export interface Signals {
  type: string;
  compMainCount: number;
  countTotal: number;
  sitelinks: number | null; // null: not in Wikidata
  steamReviews: number | null; // null: unknown or not on Steam
}

// Passes without the Steam review count? `undefined` when only Steam can tell
export function passesWithoutSteam(
  signals: Omit<Signals, `steamReviews`>,
  rule = RECOMMENDED,
) {
  if (!PAGE_TYPES.has(signals.type) || signals.compMainCount < rule.minMain) {
    return false;
  }
  if (
    signals.countTotal >= rule.minTotal ||
    ((signals.sitelinks ?? 0) >= rule.minSitelinks &&
      signals.countTotal >= rule.wikiMinTotal)
  ) {
    return true;
  }
  return undefined;
}

export function passes(signals: Signals, rule = RECOMMENDED) {
  return (
    passesWithoutSteam(signals, rule) ??
    (signals.steamReviews ?? 0) >= rule.minSteam
  );
}
