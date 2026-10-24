// Client side of Pace.astro: redraws the end date from the visitor's day on
// every change, with the dates and rules of the home (finishDate.ts, hero.ts)
import { today } from '../../../home/finishDate';
import {
  type GoalKey,
  type HeroGame,
  heroView,
  paceHint,
} from '../../../home/hero';
import { DEFAULT_PACE, PACES } from './pace';

// Last choice, kept from one game to the next and shared with the home
// (src/features/home/scripts/home.ts)
const STORAGE_KEY = `pace`;
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? `{}`) as {
      goal?: string;
      perWeek?: number;
    };
  } catch {
    return {};
  }
};
const save = (value: { goal: string; perWeek: number }) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage blocked: the choice is only lost on the next page
  }
};

const reducedMotion = matchMedia(`(prefers-reduced-motion: reduce)`);
const day = today();

const element = (tag: string, attributes: Record<string, string> = {}) => {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes))
    node.setAttribute(name, value);
  return node;
};
const strong = (text: string) => {
  const node = element(`strong`);
  node.textContent = text;
  return node;
};

for (const section of document.querySelectorAll<HTMLElement>(`[data-pace]`)) {
  const game: HeroGame = JSON.parse(section.dataset.game!);
  const goals: Record<string, string> = JSON.parse(section.dataset.goals!);
  const [firstGoal] = Object.keys(goals);
  const form = section.querySelector(`form`)!;
  const $ = (selector: string) => section.querySelector<HTMLElement>(selector)!;

  const checked = (name: string) =>
    form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)
      ?.value;
  const check = (name: string, value: string) => {
    const input = form.querySelector<HTMLInputElement>(
      `input[name="${name}"][value="${value}"]`,
    );
    if (input) input.checked = true;
  };

  const draw = () => {
    const goal = (checked(`goal`) ?? firstGoal) as GoalKey;
    const perWeek = Number(checked(`perWeek`) ?? DEFAULT_PACE);
    const view = heroView(game, perWeek, day, goal);
    const [dayNumber, ...month] = view.date.split(` `);

    const date = $(`[data-pace-date]`);
    date.firstElementChild!.textContent = dayNumber;
    date.lastElementChild!.textContent = month.join(` `);
    const year = $(`[data-pace-year]`);
    year.hidden = !view.year;
    year.textContent = String(view.year ?? ``);
    $(`[data-pace-today]`).textContent = view.today;

    $(`[data-pace-ticks]`).replaceChildren(
      ...view.ticks.map((tick) => {
        const li = element(`li`, { style: `--at: ${tick.at}%` });
        li.textContent = tick.label ?? ``;
        return li;
      }),
    );
    $(`[data-pace-bars]`).replaceChildren(
      ...view.goals.map((item) =>
        element(`span`, {
          'data-goal': item.key,
          style: `width: ${Math.min(100, item.length)}%`,
          ...(item.length > 100 ? { 'data-over': `` } : {}),
        }),
      ),
    );
    $(`[data-pace-legend]`).replaceChildren(
      ...view.goals.map((item) => {
        const row = element(`div`);
        const term = element(`dt`);
        term.append(element(`span`, { 'data-goal': item.key }), item.label);
        const value = element(`dd`);
        const arrow = element(`span`);
        arrow.textContent = `→`;
        value.append(`${item.hours} h `, arrow, ` ${item.endLabel}`);
        row.append(term, value);
        return row;
      }),
    );
    $(`[data-pace-result]`).replaceChildren(
      `À ${perWeek} h par semaine (${paceHint(perWeek)}), comptez `,
      strong(view.pace),
      ` pour ${goals[view.target.key]}, soit une fin vers le `,
      strong(view.dateLong),
      `.`,
    );
    return { goal: view.target.key, perWeek };
  };

  // The flag is planted again on each new date
  const plant = () => {
    if (reducedMotion.matches) return;
    section.removeAttribute(`data-planted`);
    void section.offsetWidth;
    section.setAttribute(`data-planted`, ``);
  };

  const saved = load();
  if (saved.goal && saved.goal in goals) check(`goal`, saved.goal);
  if (saved.perWeek && PACES.includes(saved.perWeek))
    check(`perWeek`, String(saved.perWeek));
  draw();

  form.addEventListener(`change`, () => {
    if (document.startViewTransition && !reducedMotion.matches)
      document.startViewTransition(() => save(draw()));
    else save(draw());
    plant();
  });
}
