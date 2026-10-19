/**
 * Exact match by HowLongToBeat id through Wikidata:
 * P2816 = HowLongToBeat ID, P5794 = IGDB game ID (slug), P1733 = Steam app ID.
 */
import { fetchJson } from './http';

const ENDPOINT = `https://query.wikidata.org/sparql`;

export interface WikidataIds {
  qid: string;
  igdb: string[];
  steam: number[];
}

interface SparqlResponse {
  results: { bindings: Record<string, { value: string } | undefined>[] };
}

async function sparql(query: string) {
  const { results } = await fetchJson<SparqlResponse>(ENDPOINT, {
    method: `POST`,
    headers: {
      Accept: `application/sparql-results+json`,
      'Content-Type': `application/x-www-form-urlencoded`,
    },
    body: new URLSearchParams({ query }),
  });
  return results.bindings;
}

// Fails fast if the properties no longer mean what this module expects
export async function checkWikidata() {
  const rows = await sparql(
    `SELECT ?hltb WHERE { wd:Q12395 wdt:P2816 ?hltb }`, // The Legend of Zelda
  );
  if (!rows.some((row) => row.hltb?.value === `10025`)) {
    throw new Error(
      `Wikidata check failed: P2816 no longer maps Q12395 → 10025`,
    );
  }
}

export async function getWikidataIds(hltbIds: number[]) {
  const byHltb = new Map<number, WikidataIds>();
  for (let i = 0; i < hltbIds.length; i += 200) {
    const values = hltbIds
      .slice(i, i + 200)
      .map((id) => `"${id}"`)
      .join(` `);
    const rows = await sparql(`SELECT ?item ?hltb ?igdb ?steam WHERE {
      VALUES ?hltb { ${values} }
      ?item wdt:P2816 ?hltb .
      OPTIONAL { ?item wdt:P5794 ?igdb }
      OPTIONAL { ?item wdt:P1733 ?steam }
    }`);
    for (const row of rows) {
      const hltb = Number(row.hltb!.value);
      const ids = byHltb.get(hltb) ?? {
        qid: row.item!.value.split(`/`).pop()!,
        igdb: [],
        steam: [],
      };
      const igdb = row.igdb?.value;
      const steam = Number(row.steam?.value);
      if (igdb && !ids.igdb.includes(igdb)) ids.igdb.push(igdb);
      if (steam && !ids.steam.includes(steam)) ids.steam.push(steam);
      byHltb.set(hltb, ids);
    }
  }
  return byHltb;
}

export interface WikidataHltbItem {
  qid: string;
  hltb: number;
  label: string | null;
  // Number of Wikipedia (and sister project) pages: a notoriety signal
  sitelinks: number;
  steam: number | null;
  igdb: string | null;
}

// Every item with a HowLongToBeat id, in one query (~50,000 rows, ~10 s)
export async function getAllHltbItems() {
  const rows = await sparql(`SELECT ?item ?hltb ?sitelinks ?label
    (SAMPLE(?steam) AS ?steamId) (SAMPLE(?igdb) AS ?igdbId) WHERE {
      ?item wdt:P2816 ?hltb ; wikibase:sitelinks ?sitelinks .
      OPTIONAL { ?item wdt:P1733 ?steam }
      OPTIONAL { ?item wdt:P5794 ?igdb }
      OPTIONAL { ?item rdfs:label ?label FILTER(LANG(?label) = "en") }
    } GROUP BY ?item ?hltb ?sitelinks ?label`);
  const byHltb = new Map<number, WikidataHltbItem>();
  for (const row of rows) {
    const hltb = Number(row.hltb!.value);
    if (!Number.isInteger(hltb) || hltb <= 0) continue;
    const item: WikidataHltbItem = {
      qid: row.item!.value.split(`/`).pop()!,
      hltb,
      label: row.label?.value ?? null,
      sitelinks: Number(row.sitelinks!.value),
      steam: Number(row.steamId?.value) || null,
      igdb: row.igdbId?.value ?? null,
    };
    // Duplicate HLTB ids (several items): keep the best known one
    const existing = byHltb.get(hltb);
    if (!existing || item.sitelinks > existing.sitelinks)
      byHltb.set(hltb, item);
  }
  return byHltb;
}
