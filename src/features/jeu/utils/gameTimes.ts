import type { Game } from '@/types/Game';
import { formatList } from '@/utils/format';

// The three HLTB times of a game, shared by the time cards, the verdict and
// the pace calculator. A time at 0 is unknown: it is left out
export type GameTimeKey = 'main' | 'plus' | 'full';

export interface GameTime {
  key: GameTimeKey;
  label: string;
  // "Pour terminer X, comptez 3 heures pour <goal>"
  goal: string;
  hours: number;
  // HLTB submissions behind the time, null when unknown
  count: number | null;
}

// True when the shown time is the current HLTB one: false for the legacy
// times (2021) that HLTB has revised since, and for the overridden times
export const isCurrentHltbTime = (game: Game, key: GameTimeKey) => {
  const hours = {
    main: game.timeMainStory,
    plus: game.timeMainExtras,
    full: game.timeCompletionists,
  }[key];
  return hours > 0 && game.hltb?.times[key].hours === hours;
};

export function getGameTimes(game: Game): GameTime[] {
  const time = (
    key: GameTimeKey,
    label: string,
    goal: string,
    hours: number,
  ): GameTime => ({
    key,
    label,
    goal,
    hours,
    count: isCurrentHltbTime(game, key) ? game.hltb!.times[key].count : null,
  });
  return [
    time(
      `main`,
      `Histoire principale`,
      `l'histoire principale`,
      game.timeMainStory,
    ),
    time(
      `plus`,
      `Histoire + extras`,
      `l'histoire et quelques extras`,
      game.timeMainExtras,
    ),
    time(`full`, `100 %`, `le 100 %`, game.timeCompletionists),
  ].filter(({ hours }) => hours > 0);
}

const plural = (value: number) => (value > 1 ? `heures` : `heure`);

// "3 heures pour l'histoire principale, 5 heures pour… et 9 heures pour…"
export const timesSummary = (times: GameTime[]) =>
  formatList(
    times.map(
      (time) => `${time.hours} ${plural(time.hours)} pour ${time.goal}`,
    ),
  );
