// Search index shared by every combobox on the site (hero of the home,
// header dialog on the other pages): fetched once on the first focus
// (src/pages/recherche.json.ts), then searched entirely client side
export type Entry = [
  name: string,
  main: number,
  plus: number,
  full: number,
  slug?: string,
];

const MAX_RESULTS = 8;

// "Pokémon: Épée" → "pokemon epee"
export const normalize = (text: string) =>
  text
    .normalize(`NFD`)
    .replace(/[̀-ͯ]/g, ``)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ` `)
    .trim();

let index: Promise<{ entry: Entry; name: string }[]> | undefined;
let ready = false;
export const isIndexReady = () => ready;
export const loadIndex = () =>
  (index ??= fetch(`/recherche.json`)
    .then((response) => response.json() as Promise<Entry[]>)
    .then((entries) => {
      ready = true;
      return entries.map((entry) => ({
        entry,
        name: ` ${normalize(entry[0])}`,
      }));
    })
    .catch(() => {
      // Retried on the next search
      index = undefined;
      return [];
    }));

// Name start first, then word start, then anywhere: the index is sorted by
// popularity, so each group stays in that order
export async function search(query: string) {
  const needle = normalize(query);
  if (!needle) return [];
  const groups: Entry[][] = [[], [], []];
  for (const { entry, name } of await loadIndex()) {
    const at = name.indexOf(` ${needle}`);
    const group = at === 0 ? 0 : at > 0 ? 1 : name.includes(needle) ? 2 : -1;
    if (group >= 0 && groups[group].length < MAX_RESULTS)
      groups[group].push(entry);
    if (groups[0].length >= MAX_RESULTS) break;
  }
  return groups.flat().slice(0, MAX_RESULTS);
}
