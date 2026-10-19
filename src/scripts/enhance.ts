// Client side script of every page (the game pages add Pace.astro's)

// Cloaked links: rendered as a span, turned into a link while hovered
// (keeps them out of the crawled HTML, like the previous CloakLink component)
for (const span of document.querySelectorAll<HTMLElement>(
  `[data-cloak-href]`,
)) {
  const link = document.createElement(`a`);
  link.href = span.dataset.cloakHref ?? ``;

  span.addEventListener(`mouseenter`, () => {
    link.replaceChildren(...span.childNodes);
    span.append(link);
  });
  span.addEventListener(`mouseleave`, () => {
    span.replaceChildren(...link.childNodes);
  });
}

// Basic anti-scraping: the HTML holds a decoy address
const email = [`johan`, `developpeur-web.tech`].join(`@`);
for (const element of document.querySelectorAll(`[data-email]`)) {
  element.textContent = email;
}

console.info(
  `%c%s`,
  [
    `color: white`,
    `background: #1a1a1a`,
    `font-size: 64px`,
    `font-family: white`,
    `padding: 6px 8px`,
  ].join(`;`),
  `GAME-OVER.IO`,
);
