// End dates of the home: "at 7 h a week, Game Over around December 3".
// Shared by the build (index.astro) and the client scripts, so no import of
// the site besides the pace rules of the game pages.
//
// A date here is a calendar day, held as a Date at 00:00 UTC: adding days
// never crosses a time change, and formatting in UTC gives the same day
// wherever the code runs
import { paceDays } from '../jeu/components/Pace/pace';

const DAY = 86_400_000;

export const civilDate = (year: number, month: number, day: number) =>
  new Date(Date.UTC(year, month - 1, day));

export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

// Whole days from `from` to `to`, negative when `to` is before
export const daysBetween = (from: Date, to: Date) =>
  Math.round((to.getTime() - from.getTime()) / DAY);

// Today in a time zone (Paris for the build), or in the visitor's one
export function today(timeZone?: string, now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat(`en-US`, {
      timeZone,
      year: `numeric`,
      month: `numeric`,
      day: `numeric`,
    })
      .formatToParts(now)
      .map(({ type, value }) => [type, Number(value)]),
  );
  return civilDate(parts.year, parts.month, parts.day);
}

// Day the game is finished when starting `from`, null without a time
export function finishDate(hours: number, perWeek: number, from: Date) {
  if (!(hours > 0) || !(perWeek > 0)) return null;
  return addDays(from, paceDays(hours, perWeek));
}

const shortFormat = new Intl.DateTimeFormat(`fr-FR`, {
  day: `numeric`,
  month: `short`,
  timeZone: `UTC`,
});
const longFormat = new Intl.DateTimeFormat(`fr-FR`, {
  day: `numeric`,
  month: `long`,
  timeZone: `UTC`,
});
const isoFormat = (date: Date) => date.toISOString().slice(0, 10);

// "3 déc." / "3 décembre", with the year when it is not the one of `from`:
// "12 janv. 2027"
export function formatDay(
  date: Date,
  from: Date,
  style: `short` | `long` = `long`,
) {
  const day = (style === `short` ? shortFormat : longFormat).format(date);
  return date.getUTCFullYear() === from.getUTCFullYear()
    ? day
    : `${day} ${date.getUTCFullYear()}`;
}

export const formatIsoDay = isoFormat;

// Calendar milestones of the "before…" list: the next one at least
// MIN_DAYS away, so that the list always leaves time to play
export const MILESTONES = [
  { month: 3, day: 20, label: `le printemps` },
  { month: 6, day: 21, label: `l'été` },
  { month: 9, day: 1, label: `la rentrée` },
  { month: 12, day: 25, label: `Noël` },
];
const MIN_DAYS = 21;

export function nextMilestone(from: Date) {
  const year = from.getUTCFullYear();
  const candidates = [year, year + 1].flatMap((candidateYear) =>
    MILESTONES.map((milestone) => ({
      label: milestone.label,
      date: civilDate(candidateYear, milestone.month, milestone.day),
    })),
  );
  const next = candidates.find(
    ({ date }) => daysBetween(from, date) >= MIN_DAYS,
  )!;
  return { ...next, days: daysBetween(from, next.date) };
}
