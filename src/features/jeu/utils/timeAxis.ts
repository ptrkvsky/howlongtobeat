// Hour axis of the times of a game page: a round end at or just past the
// longest time, and ticks at a round step (1, 2 or 5 × 10ⁿ hours)

const STEPS = [1, 2, 5];
// Intervals between ticks, at most
const MAX_INTERVALS = 8;
// Short games keep an axis of a few hours: a 1 h game does not fill it,
// which is the point
const MIN_MAX = 5;

export function timeAxis(longest: number) {
  if (!(longest > 0)) return { max: 0, step: 0, ticks: [] as number[] };
  const end = Math.max(longest, MIN_MAX);
  let step = 1;
  for (let power = 1; ; power *= 10) {
    const fit = STEPS.find((base) => end / (base * power) <= MAX_INTERVALS);
    if (fit) {
      step = fit * power;
      break;
    }
  }
  const max = Math.ceil(end / step) * step;
  const ticks = Array.from({ length: max / step + 1 }, (_, i) => i * step);
  return { max, step, ticks };
}
