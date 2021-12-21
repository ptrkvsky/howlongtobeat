import { HomeTitle } from '@/styles/components/titles/HomeTitle';
import { Game } from '@prisma/client';
import Link from 'next/link';

interface Props {
  games: Game[];
}

const TemplateSitemap = ({ games }: Props) => {
  return (
    <>
      <HomeTitle>
        Plan du site
        <br /> {games.length} jeux
      </HomeTitle>
      <ul>
        {games.map((game) => (
          <li key={game.id}>
            <Link href={`jeu/${game.id}`}>
              <a>{game.name}</a>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export default TemplateSitemap;
