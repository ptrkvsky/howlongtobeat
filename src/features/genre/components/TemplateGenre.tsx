import { HomeTitle } from '@/styles/components/titles';
import { Genre } from '@prisma/client';
import Link from 'next/link';
import Layout from '@/components/layouts/front/LayoutFront';
import compareGames from '@/functions/generic/compare';
import { SanityGame } from '@/types/sanity/SanityGame';

interface Props {
  genre: Genre;
  games: SanityGame[];
}

const TemplateGenre = ({ genre, games }: Props) => {
  games.sort(compareGames);

  return (
    <Layout cloakFooter isCentered>
      <HomeTitle>
        {genre?.name}
        <br /> {games?.length} jeux
      </HomeTitle>
      <ul>
        {games.map((game) => (
          <li key={game._id}>
            <Link href={`/jeu/${game.slug.current}`}>
              <a>{game.name}</a>
            </Link>
          </li>
        ))}
      </ul>
    </Layout>
  );
};

export default TemplateGenre;
