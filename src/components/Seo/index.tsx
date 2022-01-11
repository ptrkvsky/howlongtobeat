import { FC } from 'react';
import Head from 'next/head';
import { siteInformations } from '@/config/siteInformations';
import { SeoPage } from '@/types';

interface Props {
  pageSeo?: SeoPage;
  canonicalUrl?: string;
}

const Seo: FC<Props> = ({ pageSeo, canonicalUrl }: Props) => (
  <Head>
    <title>
      {pageSeo?.metaTitle} - {`${siteInformations.title}`}
    </title>
    {pageSeo?.metaDescription && (
      <meta name="description" content={pageSeo.metaDescription} />
    )}
    <link rel="icon" href="/favicon.ico" />
    <meta name="theme-color" content={siteInformations.color || `#FFD400`} />
    {siteInformations.twitter && (
      <meta name="twitter:site" content={siteInformations.twitter} />
    )}
    {siteInformations.image && (
      <>
        <meta property="og:image" content={siteInformations.image} />
        <meta property="og:image:type" content="image/jpg" />)
      </>
    )}
    {canonicalUrl && (
      <link rel="canonical" href={`${siteInformations.url}${canonicalUrl}`} />
    )}
  </Head>
);

export default Seo;
