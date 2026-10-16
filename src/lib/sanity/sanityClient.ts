import { sanityConfig } from '@/config/sanity';
import { createClient } from '@sanity/client';

const sanity = {
  instance: createClient(sanityConfig),
};

Object.freeze(sanity);

export default sanity;
