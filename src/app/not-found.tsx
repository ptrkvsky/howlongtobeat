import type { Metadata } from 'next';
import Link from 'next/link';
import Layout from '@/components/layouts/front/LayoutFront';
import { HomeTitle } from '@/styles/components/titles';

export const metadata: Metadata = {
  title: `Page introuvable`,
};

export default function NotFound() {
  return (
    <Layout isCentered>
      <HomeTitle>Game over : cette page n&apos;existe pas</HomeTitle>
      <Link href="/">Retour à l&apos;accueil</Link>
    </Layout>
  );
}
