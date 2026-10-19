/**
 * French formats for the enriched game data (dates, percents, counts).
 */
const NBSP = ` `;

const dateFormat = new Intl.DateTimeFormat(`fr-FR`, {
  day: `numeric`,
  month: `long`,
  year: `numeric`,
  timeZone: `UTC`,
});
const numberFormat = new Intl.NumberFormat(`fr-FR`);

// "2011-04-19" or a Date → "19 avril 2011"
export const formatDate = (value: string | Date) =>
  dateFormat.format(typeof value === `string` ? new Date(value) : value);

// 99 → "99 %", 0.4 → "0,4 %"
export const formatPercent = (value: number) =>
  `${numberFormat.format(value < 1 ? Math.round(value * 10) / 10 : Math.round(value))}${NBSP}%`;

// 468312 → "468 000": 3 significant digits above 1,000
export function formatCount(value: number) {
  if (value < 1000) return numberFormat.format(value);
  const magnitude = 10 ** (Math.floor(Math.log10(value)) - 2);
  return numberFormat.format(Math.round(value / magnitude) * magnitude);
}

// Steam review summaries, as the French Steam store words them. Summaries
// for fewer than 10 reviews ("3 user reviews") have no label
const STEAM_REVIEW_LABELS: Record<string, string> = {
  'Overwhelmingly Positive': `Extrêmement positives`,
  'Very Positive': `Très positives`,
  Positive: `Positives`,
  'Mostly Positive': `Plutôt positives`,
  Mixed: `Moyennes`,
  'Mostly Negative': `Plutôt négatives`,
  Negative: `Négatives`,
  'Very Negative': `Très négatives`,
  'Overwhelmingly Negative': `Extrêmement négatives`,
};

export const steamReviewLabel = (desc: string | null) =>
  (desc && STEAM_REVIEW_LABELS[desc]) || null;

// "PC, PlayStation 5 et Xbox Series X|S"
export const formatList = (values: string[]) =>
  new Intl.ListFormat(`fr-FR`, { type: `conjunction` }).format(values);
