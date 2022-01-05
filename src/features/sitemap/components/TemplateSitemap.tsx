import { HomeTitle } from '@/styles/components/titles/HomeTitle';
import { Game, Genre } from '@prisma/client';
import Link from 'next/link';
import Layout from '@/styles/components/layout/Layout';

interface Props {
  genres: Genre[];
  allGames: Game[];
}

const TemplateSitemap = ({ genres, allGames }: Props) => {
  return (
    <Layout games={allGames} isCentered>
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
