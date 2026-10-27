// ARIA combobox wired to the search index: used by the hero of the home
// (src/features/home/scripts/search.ts) and the header dialog of the other
// pages (headerSearch.ts). `idPrefix` names the option ids and must be
// unique on the page.
import { isIndexReady, loadIndex, normalize, search } from './searchIndex';
import type { Entry } from './searchIndex';

interface ComboboxOptions {
  input: HTMLInputElement;
  list: HTMLUListElement;
  idPrefix: string;
  onPick: (entry: Entry) => void;
}

export function createCombobox({
  input,
  list,
  idPrefix,
  onPick,
}: ComboboxOptions) {
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
        option.id = `${idPrefix}-option-${position}`;
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
    const [name] = entry;
    current = name;
    input.value = name;
    open(false);
    onPick(entry);
  }

  let request = 0;
  input.addEventListener(`input`, async () => {
    const query = input.value;
    if (normalize(query).length < 2) {
      open(false);
      return;
    }
    const id = ++request;
    if (!isIndexReady()) render(`Chargement des jeux…`);
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

  return {
    focus: () => input.focus({ preventScroll: true }),
  };
}
