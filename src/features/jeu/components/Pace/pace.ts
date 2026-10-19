// Pace calculator: how long a game takes at a given number of hours per
// week. Shared by the server render (Pace.astro) and its client script

export const PACES = [3, 7, 15, 30];
export const DEFAULT_PACE = 7;

// Days of play at `perWeek` hours a week, at least one
export const paceDays = (hours: number, perWeek: number) =>
  Math.max(1, Math.ceil((hours / perWeek) * 7));

// "environ 3 jours", "environ 7 semaines", "environ 5 mois"
export function formatPace(days: number) {
  const plural = (count: number, word: string) =>
    `environ ${count} ${word}${count > 1 && !word.endsWith(`s`) ? `s` : ``}`;
  if (days < 7) return plural(days, `jour`);
  const weeks = Math.round(days / 7);
  if (weeks <= 8) return plural(weeks, `semaine`);
  return plural(Math.round(days / 30.4), `mois`);
}
