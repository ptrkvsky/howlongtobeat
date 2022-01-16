import { sanityConfig } from '@/config/sanity';
import sanityClient from '@sanity/client';

const sanity = {
  instance: sanityClient(sanityConfig),
};

Object.freeze(sanity);

export default sanity;
