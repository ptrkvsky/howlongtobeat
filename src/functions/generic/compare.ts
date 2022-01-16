import { SanityGame } from '@/types/sanity/SanityGame';

const compareGames = (gameA: SanityGame, gameB: SanityGame) => {
  if (gameA.name < gameB.name) {
    return -1;
  }
  if (gameA.name > gameB.name) {
    return 1;
  }
  // a must be equal to b
  return 0;
};

export default compareGames;
