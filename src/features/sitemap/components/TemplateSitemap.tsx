import { HomeTitle } from '@/styles/components/titles/HomeTitle';
import { Genre } from '@prisma/client';
import Link from 'next/link';
import Layout from '@/styles/components/layout/Layout';

interface Props {
  genres: Genre[];
}

const TemplateSitemap = ({ genres }: Props) => {
  return (
    <Layout cloakFooter isCentered>
      <HomeTitle>Plan du site</HomeTitle>
      <ul>
        {genres.map((genre) => (
          <li key={genre.id}>
            <Link href={`genre/${genre.id}`}>
              <a>{genre.name}</a>
            </Link>
          </li>
        ))}
      </ul>
    </Layout>
  );
};

export default TemplateSitemap;
