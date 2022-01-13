import Layout from '@/components/layouts/front/LayoutFront';
import { Game } from '@prisma/client';

import Banner from './Banner';

interface Props {
  games: Game[];
}

const TemplateHome = ({ games }: Props) => (
  <Layout cloakFooter={false} games={games}>
    <Banner games={games} />
  </Layout>
);

export default TemplateHome;
