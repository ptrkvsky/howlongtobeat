// Dates of the /actus pages, in Paris time
export const formatDate = new Intl.DateTimeFormat(`fr-FR`, {
  dateStyle: `long`,
  timeStyle: `short`,
  timeZone: `Europe/Paris`,
});

const formatDay = new Intl.DateTimeFormat(`fr-FR`, {
  dateStyle: `long`,
  timeZone: `Europe/Paris`,
});
const formatTime = new Intl.DateTimeFormat(`fr-FR`, {
  timeStyle: `short`,
  timeZone: `Europe/Paris`,
});

// "19 octobre 2026 à 21:35"
export const formatDayAndTime = (date: Date) =>
  `${formatDay.format(date)} à ${formatTime.format(date)}`;

// "23 octobre", for the day headings of the flow
const formatDayShort = new Intl.DateTimeFormat(`fr-FR`, {
  day: `numeric`,
  month: `long`,
  timeZone: `Europe/Paris`,
});
const formatWeekday = new Intl.DateTimeFormat(`fr-FR`, {
  weekday: `long`,
  timeZone: `Europe/Paris`,
});

export const dayHeading = (date: Date) => ({
  day: formatDayShort.format(date),
  weekday: formatWeekday.format(date),
});

// "09:01"
export const formatClock = (date: Date) => formatTime.format(date);
