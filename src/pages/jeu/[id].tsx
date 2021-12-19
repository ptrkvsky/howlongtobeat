import { PrismaClient, Game } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

// This function gets called at build time
export async function getStaticPaths() {
  // Call an external API endpoint to get posts
  const games = await prisma.game.findMany();

  // Get the paths we want to pre-render based on games
  const paths = games.map((game) => ({
    params: { id: game.id.toString() },
  }));
  await prisma.$disconnect();
  // { fallback: false } means other routes should 404.
  // We'll pre-render only these paths at build time.
  return { paths, fallback: false };
}

interface PropsGetStaticProps {
  params: {
    id: number;
  };
}

// This also gets called at build time
export async function getStaticProps({ params }: PropsGetStaticProps) {
  // params contains the post `id`.
  // If the route is like /posts/1, then params.id is 1
  const game = await prisma.game.findUnique({
    where: {
      id: +params.id,
    },
  });

  const {
    data: { access_token },
  } = await axios.post(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
  );

  const configRequestGameIgdb = {
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Client-ID': `xmif5hz58mgup7xlkh4fky3ih9qcda`,
    },
  };

  const bodyRequestGameIgdb = `fields name, cover, first_release_date, artworks, screenshots, summary, rating, cover; search "${game?.name}";`;

  const gamesIgdb = (await axios.post(
    `https://api.igdb.com/v4/games/`,
    bodyRequestGameIgdb,
    configRequestGameIgdb,
  )) as any;

  const gameIgdb = gamesIgdb.data.find(
    (gameIgdb: any) => gameIgdb.name === game?.name,
  );

  // COVER
  const bodyRequestCoverIgdb = `fields url; where id = ${gameIgdb.cover};`;
  const coverIgdb = (await axios.post(
    `https://api.igdb.com/v4/covers/`,
    bodyRequestCoverIgdb,
    configRequestGameIgdb,
  )) as any;

  console.log(coverIgdb.data);

  await prisma.$disconnect();
  // Pass game data to the page via props
  return { props: { game } };
}

interface PropsGame {
  game: Game;
}

function Game({ game }: PropsGame) {
  return (
    <>
      <div>{game.name}</div>
      <div>{game.description}</div>
      <div>{game.totalPoll}</div>
    </>
  );
}

export default Game;
