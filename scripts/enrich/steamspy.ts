/**
 * Steam user tags with their votes, from SteamSpy (no key, 1 request / s).
 * The store only shows the tags, SteamSpy gives how many players voted for
 * each: "Colony Sim" voted 4108 times weighs more than "Western" 1181 times.
 */
import { fetchJson } from './http';

export interface SteamTag {
  name: string;
  votes: number;
}

// null: unknown to SteamSpy. An empty list: known, but without tags
export async function getSteamTags(appId: number): Promise<SteamTag[] | null> {
  const data = await fetchJson<{
    appid?: number;
    name?: string | null;
    // An empty array when the game has no tags
    tags?: Record<string, number> | [];
  }>(
    `https://steamspy.com/api.php?${new URLSearchParams({
      request: `appdetails`,
      appid: String(appId),
    })}`,
  );
  if (!data.appid || !data.name) return null;
  return Object.entries(data.tags ?? {})
    .map(([name, votes]) => ({ name, votes: Number(votes) }))
    .filter((tag) => tag.votes > 0)
    .sort((a, b) => b.votes - a.votes);
}
