import React from 'react';
import { getGames } from '@/features/jeu/api';
import { siteInformations } from '@/config/siteInformations';
import SitemapGenerator from '@/scripts/SitemapGenerator';
import { NextPageContext } from 'next';
import { getAllGenres } from '@/functions/getAllGenres';

const getUrls = async () => {
  // static pages
  const staticPages = [
    `${siteInformations.url}/`,
    `${siteInformations.url}/mentions-legales`,
    `${siteInformations.url}/plan-du-site`,
    `${siteInformations.url}/politique-de-confidentialite`,
  ];

  // games
  const games = await getGames();
  const gamesUrl = games?.map(
    (game) => `${siteInformations.url}/jeu/${game.slug.current}`,
  );

  // genres
  const genres = await getAllGenres();

  const genresUrl = genres?.map(
    (genre) => `${siteInformations.url}/genre/${genre.slug.current}`,
  );

  const urls = genresUrl &&
    gamesUrl && [...staticPages, ...gamesUrl, ...genresUrl];

  return urls;
};

class Sitemap extends React.Component {
  static async getInitialProps({ res }: NextPageContext) {
    const baseUrl = siteInformations.url;
    const urls = await getUrls();
    if (urls) {
      const siteMapGenerator = new SitemapGenerator(baseUrl, urls);
      const siteMap = siteMapGenerator.getSitemap();

      res?.setHeader(`Content-Type`, `text/xml`);

      res?.write(siteMap);
      res?.end();
    }
  }
}

export default Sitemap;
