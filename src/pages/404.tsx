import Link from 'next/link';
import Seo from '@/components/Seo';
import Layout from '@/components/layouts/front/LayoutFront';
import { HomeTitle } from '@/styles/components/titles';

export default function NotFound() {
  return (
    <>
      <Seo pageSeo={{ metaTitle: `Page introuvable`, metaDescription: `` }} />
      <Layout isCentered>
        <HomeTitle>Game over : cette page n&apos;existe pas</HomeTitle>
        <Link href="/">Retour à l&apos;accueil</Link>
      </Layout>
    </>
  );
}
