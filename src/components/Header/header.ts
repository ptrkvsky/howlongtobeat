// Smart sticky header: compact and hidden states on scroll (CSS reads
// [data-state] on the header, header.module.css). Also drives the reading
// progress bar when the page has one (a sibling of the header, so it keeps
// showing once the header itself has hidden), in the same rAF tick to avoid
// layout thrashing. CSS keeps a header that has the focus visible regardless
// of [data-state]
const header = document.querySelector<HTMLElement>(`[data-header]`)!;
const progressBar = document.querySelector<HTMLElement>(`[data-progress-bar]`);

const TOP_THRESHOLD = 80;
const HIDE_THRESHOLD = 8;

let lastY = scrollY;
let ticking = false;

function update() {
  ticking = false;

  // A dialog is modal: the page behind it isn't meant to scroll, but a
  // search still open should never pull the header away with it
  if (!document.querySelector(`dialog[open]`)) {
    const y = scrollY;
    if (y < TOP_THRESHOLD) header.removeAttribute(`data-state`);
    else if (y > lastY + HIDE_THRESHOLD) header.dataset.state = `hidden`;
    else if (y < lastY - HIDE_THRESHOLD) header.dataset.state = `compact`;
    lastY = y;
  }

  if (progressBar) {
    const max = document.documentElement.scrollHeight - innerHeight;
    progressBar.style.setProperty(
      `--progress`,
      String(max > 0 ? scrollY / max : 0),
    );
  }
}

addEventListener(
  `scroll`,
  () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  },
  { passive: true },
);

if (progressBar) update();
