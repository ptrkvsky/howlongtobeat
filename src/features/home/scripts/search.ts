// Search of the home: the game field of the hero, as an ARIA combobox. The
// index (src/pages/recherche.json.ts) is fetched on the first focus; picking
// a game sends it to scripts/home.ts, which redraws the hero
import { slugify } from '../../../utils/slugify';
import type { HeroGame } from '../hero';

type Entry = [
  name: string,
  main: number,
  plus: number,
  full: number,
  slug?: string,
];

const MAX_RESULTS = 8;
const input = document.querySelector<HTMLInputElement>(`[data-search-input]`)!;
const list = document.querySelector<HTMLUListElement>(`[data-search-results]`)!;

// "Pokémon: Épée" → "pokemon epee"
const normalize = (text: string) =>
  text
    .normalize(`NFD`)
    .replace(/[̀-ͯ]/g, ``)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ` `)
    .trim();

let index: Promise<{ entry: Entry; name: string }[]> | undefined;
let ready = false;
const loadIndex = () =>
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
async function search(query: string) {
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

let results: Entry[] = [];
let active = -1;
let current = input.value;

const open = (isOpen: boolean) => {
  list.hidden = !isOpen;
  input.setAttribute(`aria-expanded`, String(isOpen));
  if (!isOpen) {
    active = -1;
    input.removeAttribute(`aria-activedescendant`);
  }
};

function setActive(position: number) {
  active = position;
  for (const [index, option] of [...list.children].entries())
    option.setAttribute(`aria-selected`, String(index === active));
  const option = list.children[active] as HTMLElement | undefined;
  if (option) {
    input.setAttribute(`aria-activedescendant`, option.id);
    option.scrollIntoView({ block: `nearest` });
  } else input.removeAttribute(`aria-activedescendant`);
}

function render(message?: string) {
  if (message) {
    const empty = document.createElement(`li`);
    empty.dataset.empty = ``;
    empty.textContent = message;
    list.replaceChildren(empty);
    open(true);
    return;
  }
  list.replaceChildren(
    ...results.map(([name, main, plus, full], position) => {
      const option = document.createElement(`li`);
      option.id = `hero-option-${position}`;
      option.setAttribute(`role`, `option`);
      option.setAttribute(`aria-selected`, `false`);
      const label = document.createElement(`span`);
      label.textContent = name;
      const hours = document.createElement(`span`);
      hours.textContent = `${main || plus || full} h`;
      option.append(label, hours);
      return option;
    }),
  );
  open(true);
}

function pick(entry: Entry) {
  const [name, main, plus, full, slug = slugify(name)] = entry;
  current = name;
  input.value = name;
  open(false);
  document.dispatchEvent(
    new CustomEvent<HeroGame>(`home:game`, {
      detail: { name, slug, main, plus, full },
    }),
  );
}

let request = 0;
input.addEventListener(`input`, async () => {
  const query = input.value;
  if (normalize(query).length < 2) {
    open(false);
    return;
  }
  const id = ++request;
  if (!ready) render(`Chargement des jeux…`);
  const found = await search(query);
  if (id !== request) return;
  results = found;
  if (results.length) {
    render();
    setActive(0);
  } else render(`Aucun jeu trouvé`);
});

input.addEventListener(`keydown`, (event) => {
  const count = results.length;
  if (event.key === `ArrowDown` && !list.hidden && count) {
    event.preventDefault();
    setActive((active + 1) % count);
  } else if (event.key === `ArrowUp` && !list.hidden && count) {
    event.preventDefault();
    setActive((active - 1 + count) % count);
  } else if (event.key === `Enter`) {
    event.preventDefault();
    if (!list.hidden && results[active]) pick(results[active]);
  } else if (event.key === `Escape` && !list.hidden) {
    event.preventDefault();
    open(false);
    input.value = current;
  }
});

// Mouse down, not click: the field keeps the focus
list.addEventListener(`mousedown`, (event) => {
  const option = (event.target as HTMLElement).closest(`[role="option"]`);
  if (!option) return;
  event.preventDefault();
  pick(results[[...list.children].indexOf(option)]);
});

input.addEventListener(`focus`, () => {
  loadIndex();
  input.select();
});
input.addEventListener(`blur`, () => {
  open(false);
  if (!input.value.trim()) input.value = current;
});
input.form?.addEventListener(`submit`, (event) => event.preventDefault());

// Header button, "/" key and the last call to action: back to the field
function focusSearch() {
  document.querySelector(`[data-hero]`)?.scrollIntoView({
    behavior: matchMedia(`(prefers-reduced-motion: reduce)`).matches
      ? `auto`
      : `smooth`,
  });
  input.focus({ preventScroll: true });
}

for (const trigger of document.querySelectorAll(`[data-search-open]`))
  trigger.addEventListener(`click`, (event) => {
    event.preventDefault();
    focusSearch();
  });

document.addEventListener(`keydown`, (event) => {
  const target = event.target as HTMLElement;
  if (
    event.key !== `/` ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    target.isContentEditable ||
    target.closest(`input, textarea, select`)
  )
    return;
  event.preventDefault();
  focusSearch();
});
