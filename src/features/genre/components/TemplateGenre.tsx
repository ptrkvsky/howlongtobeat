import { HomeTitle } from '@/styles/components/titles/HomeTitle';
import { Game, Genre } from '@prisma/client';
import Link from 'next/link';
import Layout from '@/styles/components/layout/Layout';
import compareGames from '@/functions/generic/compare';

interface Props {
  genre: Genre;
  games: Game[];
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
          <li key={game.id}>
            <Link href={`/jeu/${game.id}`}>
              <a>{game.name}</a>
            </Link>
          </li>
        ))}
      </ul>
    </Layout>
  );
};

export default TemplateGenre;
