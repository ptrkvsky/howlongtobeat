import Layout from '@/styles/components/layout/Layout';
import { Game } from '@prisma/client';

import Banner from './Banner';

interface Props {
  games: Game[];
}

const TemplateHome = ({ games }: Props) => (
  <Layout games={games}>
    <Banner />
  </Layout>
);

export default TemplateHome;
