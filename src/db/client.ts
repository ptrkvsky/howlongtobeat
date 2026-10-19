/**
 * Shared Postgres client, for the build (Astro loads .env files into
 * import.meta.env) and the scripts (process.env, loaded from .env.local).
 * Created on first use, once the scripts have loaded their env files.
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let client: {
  db: ReturnType<typeof drizzle<typeof schema>>;
  sql: postgres.Sql;
};

export function getDb() {
  if (!client) {
    const url = import.meta.env?.DATABASE_URL ?? process.env.DATABASE_URL;
    if (!url) throw new Error(`DATABASE_URL is not set`);
    const sql = postgres(url, { max: 4 });
    client = { db: drizzle(sql, { schema }), sql };
  }
  return client;
}

// Lets a script exit: closes the connections, if any were opened
export async function closeDb() {
  await client?.sql.end();
}
