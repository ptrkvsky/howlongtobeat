// Filter of the genre index: hides the lines whose name does not contain the
// query. Without this script the field stays hidden and the list complete
const root = document.querySelector<HTMLElement>(`[data-genre-filter]`);
if (root) {
  const field = root.querySelector<HTMLElement>(`[data-filter-field]`)!;
  const input = root.querySelector<HTMLInputElement>(`[data-filter-input]`)!;
  const status = root.querySelector<HTMLElement>(`[data-filter-status]`)!;
  const empty = root.querySelector<HTMLElement>(`[data-filter-empty]`)!;
  const reset = root.querySelector<HTMLElement>(`[data-filter-reset]`)!;
  const items = [
    ...root.querySelectorAll<HTMLElement>(`[data-filter-list] > li`),
  ];
  const total = items.length;

  // "Stratégie" → "strategie"
  const normalize = (text: string) =>
    text.normalize(`NFD`).replace(/[̀-ͯ]/g, ``).toLowerCase().trim();

  const apply = () => {
    const needle = normalize(input.value);
    let shown = 0;
    for (const item of items) {
      const match = !needle || item.dataset.name!.includes(needle);
      item.hidden = !match;
      if (match) shown += 1;
    }
    empty.hidden = shown > 0;
    status.textContent = needle
      ? `${shown} genre${shown > 1 ? `s` : ``} sur ${total}`
      : ``;
  };

  field.hidden = false;
  input.addEventListener(`input`, apply);
  reset.addEventListener(`click`, () => {
    input.value = ``;
    apply();
    input.focus();
  });
}
