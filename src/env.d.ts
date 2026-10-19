interface ImportMetaEnv {
  // Postgres, see src/db/client.ts
  readonly DATABASE_URL: string;
}

interface ImportMeta {
  // Undefined when the code runs outside of Astro (scripts run with tsx)
  readonly env: ImportMetaEnv | undefined;
}
