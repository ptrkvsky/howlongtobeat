import Seo from '@/components/Seo';
import TemplateHome from '@/features/home/components/TemplateHome';
import { SeoPage } from '@/types';

export default function Home() {
  const pageSeo: SeoPage = {
    metaTitle: `Game Over`,
    metaDescription: `Retrouvez toutes les informations sur la duree de vie de l'ensemble de vos jeux preferes.`,
  };

  return (
    <>
      <Seo pageSeo={pageSeo} />
      <TemplateHome />
    </>
  );
}
