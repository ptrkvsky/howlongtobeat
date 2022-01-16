const BasePortableText = require(`@sanity/block-content-to-react`);

import { sanityConfig } from '../../../config/sanity';
import Serializers from '../Serializers';

const PortableText = ({ blocks }: any) => (
  <BasePortableText
    blocks={blocks}
    serializers={Serializers()}
    {...sanityConfig}
  />
);

export default PortableText;
