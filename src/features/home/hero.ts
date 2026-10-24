// What the hero shows for a game and a pace: rendered at build time by
// Hero.astro, then again by scripts/home.ts with the visitor's day and pace
import { formatPace } from '../jeu/components/Pace/pace';
import { addDays, daysBetween, finishDate, formatDay } from './finishDate';

export interface HeroGame {
  name: string;
  slug: string;
  main: number;
  plus: number;
  full: number;
}

// The finish line sits at this share of the calendar ruler, whatever the
// game: the longer goals run past it
export const FINISH_AT = 0.82;

const GOALS = [
  { key: `main`, label: `Histoire principale`, goal: `l'histoire principale` },
  { key: `plus`, label: `Histoire + extras`, goal: `l'histoire et ses extras` },
  { key: `full`, label: `100 %`, goal: `le 100 %` },
] as const;

const monthFormat = new Intl.DateTimeFormat(`fr-FR`, {
  month: `short`,
  timeZone: `UTC`,
});
const monthYearFormat = new Intl.DateTimeFormat(`fr-FR`, {
  month: `short`,
  year: `numeric`,
  timeZone: `UTC`,
});

export interface Tick {
  // Percent of the ruler
  at: number;
  // Month start label, else a week tick
  label: string | null;
}

// Week ticks (dropped past half a year) and month starts along `days`
export function calendarTicks(from: Date, days: number): Tick[] {
  const ticks: Tick[] = [];
  if (days <= 182) {
    for (let day = 7; day < days; day += 7)
      ticks.push({ at: (day / days) * 100, label: null });
  }
  const yearChanges =
    addDays(from, days).getUTCFullYear() !== from.getUTCFullYear();
  for (let day = 1; day < days; day += 1) {
    const date = addDays(from, day);
    if (date.getUTCDate() !== 1) continue;
    const label =
      yearChanges && date.getUTCMonth() === 0
        ? monthYearFormat.format(date)
        : monthFormat.format(date);
    ticks.push({ at: (day / days) * 100, label });
  }
  // Labels too close to each other: keep every other one
  const labelled = ticks.filter((tick) => tick.label);
  if (labelled.length > 8)
    labelled.forEach((tick, index) => {
      if (index % 2) tick.label = null;
    });
  return ticks;
}

export function heroView(game: HeroGame, perWeek: number, from: Date) {
  const goals = GOALS.map((goal) => {
    const hours = game[goal.key];
    const end = finishDate(hours, perWeek, from);
    return {
      ...goal,
      hours,
      days: end ? daysBetween(from, end) : 0,
      end,
      endLabel: end ? formatDay(end, from, `short`) : null,
    };
  }).filter((goal) => goal.end);
  // The date of the hero: the main story, else the first known goal
  const [target] = goals;
  // Fractional: the main story ends exactly on the flag
  const axisDays = target.days / FINISH_AT;
  const end = target.end!;
  return {
    target,
    goals: goals.map((goal) => ({
      ...goal,
      // Bar length on the ruler, past 100 when the goal runs past it
      length: (goal.days / axisDays) * 100,
    })),
    // "3 DÉC.", and the year apart when it is not this one
    date: formatDay(end, end, `short`).toUpperCase(),
    year:
      end.getUTCFullYear() === from.getUTCFullYear()
        ? null
        : end.getUTCFullYear(),
    dateLong: formatDay(end, from),
    pace: formatPace(target.days),
    hoursPerDay: perWeek / 7,
    ticks: calendarTicks(from, axisDays),
    today: formatDay(from, from, `short`),
  };
}

export type HeroView = ReturnType<typeof heroView>;

// 3 → "25 min par jour", 7 → "1 h par jour", 15 → "2 h 10 par jour"
export function paceHint(perWeek: number) {
  const minutes = Math.round((perWeek * 60) / 7 / 5) * 5;
  const hours = Math.floor(minutes / 60);
  const rest = String(minutes % 60).padStart(2, `0`);
  if (!hours) return `${minutes} min par jour`;
  return rest === `00` ? `${hours} h par jour` : `${hours} h ${rest} par jour`;
}
