import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { defineConfig } from 'drizzle-kit';

// drizzle-kit loads .env itself: .env.local must win over it
for (const file of [`.env`, `.env.local`]) {
  if (existsSync(file)) {
    Object.assign(process.env, parseEnv(readFileSync(file, `utf8`)));
  }
}

export default defineConfig({
  dialect: `postgresql`,
  schema: `./src/db/schema.ts`,
  out: `./drizzle`,
  dbCredentials: { url: process.env.DATABASE_URL! },
  strict: true,
});
