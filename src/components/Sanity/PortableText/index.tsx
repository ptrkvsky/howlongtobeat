import {
  PortableText as BasePortableText,
  PortableTextBlock,
  PortableTextComponents,
  toPlainText,
} from '@portabletext/react';
import getYouTubeId from 'get-youtube-id';
import Link from 'next/link';
import { slugify } from '@/utils/slugify';
import CloakLink from '@/components/Cloaklink';

const headingId = (value: PortableTextBlock) => slugify(toPlainText(value));

const components: PortableTextComponents = {
  block: {
    h2: ({ value, children }) => <h2 id={headingId(value)}>{children}</h2>,
    h3: ({ value, children }) => <h3 id={headingId(value)}>{children}</h3>,
    h4: ({ value, children }) => <h4 id={headingId(value)}>{children}</h4>,
    h5: ({ value, children }) => <h5 id={headingId(value)}>{children}</h5>,
    h6: ({ value, children }) => <h6 id={headingId(value)}>{children}</h6>,
  },

  types: {
    youtube: ({ value }) => {
      const id = getYouTubeId(value.url);
      return id ? (
        <iframe
          width="640"
          height="390"
          src={`https://www.youtube.com/embed/${id}`}
          title="YouTube video player"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : null;
    },
  },

  marks: {
    internalLink: ({ value, children }) => (
      <Link href={`/jeu/${value.slug.current}`}>{children}</Link>
    ),
    link: ({ value, children }) => {
      const { blank, href, cloaked, sponsored, noreferrer, ugc } = value;
      const rel = [
        blank && `noopener noreferrer`,
        sponsored && `sponsored`,
        noreferrer && `noreferrer`,
        ugc && `ugc`,
      ]
        .filter(Boolean)
        .join(` `);

      if (cloaked) {
        return <CloakLink url={href}>{children}</CloakLink>;
      }

      return (
        <a
          href={href}
          rel={rel || undefined}
          target={blank ? `_blank` : undefined}
        >
          {children}
        </a>
      );
    },
  },
};

interface Props {
  blocks: PortableTextBlock[];
}

const PortableText = ({ blocks }: Props) => (
  <BasePortableText value={blocks} components={components} />
);

export default PortableText;
