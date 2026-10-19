/**
 * Steam reviews and global achievement percentages (no key needed).
 * With STEAM_API_KEY, the achievement schema adds display names and
 * descriptions, which the "end of game" heuristic needs to be reliable.
 */
import { fetchJson, HttpError } from './http';

export interface SteamReviews {
  positive: number;
  total: number;
  percent: number;
  desc: string;
}

export interface Achievement {
  name: string;
  displayName?: string;
  description?: string;
  percent: number;
  // How the end of game achievement was picked
  rule?: `keyword` | `last-chapter`;
}

export interface SteamAchievements {
  count: number;
  max: number;
  median: number;
  // Achievement most likely unlocked when the main story is finished
  completion: Achievement | null;
  candidates: Achievement[];
  withSchema: boolean;
}

export async function getSteamReviews(
  appId: number,
): Promise<SteamReviews | null> {
  const { query_summary: summary } = await fetchJson<{
    query_summary: {
      total_positive: number;
      total_reviews: number;
      review_score_desc: string;
    };
  }>(
    `https://store.steampowered.com/appreviews/${appId}?json=1&language=all&purchase_type=all&num_per_page=0`,
  );
  if (!summary?.total_reviews) return null;
  return {
    positive: summary.total_positive,
    total: summary.total_reviews,
    percent: Math.round((summary.total_positive / summary.total_reviews) * 100),
    desc: summary.review_score_desc,
  };
}

const END_OF_GAME =
  /\b((finish|beat|complete)(ed|d)? (the )?(game|story|campaign|main story)|(story|campaign|game) complete(d)?|roll the credits|credits|the end|ending|final boss)\b/i;
// Harder variants or side content ("Finish the game on Hard", "GTA Online: …")
const HARDER =
  /\b(hard|harder|hardest|insane|nightmare|veteran|legendary|extreme|expert|without|never|under \d|one sitting|or (less|fewer)|speed ?run|100 ?%|all (endings|achievements|collectibles)|new game ?\+|ng\+|true ending|secret ending|perfect|online|multiplayer|co-?op|challenges?|coliseum)\b/i;
// "on any difficulty", "on 'Hurt Me Plenty', …, or 'Nightmare'": not harder
const ANY_DIFFICULTY = /\b(any|all) difficult(y|ies)\b|,? or ['"‘]/i;
// Episodic games: "Finish Episode 5: Polarized"
const CHAPTER =
  /\b(finish|beat|complete)(ed|d)? (the )?(episode|chapter|act|part) (\d+)\b/i;

// "ACH_FINISH_GAME" / "AchClearElysium" → "ach finish game" / "ach clear elysium"
const apiNameText = (name: string) =>
  name
    .replace(/([a-z])([A-Z])/g, `$1 $2`)
    .replace(/[_-]+/g, ` `)
    .toLowerCase();

const achievementText = (achievement: Achievement) =>
  [
    achievement.displayName,
    achievement.description,
    apiNameText(achievement.name),
  ]
    .filter(Boolean)
    .join(` · `);

const isHarder = (text: string) =>
  HARDER.test(text) && !ANY_DIFFICULTY.test(text);

function pickCompletion(achievements: Achievement[]) {
  let candidates: Achievement[] = achievements
    .filter((achievement) => {
      const text = achievementText(achievement);
      return END_OF_GAME.test(text) && !isHarder(text);
    })
    // The plain ending is the most unlocked of the matching achievements
    .sort((a, b) => b.percent - a.percent)
    .map((achievement) => ({ ...achievement, rule: `keyword` as const }));

  // Fallback for episodic games: the last of several numbered chapters
  if (!candidates.length) {
    const chapters = achievements
      .map((achievement) => {
        const text = achievementText(achievement);
        const number = Number(text.match(CHAPTER)?.[5]);
        return { achievement, number, harder: isHarder(text) };
      })
      .filter(({ number, harder }) => number > 0 && !harder)
      .sort((a, b) => b.number - a.number);
    if (chapters.length >= 2) {
      candidates = chapters.map(({ achievement }) => ({
        ...achievement,
        rule: `last-chapter` as const,
      }));
    }
  }

  return {
    completion: candidates[0] ?? null,
    candidates: candidates.slice(0, 3),
  };
}

async function getSchema(appId: number) {
  const key = process.env.STEAM_API_KEY;
  if (!key) return undefined;
  const { game } = await fetchJson<{
    game?: {
      availableGameStats?: {
        achievements?: {
          name: string;
          displayName?: string;
          description?: string;
        }[];
      };
    };
  }>(
    `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${key}&appid=${appId}&l=english`,
  );
  return new Map(
    (game?.availableGameStats?.achievements || []).map((achievement) => [
      achievement.name,
      achievement,
    ]),
  );
}

export async function getSteamAchievements(
  appId: number,
): Promise<SteamAchievements | null> {
  let percentages: { name: string; percent: string | number }[];
  try {
    const response = await fetchJson<{
      achievementpercentages?: {
        achievements?: { name: string; percent: string | number }[];
      };
    }>(
      `https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/?gameid=${appId}`,
    );
    percentages = response.achievementpercentages?.achievements || [];
  } catch (error) {
    // 403: the game has no achievements
    if (error instanceof HttpError && error.status === 403) return null;
    throw error;
  }
  if (!percentages.length) return null;

  const schema = await getSchema(appId);
  const achievements: Achievement[] = percentages.map(({ name, percent }) => ({
    name,
    displayName: schema?.get(name)?.displayName,
    description: schema?.get(name)?.description,
    percent: Math.round(Number(percent) * 10) / 10,
  }));
  const sorted = achievements.map((a) => a.percent).sort((a, b) => a - b);

  return {
    count: achievements.length,
    max: sorted[sorted.length - 1],
    median: sorted[Math.floor(sorted.length / 2)],
    ...pickCompletion(achievements),
    withSchema: Boolean(schema),
  };
}
