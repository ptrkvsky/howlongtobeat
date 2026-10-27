// Header search dialog, for every page but the home (there, the hero field
// already is the combobox, wired by ../home/scripts/search.ts). No-ops when
// the dialog isn't on the page, so this script can be loaded unconditionally
// by the header without checking the route
import { slugify } from '@/utils/slugify';
import { createCombobox } from './combobox';
import type { Entry } from './searchIndex';

const dialog =
  document.querySelector<HTMLDialogElement>(`[data-search-dialog]`);
const input = dialog?.querySelector<HTMLInputElement>(`[data-search-input]`);
const list = dialog?.querySelector<HTMLUListElement>(`[data-search-results]`);

if (dialog && input && list) {
  function pick([name, , , , slug = slugify(name)]: Entry) {
    location.assign(`/jeu/${slug}`);
  }

  const combobox = createCombobox({
    input,
    list,
    idPrefix: `header`,
    onPick: pick,
  });

  // A function declaration is hoisted, so TS won't carry the `if` guard's
  // narrowing into it
  const openDialog = () => {
    dialog.showModal();
    combobox.focus();
  };

  for (const trigger of document.querySelectorAll(`[data-search-open]`))
    trigger.addEventListener(`click`, (event) => {
      event.preventDefault();
      openDialog();
    });

  dialog
    .querySelector(`[data-search-close]`)
    ?.addEventListener(`click`, () => dialog.close());

  // Closing on a click outside the dialog's own box (::backdrop isn't a
  // real click target)
  dialog.addEventListener(`click`, (event) => {
    if (event.target === dialog) dialog.close();
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
    openDialog();
  });
}
