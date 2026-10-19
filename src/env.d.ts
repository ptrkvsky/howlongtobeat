interface ImportMetaEnv {
  // Postgres, see src/db/client.ts
  readonly DATABASE_URL: string;
  // Vercel Blob URL of the GameSpot news, see scripts/fetch-gamespot.ts
  readonly PUBLIC_GAMESPOT_JSON_URL?: string;
}

interface ImportMeta {
  // Undefined when the code runs outside of Astro (scripts run with tsx)
  readonly env: ImportMetaEnv | undefined;
}
