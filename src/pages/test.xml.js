import React from 'react';
import { findAllGames } from '@/functions/findAllGames';
import { siteInformations } from '@/config/siteInformations';

const createSitemap = (games) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${games
          .map((game) => {
            return (
              game &&
              `
                <url>
                    <loc>${`${siteInformations.url}/jeu/${game.id}`}</loc>
                </url>
            `
            );
          })
          .join('')}
    </urlset>
    `;
};

class Sitemap extends React.Component {
  static async getInitialProps({ res }) {
    const games = await findAllGames();

    res.setHeader('Content-Type', 'text/xml');

    res.write(createSitemap(games));
    res.end();
  }
}

export default Sitemap;
