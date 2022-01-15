import { HomeTitle } from '@/styles/components/titles';
import { Genre } from '@prisma/client';
import Link from 'next/link';
import Layout from '@/components/layouts/front/LayoutFront';

interface Props {
  genres: Genre[];
}

const TemplateSitemap = ({ genres }: Props) => {
  return (
    <Layout isCentered>
      <HomeTitle>Plan du site</HomeTitle>
      <ul>
        {genres.map((genre) => (
          <li key={genre.id}>
            <Link href={`genre/${genre.id}`}>
              <a>{genre.name}</a>
            </Link>
          </li>
        ))}
        <li>
          <Link href={`genre/999`}>
            <a>Aucun</a>
          </Link>
        </li>
      </ul>
    </Layout>
  );
};

export default TemplateSitemap;
