// Read at build time (Astro loads the .env files into import.meta.env)
const sanityConfig = {
  projectId: import.meta.env.SANITY_ID,
  dataset: import.meta.env.SANITY_DATASET,
  apiVersion: `2024-01-01`,
  useCdn: true,
};

export { sanityConfig };
