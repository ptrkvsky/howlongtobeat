import type { GameLinks } from '@/types/Game';

// F6: only confirmed ids get a link. Shared by the page and its JSON-LD
export const externalLinks = (links: GameLinks) =>
  [
    links.steamAppId && {
      label: `Page Steam`,
      href: `https://store.steampowered.com/app/${links.steamAppId}/`,
    },
    links.igdbSlug && {
      label: `Fiche IGDB`,
      href: `https://www.igdb.com/games/${links.igdbSlug}`,
    },
  ].filter(Boolean) as { label: string; href: string }[];
