const fetchGames = async () => {
  const res = await fetch(`/api/client/games`);
  if (res.ok) {
    return res.json();
  }
  throw new Error(`Une erreur est survenue pendant la requete`);
};

export default fetchGames;
