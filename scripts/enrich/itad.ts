/**
 * IsThereAnyDeal API: current best price and historical low in France,
 * looked up in batches from Steam app ids.
 */
import { fetchJson } from './http';

const API = `https://api.isthereanydeal.com`;
const STEAM_SHOP = 61;

export interface Price {
  current: number;
  shop: string;
  lowest: number | null;
  lowestShop: string | null;
  currency: string;
  url: string | null;
}

interface PriceAmount {
  amount: number;
  currency: string;
}

interface Overview {
  prices: {
    id: string;
    current: { shop: { name: string }; price: PriceAmount; url: string } | null;
    lowest: { shop: { name: string }; price: PriceAmount } | null;
  }[];
}

const post = <T>(path: string, body: unknown) =>
  fetchJson<T>(`${API}${path}`, {
    method: `POST`,
    headers: {
      'ITAD-API-Key': process.env.ITAD_API_KEY!,
      'Content-Type': `application/json`,
    },
    body: JSON.stringify(body),
  });

export async function getPrices(appIds: number[]) {
  const prices = new Map<number, Price>();
  if (!appIds.length) return prices;

  // { "app/220": "<itad uuid>" | null }
  const lookup = await post<Record<string, string | null>>(
    `/lookup/id/shop/${STEAM_SHOP}/v1`,
    appIds.map((appId) => `app/${appId}`),
  );
  const appIdByItad = new Map<string, number>();
  for (const [shopId, itadId] of Object.entries(lookup)) {
    if (itadId) appIdByItad.set(itadId, Number(shopId.replace(`app/`, ``)));
  }

  const itadIds = [...appIdByItad.keys()];
  for (let i = 0; i < itadIds.length; i += 200) {
    const overview = await post<Overview>(
      `/games/overview/v2?country=FR`,
      itadIds.slice(i, i + 200),
    );
    for (const { id, current, lowest } of overview.prices) {
      const appId = appIdByItad.get(id);
      if (!appId || !current) continue;
      prices.set(appId, {
        current: current.price.amount,
        shop: current.shop.name,
        lowest: lowest?.price.amount ?? null,
        lowestShop: lowest?.shop.name ?? null,
        currency: current.price.currency,
        url: current.url ?? null,
      });
    }
  }
  return prices;
}
