import Seo from '@/components/Seo';
import TemplateJeu from '@/features/jeu/components/TemplateJeu';
import { getGames, getGame, getRelatedGames } from '@/features/jeu/api';
import { SanityGame, SanityGameSummary } from '@/types/sanity/SanityGame';
import { GetStaticPaths, GetStaticProps } from 'next';

type Params = { slug: string };

// Static export: every game page is generated at build time
export const getStaticPaths: GetStaticPaths<Params> = async () => {
  const allGames = await getGames();

  const paths = allGames.map((game) => ({
    params: { slug: game.slug.current },
  }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<PropsGame, Params> = async ({
  params,
}) => {
  const game = params && (await getGame(params.slug));

  if (!game) {
    return { notFound: true };
  }

  const relatedGames = await getRelatedGames(game);

  return {
    props: { game, relatedGames },
  };
};

interface PropsGame {
  game: SanityGame;
  relatedGames: SanityGameSummary[];
}

function Game({ game, relatedGames = [] }: PropsGame) {
  const pageSeo = {
    metaTitle: `Combien de temps faut-il pour terminer ${game.name} ?`,
    metaDescription: `Découvrez la durée de vie de ${game.name}. Quel temps vous faudra t-il pour voir la fin.`,
  };

  return (
    <>
      <Seo pageSeo={pageSeo} canonicalUrl={`/jeu/${game.slug.current}`} />
      <TemplateJeu game={game} relatedGames={relatedGames} />
    </>
  );
}

export default Game;
