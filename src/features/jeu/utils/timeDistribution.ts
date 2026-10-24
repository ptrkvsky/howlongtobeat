// Main story times of the catalog as a histogram, to show where a game
// sits. Bins double in length (1 h, 2 h, 4 h…): game times spread from one
// hour to hundreds, a linear scale would put almost all of them in one bar

export interface TimeBin {
  // Hours, from excluded (0 for the first) to included
  from: number;
  to: number;
  count: number;
}

export const BIN_EDGES = [1, 2, 4, 8, 16, 32, 64, 128, 256, Infinity];

// Bin of a time, -1 for an unknown one
export const binIndex = (hours: number) =>
  hours > 0 ? BIN_EDGES.findIndex((edge) => hours <= edge) : -1;

export function timeBins(times: number[]): TimeBin[] {
  const bins = BIN_EDGES.map((to, index) => ({
    from: index ? BIN_EDGES[index - 1] : 0,
    to,
    count: 0,
  }));
  for (const time of times) {
    if (time > 0) bins[binIndex(time)].count += 1;
  }
  return bins;
}

// "1 à 2 h", "plus de 256 h"
export const binLabel = ({ from, to }: TimeBin) =>
  to === Infinity
    ? `plus de ${from} h`
    : from === 0
      ? `1 h ou moins`
      : `${from} à ${to} h`;
