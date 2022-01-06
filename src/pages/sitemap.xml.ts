import React from 'react';
import { findAllGames } from '@/functions/findAllGames';
import { siteInformations } from '@/config/siteInformations';
import SitemapGenerator from '@/scripts/SitemapGenerator';
import DBClient from '@/prisma/DBClient';
import { NextPageContext } from 'next';

const prisma = DBClient.instance;

const getUrls = async () => {
  // static pages
  const staticPages = [
    `/`,
    `/mentions-legales`,
    `/plan-du-site`,
    `/politique-de-confidentialite`,
  ];

  // games
  const games = await findAllGames();
  const gamesUrl = games.map(
    (game) => `${siteInformations.url}/jeu/${game.id}`,
  );
  await prisma.$disconnect();
  // genres
  const genres = await findAllGames();
  const genresUrl = genres.map(
    (game) => `${siteInformations.url}/genre/${game.id}`,
  );
  await prisma.$disconnect();

  const urls = [...staticPages, ...gamesUrl, ...genresUrl];

  return urls;
};

class Sitemap extends React.Component {
  static async getInitialProps({ res }: NextPageContext) {
    const baseUrl = siteInformations.url;
    const urls = await getUrls();
    const siteMapGenerator = new SitemapGenerator(baseUrl, urls);
    const siteMap = siteMapGenerator.getSitemap();

    res?.setHeader(`Content-Type`, `text/xml`);

    res?.write(siteMap);
    res?.end();
  }
}

export default Sitemap;
