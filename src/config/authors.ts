// Authors of the /actus articles, each with a page /auteurs/<slug>. An
// article is signed by the author of its category (scripts/publish-news.ts)
import type { NewsCategory } from './news';

export const AUTHOR_SLUGS = [
  `lea-moreau`,
  `thomas-ferrand`,
  `ines-bakri`,
] as const;
export type AuthorSlug = (typeof AUTHOR_SLUGS)[number];

export interface Author {
  slug: AuthorSlug;
  name: string;
  jobTitle: string;
  // Author box under the articles
  shortBio: string;
  // Author page, as Markdown
  bio: string;
  knowsAbout: string[];
  // Year they started covering video games
  since: number;
  // Illustrated avatar, 400×400
  image: string;
  categories: NewsCategory[];
}

export const AUTHOR_IMAGE_SIZE = 400;

export const authors: Record<AuthorSlug, Author> = {
  'lea-moreau': {
    slug: `lea-moreau`,
    name: `Léa Moreau`,
    jobTitle: `Rédactrice en chef`,
    shortBio: `Léa Moreau couvre le jeu vidéo depuis 2012 et dirige les actus de Game Over. Elle a fini Elden Ring sans invocation, et elle le rappelle volontiers.`,
    bio: `Léa Moreau couvre le jeu vidéo depuis 2012. Passée par plusieurs rédactions spécialisées, elle dirige aujourd'hui les actus de Game Over : sorties, annonces et dates à retenir.

Joueuse de RPG avant tout, elle ne recule devant aucun jeu de 80 heures. Elle a fini Elden Ring sans invocation et ne manque jamais une occasion de le rappeler. C'est aussi pour ça qu'elle tient à ce que chaque actu dise combien de temps il faut pour finir le jeu dont elle parle.

Elle suit de près les grands salons, les Nintendo Direct et les State of Play, et elle garde un faible pour les jeux indépendants qui sortent sans prévenir.`,
    knowsAbout: [
      `Sorties jeux vidéo`,
      `RPG`,
      `Jeux indépendants`,
      `Nintendo`,
      `PlayStation`,
    ],
    since: 2012,
    image: `/auteurs/lea-moreau.webp`,
    categories: [`sortie`, `annonce`],
  },
  'thomas-ferrand': {
    slug: `thomas-ferrand`,
    name: `Thomas Ferrand`,
    jobTitle: `Journaliste matériel et industrie`,
    shortBio: `Ancien vendeur en boutique spécialisée, Thomas Ferrand suit les consoles, le PC et le business du jeu vidéo. Il collectionne les manettes de toutes les générations.`,
    bio: `Thomas Ferrand a passé dix ans derrière le comptoir d'une boutique de jeux vidéo avant de passer à l'écriture. De ces années, il a gardé l'habitude de répondre à la question que tout le monde se pose : « ça vaut le coup ou pas ? ».

Chez Game Over, il suit le matériel (consoles, PC, cartes graphiques, accessoires) et l'industrie : rachats, résultats financiers, studios qui ferment ou qui se lancent.

Chez lui, une étagère entière est réservée aux manettes, de la NES à la DualSense. Il jure qu'elles servent toutes encore.`,
    knowsAbout: [
      `Consoles`,
      `Matériel PC`,
      `Industrie du jeu vidéo`,
      `Xbox`,
      `Rétrogaming`,
    ],
    since: 2015,
    image: `/auteurs/thomas-ferrand.webp`,
    categories: [`materiel`, `industrie`],
  },
  'ines-bakri': {
    slug: `ines-bakri`,
    name: `Inès Bakri`,
    jobTitle: `Journaliste mises à jour et bons plans`,
    shortBio: `Inès Bakri joue aux jeux service et court après les records en speedrun. Elle lit les patch notes pour vous et chasse les promos qui en valent la peine.`,
    bio: `Inès Bakri est arrivée au jeu vidéo par les jeux service, et elle n'en est jamais vraiment repartie. Saisons, extensions, équilibrages : elle lit les patch notes en entier pour que vous n'ayez pas à le faire.

Speedrunneuse à ses heures, elle sait mieux que personne qu'un jeu peut se finir en 40 minutes comme en 40 heures. Elle s'occupe aussi des bons plans de Game Over : uniquement les promos qui valent vraiment le coup, temps de jeu à l'appui.

Quand elle ne joue pas, elle regarde les autres jouer, souvent en direct, souvent tard.`,
    knowsAbout: [
      `Mises à jour`,
      `Jeux service`,
      `Speedrun`,
      `Bons plans jeux vidéo`,
      `PC`,
    ],
    since: 2018,
    image: `/auteurs/ines-bakri.webp`,
    categories: [`mise-a-jour`, `promo`, `autre`],
  },
};

export const authorPageUrl = (slug: AuthorSlug) => `/auteurs/${slug}`;

export const authorForCategory = (category: NewsCategory): AuthorSlug =>
  Object.values(authors).find((author) => author.categories.includes(category))
    ?.slug ?? `lea-moreau`;
