// Search of the home: the game field of the hero, as an ARIA combobox
// (src/features/search/combobox.ts). Picking a game sends it to scripts/home.ts,
// which redraws the hero
import { createCombobox } from '@/features/search/combobox';
import type { Entry } from '@/features/search/searchIndex';
import { slugify } from '../../../utils/slugify';
import type { HeroGame } from '../hero';

const input = document.querySelector<HTMLInputElement>(`[data-search-input]`)!;
const list = document.querySelector<HTMLUListElement>(`[data-search-results]`)!;

function pick(entry: Entry) {
  const [name, main, plus, full, slug = slugify(name)] = entry;
  document.dispatchEvent(
    new CustomEvent<HeroGame>(`home:game`, {
      detail: { name, slug, main, plus, full },
    }),
  );
}

const combobox = createCombobox({
  input,
  list,
  idPrefix: `hero`,
  onPick: pick,
});

// Header button, "/" key and the last call to action: back to the field
function focusSearch() {
  document.querySelector(`[data-hero]`)?.scrollIntoView({
    behavior: matchMedia(`(prefers-reduced-motion: reduce)`).matches
      ? `auto`
      : `smooth`,
  });
  combobox.focus();
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
