import sanityClient from '@sanity/client';

const sanityId = process.env.SANITY_ID;
const sanityDataset = process.env.SANITY_DATASET;
const sanityToken = process.env.SANITY_TOKEN;

const sanity = {
  instance: sanityClient({
    projectId: sanityId,
    dataset: sanityDataset,
    token: sanityToken,
    useCdn: true,
  }),
};

Object.freeze(sanity);

export default sanity;
