const sanityId = process.env.SANITY_ID;
const sanityDataset = process.env.SANITY_DATASET;
// const sanityToken = process.env.SANITY_TOKEN;

const sanityConfig = {
  projectId: sanityId,
  dataset: sanityDataset,
  apiVersion: `1`,
  // token: sanityToken,
  useCdn: true,
};

export { sanityConfig };
