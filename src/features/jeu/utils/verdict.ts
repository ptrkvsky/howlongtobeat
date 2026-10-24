import type { Game } from '@/types/Game';

// "Will I finish it?": how long the game is, whether Steam players see the
// end, and how it compares (catalog rank, films). Shown in the hero and in
// the evidence of a game page

// Main story length, in hours
const LENGTHS = [
  { max: 10, label: `Vite terminé` },
  { max: 30, label: `Durée raisonnable` },
  { max: 60, label: `Gros morceau` },
  { max: Infinity, label: `Marathon` },
];
// Steam completion rate, in percent
const FEW_FINISH = 25;
const MOST_FINISH = 50;
export const FILM_HOURS = 2;
// Fewer films is not worth saying
const MIN_FILMS = 3;

type VerdictGame = Pick<Game, 'timeMainStory' | 'completion' | 'timeRank'>;

// null without a main story time
export const lengthLabel = (main: number) =>
  main > 0 ? LENGTHS.find((step) => main <= step.max)!.label : null;

export function completionOutcome(percent: number | null | undefined) {
  if (percent == null) return null;
  if (percent < FEW_FINISH) return `peu de joueurs voient la fin`;
  if (percent >= MOST_FINISH) return `la plupart des joueurs le terminent`;
  return null;
}

// Said from the side most games are on, nothing in the middle
export function rankFigure(rank: Game['timeRank']) {
  if (!rank) return null;
  if (rank.longerThan >= 50)
    return { words: `Plus long que`, percent: rank.longerThan };
  if (rank.shorterThan >= 50)
    return { words: `Plus court que`, percent: rank.shorterThan };
  return null;
}

export function rankLabel(rank: Game['timeRank']) {
  const figure = rankFigure(rank);
  return figure && `${figure.words} ${figure.percent} % des jeux du catalogue`;
}

// Films of FILM_HOURS for the main story, null when too few
export function films(main: number) {
  const count = Math.round(main / FILM_HOURS);
  return count >= MIN_FILMS ? count : null;
}

export function verdict(game: VerdictGame) {
  return {
    length: lengthLabel(game.timeMainStory),
    outcome: completionOutcome(game.completion?.percent),
    rank: rankLabel(game.timeRank),
    films: films(game.timeMainStory),
  };
}
