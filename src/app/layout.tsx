import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import ConsoleBanner from '@/components/ConsoleBanner';
import { siteInformations } from '@/config/siteInformations';
import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteInformations.url),
  title: {
    default: siteInformations.title,
    template: `%s - ${siteInformations.title}`,
  },
  manifest: `/manifest.json`,
  icons: {
    icon: [
      { url: `/favicon.ico` },
      { url: `/icons/76x76.png`, type: `image/png`, sizes: `76x76` },
      { url: `/icons/72x72.png`, type: `image/png`, sizes: `72x72` },
    ],
    apple: `/icons/180x180.png`,
  },
  verification: {
    google: `JToiALKPVzracQqpHh9U1OEf0n1wkC9Z8VaRsUmSboo`,
  },
  twitter: {
    site: siteInformations.twitter,
  },
};

export const viewport: Viewport = {
  themeColor: `#6100FF`,
};

const gtmSnippet = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${siteInformations.tagManager}');`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${siteInformations.tagManager}`}
            height="0"
            width="0"
            style={{ display: `none`, visibility: `hidden` }}
          />
        </noscript>
        {children}
        <ConsoleBanner />
        <Script id="gtm" strategy="afterInteractive">
          {gtmSnippet}
        </Script>
      </body>
    </html>
  );
}
