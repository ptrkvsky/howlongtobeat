import { HomeTitle, List } from '@/styles/components/titles';
import Link from 'next/link';
import Layout from '@/components/layouts/front/LayoutFront';
import { SanityGenre } from '@/types/sanity/SanityGenre';

interface Props {
  genres: SanityGenre[];
}

const TemplateSitemap = ({ genres }: Props) => {
  return (
    <Layout isCentered>
      <HomeTitle>Plan du site</HomeTitle>
      <List>
        {genres.map((genre) => (
          <li key={genre._id}>
            <Link href={`genre/${genre.slug.current}`}>
              <a>{genre.name}</a>
            </Link>
          </li>
        ))}
        <li>
          <Link href={`genre/999`}>
            <a>Aucun</a>
          </Link>
        </li>
      </List>
    </Layout>
  );
};

export default TemplateSitemap;
