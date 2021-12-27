import React, { useState, FC } from 'react';
import Link from 'next/link';

interface Props {
  url: string;
  children: React.ReactNode;
}

const CloakLink: FC<Props> = ({ url, children }: Props): JSX.Element => {
  const [isCloaked, setIsCloaked] = useState(true);

  return (
    <div
      style={{ display: `inline-block` }}
      onMouseEnter={() => setIsCloaked(false)}
      onMouseLeave={() => setIsCloaked(true)}
    >
      {isCloaked ? (
        <span className="daclok">{children}</span>
      ) : (
        <Link href={url}>
          <a className="daclok">{children}</a>
        </Link>
      )}
    </div>
  );
};

export default CloakLink;
