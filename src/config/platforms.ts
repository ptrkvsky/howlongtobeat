/**
 * Closed list of the platforms shown on a game page (F1): IGDB platform slug
 * → label, in display order. Platforms missing here are not shown, and
 * scripts/sync.ts logs them.
 */
export const PLATFORMS: [slug: string, label: string][] = [
  [`win`, `PC`],
  [`mac`, `Mac`],
  [`linux`, `Linux`],
  [`ps5`, `PlayStation 5`],
  [`ps4--1`, `PlayStation 4`],
  [`ps3`, `PlayStation 3`],
  [`ps2`, `PlayStation 2`],
  [`ps`, `PlayStation`],
  [`psvita`, `PS Vita`],
  [`psp`, `PSP`],
  [`series-x-s`, `Xbox Series X|S`],
  [`xboxone`, `Xbox One`],
  [`xbox360`, `Xbox 360`],
  [`xbox`, `Xbox`],
  [`switch-2`, `Switch 2`],
  [`switch`, `Switch`],
  [`wiiu`, `Wii U`],
  [`wii`, `Wii`],
  [`ngc`, `GameCube`],
  [`n64`, `Nintendo 64`],
  [`snes`, `Super Nintendo`],
  [`nes`, `NES`],
  [`3ds`, `Nintendo 3DS`],
  [`nds`, `Nintendo DS`],
  [`gba`, `Game Boy Advance`],
  [`gbc`, `Game Boy Color`],
  [`gb`, `Game Boy`],
  [`genesis-slash-megadrive`, `Mega Drive`],
  [`saturn`, `Saturn`],
  [`dc`, `Dreamcast`],
  [`sms`, `Master System`],
  [`ios`, `iOS`],
  [`android`, `Android`],
];

const labels = new Map(PLATFORMS);
const order = new Map(PLATFORMS.map(([slug], index) => [slug, index]));

// Known platforms in display order, and the unknown slugs
export function platformLabels(slugs: string[]) {
  const known = slugs
    .filter((slug) => labels.has(slug))
    .sort((a, b) => order.get(a)! - order.get(b)!);
  return {
    labels: [...new Set(known.map((slug) => labels.get(slug)!))],
    unknown: slugs.filter((slug) => !labels.has(slug)),
  };
}
