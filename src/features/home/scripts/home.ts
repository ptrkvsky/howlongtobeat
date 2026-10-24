// Client side of the home: redraws the dates with the visitor's day, the
// pace (shared with the game pages' calculator) and the game picked in the
// search (scripts/search.ts sends it as a `home:game` event)
import { DEFAULT_PACE, PACES } from '../../jeu/components/Pace/pace';
import {
  addDays,
  civilDate,
  daysBetween,
  formatDay,
  today,
} from '../finishDate';
import { type HeroGame, heroView, paceHint } from '../hero';
import './search';

// Same storage as src/features/jeu/components/Pace/paceClient.ts
const STORAGE_KEY = `pace`;
const load = (): { goal?: string; perWeek?: number } => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? `{}`);
  } catch {
    return {};
  }
};
const save = (perWeek: number) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...load(), perWeek }));
  } catch {
    // Storage blocked: the pace is only lost on the next page
  }
};

const isoDate = (value: string) => {
  const [year, month, day] = value.split(`-`).map(Number);
  return civilDate(year, month, day);
};
const reducedMotion = matchMedia(`(prefers-reduced-motion: reduce)`);
const day = today();
const saved = Number(load().perWeek);
let perWeek = PACES.includes(saved) ? saved : DEFAULT_PACE;

const hero = document.querySelector<HTMLElement>(`[data-hero]`)!;
let game: HeroGame = JSON.parse(hero.dataset.game!);
const $ = <T extends HTMLElement = HTMLElement>(selector: string) =>
  document.querySelector<T>(selector);
const setText = (selector: string, text: string | number) => {
  const element = $(selector);
  if (element) element.textContent = String(text);
};
const element = (tag: string, attributes: Record<string, string> = {}) => {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes))
    node.setAttribute(name, value);
  return node;
};

function drawHero() {
  const view = heroView(game, perWeek, day);
  const [dayNumber, ...month] = view.date.split(` `);
  setText(`[data-hero-date] > :first-child`, dayNumber);
  setText(`[data-hero-date] > :last-child`, month.join(` `));
  const year = $(`[data-hero-year]`)!;
  year.hidden = !view.year;
  year.textContent = String(view.year ?? ``);
  setText(`[data-hero-date-long]`, view.dateLong);
  setText(`[data-hero-today]`, view.today);

  $(`[data-hero-ticks]`)!.replaceChildren(
    ...view.ticks.map((tick) => {
      const li = element(`li`, { style: `--at: ${tick.at}%` });
      li.textContent = tick.label ?? ``;
      return li;
    }),
  );
  $(`[data-hero-bars]`)!.replaceChildren(
    ...view.goals.map((goal) =>
      element(`span`, {
        'data-goal': goal.key,
        style: `width: ${Math.min(100, goal.length)}%`,
        ...(goal.length > 100 ? { 'data-over': `` } : {}),
      }),
    ),
  );
  $(`[data-hero-legend]`)!.replaceChildren(
    ...view.goals.map((goal) => {
      const item = element(`div`);
      const term = element(`dt`);
      term.append(element(`span`, { 'data-goal': goal.key }), goal.label);
      const value = element(`dd`);
      const arrow = element(`span`);
      arrow.textContent = `→`;
      value.append(`${goal.hours} h `, arrow, ` ${goal.endLabel}`);
      item.append(term, value);
      return item;
    }),
  );

  const link = $<HTMLAnchorElement>(`[data-hero-link]`)!;
  link.href = `/jeu/${game.slug}`;
  setText(`[data-hero-name]`, game.name);
  const weeks = view.pace.replace(`environ `, ``);
  setText(
    `[data-hero-pace-note]`,
    `Environ ${weeks} de jeu, à ${paceHint(perWeek)}.`,
  );

  // "Des heures à une date"
  setText(`[data-step-hours]`, view.target.hours);
  setText(`[data-step-goal]`, view.target.goal);
  setText(`[data-step-name]`, game.name);
  setText(`[data-step-pace]`, weeks.toUpperCase());
  setText(`[data-step-per-week]`, perWeek);
  setText(`[data-step-hint]`, paceHint(perWeek));
  setText(`[data-step-date]`, view.dateLong.toUpperCase());

  return view;
}

// The flag is planted again on each new date
function plant() {
  if (reducedMotion.matches) return;
  hero.removeAttribute(`data-planted`);
  void hero.offsetWidth;
  hero.setAttribute(`data-planted`, ``);
}

function update(announce: boolean) {
  const draw = () => {
    const view = drawHero();
    if (announce)
      setText(
        `[data-hero-live]`,
        `${game.name} : à ${perWeek} h par semaine, Game Over vers le ${view.dateLong}.`,
      );
  };
  if (announce && document.startViewTransition && !reducedMotion.matches)
    document.startViewTransition(draw);
  else draw();
  if (announce) plant();
}

// "Avant Noël": one list per pace, dates from the visitor's day
const finishable = $(`[data-finishable]`);
function drawFinishable() {
  if (!finishable) return;
  const milestoneDays = daysBetween(
    day,
    isoDate(finishable.dataset.milestone!),
  );
  setText(`[data-milestone-days]`, milestoneDays);
  setText(`[data-pace-label]`, perWeek);
  for (const list of finishable.querySelectorAll<HTMLElement>(
    `[data-finishable-list]`,
  ))
    list.hidden = Number(list.dataset.finishableList) !== perWeek;
  for (const bar of finishable.querySelectorAll<HTMLElement>(`[data-days]`))
    bar.style.width = `${Math.min(100, (Number(bar.dataset.days) / milestoneDays) * 100)}%`;
  for (const radio of finishable.querySelectorAll<HTMLInputElement>(
    `[data-pace-radio]`,
  ))
    radio.checked = Number(radio.value) === perWeek;
}

// Dates written at build time as "N days from today"
for (const date of document.querySelectorAll<HTMLElement>(
  `[data-finish-days]`,
)) {
  const text = formatDay(
    addDays(day, Number(date.dataset.finishDays)),
    day,
    `short`,
  );
  date.textContent = `finishUpper` in date.dataset ? text.toUpperCase() : text;
}

function setPace(value: number, announce = true) {
  perWeek = value;
  save(perWeek);
  const select = $<HTMLSelectElement>(`[data-pace-select]`)!;
  select.value = String(perWeek);
  update(announce);
  drawFinishable();
}

$<HTMLSelectElement>(`[data-pace-select]`)!.addEventListener(
  `change`,
  (event) => setPace(Number((event.target as HTMLSelectElement).value)),
);
finishable?.addEventListener(`change`, (event) => {
  const radio = event.target as HTMLInputElement;
  if (radio.matches(`[data-pace-radio]`)) setPace(Number(radio.value));
});
document.addEventListener(`home:game`, (event) => {
  game = (event as CustomEvent<HeroGame>).detail;
  update(true);
});

setPace(perWeek, false);
