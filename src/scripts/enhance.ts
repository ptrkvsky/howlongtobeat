// Client side script of every page (the game pages add Pace.astro's)

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
