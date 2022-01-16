import Layout from '@/components/layouts/front/LayoutFront';
import { Game } from '@prisma/client';

import Banner from './Banner';

interface Props {
  countGames: number;
}

const TemplateHome = ({ countGames }: Props) => (
  <Layout cloakFooter={false}>
    <Banner countGames={countGames} />
  </Layout>
);

export default TemplateHome;
