import { HomeTitle } from '@/styles/components/titles';
import { SanityGenre } from '@/types/sanity/SanityGenre';
import Link from 'next/link';
import Layout from '@/components/layouts/front/LayoutFront';
import compareGames from '@/functions/generic/compare';
import { SanityGame } from '@/types/sanity/SanityGame';

interface Props {
  genre: SanityGenre;
  games: SanityGame[];
}

const TemplateGenre = ({ genre, games }: Props) => {
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
