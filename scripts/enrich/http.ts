/**
 * fetch wrapper shared by the enrichment sources: JSON parsing, a minimum
 * delay between two requests to the same host, and retries with backoff on
 * 429 / 5xx / network errors.
 */
import { setTimeout as sleep } from 'node:timers/promises';

export const USER_AGENT = `game-over-enrich-poc/0.1 (https://www.game-over.io)`;

// Minimum delay between two requests to a host (ms)
const INTERVALS: Record<string, number> = {
  'query.wikidata.org': 1000,
  'api.igdb.com': 260, // 4 requests / s
  'store.steampowered.com': 1500, // ~200 requests / 5 min
  'api.steampowered.com': 300,
  'api.isthereanydeal.com': 500,
  'howlongtobeat.com': 2000,
  'steamspy.com': 1000, // appdetails: 1 request / s
};

const lastCall = new Map<string, number>();
export const requestCounts = new Map<string, number>();

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly url: string,
    body: string,
  ) {
    super(`HTTP ${status} on ${url}: ${body.slice(0, 200)}`);
  }
}

async function throttle(host: string) {
  // Reserve the slot before sleeping: concurrent callers queue up
  const interval = INTERVALS[host] ?? 250;
  const now = Date.now();
  const next = Math.max(now, (lastCall.get(host) ?? 0) + interval);
  lastCall.set(host, next);
  if (next > now) await sleep(next - now);
}

async function request<T>(
  url: string,
  init: RequestInit,
  retries: number,
  timeoutMs: number,
  parse: (response: Response) => Promise<T>,
): Promise<T> {
  const { host } = new URL(url);
  for (let attempt = 0; ; attempt++) {
    await throttle(host);
    requestCounts.set(host, (requestCounts.get(host) ?? 0) + 1);
    try {
      const response = await fetch(url, {
        ...init,
        headers: { 'User-Agent': USER_AGENT, ...init.headers },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (response.ok) return (await parse(response)) as T;
      const body = await response.text();
      const retryable = response.status === 429 || response.status >= 500;
      if (!retryable || attempt >= retries) {
        throw new HttpError(response.status, url, body);
      }
      const retryAfter = Number(response.headers.get(`retry-after`));
      await sleep(retryAfter > 0 ? retryAfter * 1000 : 2 ** attempt * 2000);
    } catch (error) {
      if (error instanceof HttpError || attempt >= retries) throw error;
      await sleep(2 ** attempt * 2000);
    }
  }
}

export async function fetchJson<T>(
  url: string,
  init: RequestInit = {},
  retries = 3,
  timeoutMs = 20_000,
): Promise<T> {
  return request(url, init, retries, timeoutMs, (response) => response.json());
}

export async function fetchText(
  url: string,
  init: RequestInit = {},
  retries = 3,
  timeoutMs = 20_000,
): Promise<string> {
  return request(url, init, retries, timeoutMs, (response) => response.text());
}

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);
