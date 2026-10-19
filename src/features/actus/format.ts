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
