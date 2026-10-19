/**
 * IGDB images: game.cover holds the image id, the URL is built with the size
 * each use needs (https://api-docs.igdb.com/#images).
 */
export type IgdbImageSize =
  // 264 × 374, and 528 × 748 for high density screens
  `cover_big` | `cover_big_2x` | `720p` | `1080p`;

export const igdbImage = (imageId: string, size: IgdbImageSize) =>
  `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;

// "//images.igdb.com/igdb/image/upload/t_thumb/co1lat.jpg" → "co1lat";
// null for anything else (2,000 imported games had "test" as cover)
export function imageIdFromUrl(url: string | null) {
  return (
    url?.match(
      /images\.igdb\.com\/igdb\/image\/upload\/t_[a-z0-9_]+\/([a-z0-9]+)\.[a-z]+$/i,
    )?.[1] ?? null
  );
}
