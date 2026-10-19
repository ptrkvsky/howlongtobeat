// Client side of Pace.astro: updates the result on every change and adds
// the end date
import { DEFAULT_PACE, formatPace, paceDays } from './pace';

// Last choice, kept from one game to the next
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

const dateFormat = new Intl.DateTimeFormat(`fr-FR`, {
  day: `numeric`,
  month: `long`,
});
const yearFormat = new Intl.DateTimeFormat(`fr-FR`, {
  day: `numeric`,
  month: `long`,
  year: `numeric`,
});

for (const section of document.querySelectorAll<HTMLElement>(`[data-pace]`)) {
  const hours: Record<string, number> = JSON.parse(section.dataset.hours!);
  const goals: Record<string, string> = JSON.parse(section.dataset.goals!);
  const form = section.querySelector(`form`)!;
  const result = section.querySelector<HTMLElement>(`[data-pace-result]`)!;
  const firstGoal = Object.keys(hours)[0];

  const checked = (name: string) =>
    form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)
      ?.value;
  const check = (name: string, value: string) => {
    const input = form.querySelector<HTMLInputElement>(
      `input[name="${name}"][value="${value}"]`,
    );
    if (input) input.checked = true;
  };

  const render = () => {
    const goal = checked(`goal`) ?? firstGoal;
    const perWeek = Number(checked(`perWeek`) ?? DEFAULT_PACE);
    const days = paceDays(hours[goal], perWeek);
    const end = new Date(Date.now() + days * 86_400_000);
    const format =
      end.getFullYear() === new Date().getFullYear() ? dateFormat : yearFormat;
    const strong = (text: string) => {
      const element = document.createElement(`strong`);
      element.textContent = text;
      return element;
    };
    result.replaceChildren(
      `À ${perWeek} h par semaine, comptez `,
      strong(formatPace(days)),
      ` pour ${goals[goal]}, soit une fin vers le `,
      strong(format.format(end)),
      `.`,
    );
    return { goal, perWeek };
  };

  const saved = load();
  if (saved.goal) check(`goal`, saved.goal);
  if (saved.perWeek) check(`perWeek`, String(saved.perWeek));
  render();
  form.addEventListener(`change`, () => save(render()));
}
