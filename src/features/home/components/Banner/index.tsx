import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Image from 'next/image';
import { SplitText } from 'gsap/dist/SplitText';
import { enterText, removeFilter, revealDescription } from './animations';
import { WrapperImage, Title, Wrapper } from './style';
import useFilter from '../../hooks/useFilter';
import banner from '@/assets/bg.jpg';
import Link from 'next/link';

gsap.registerPlugin(SplitText);

interface Props {
  countGames: number;
}

const Banner = ({ countGames }: Props) => {
  const isFiltered = useFilter();
  const refTitle = useRef<HTMLHeadingElement>(null);
  const refDescription = useRef<HTMLDivElement>(null);
  const refWrapperImage = useRef<HTMLDivElement>(null);

  // Enter animation
  useEffect(() => {
    const splitTextTitle = new SplitText(refTitle.current, {
      type: `words,chars`,
    });
    const splitDescription = new SplitText(refDescription.current, {
      type: `lines, words`,
    });

    removeFilter(refWrapperImage, 3);
    enterText(refTitle, splitTextTitle, 4.0);
    revealDescription(refDescription, splitDescription, 3.5);
  }, []);

  return (
    <Wrapper>
      <div className="container">
        <Title ref={refTitle} className="title">
          Quelle est la durée de vie de mes{` `}
          <span className="highlight">jeux favoris</span> ?
        </Title>
        <div ref={refDescription} className="description">
          Vous souhaitez savoir le temps nécessaire pour arriver au boutde votre
          dernier jeu ? Game-over recense aujourd’hui plus de{` `}
          <Link href="/plan-du-site">
            <a className="highlight"> {countGames} jeux</a>
          </Link>
          .<br /> Action, aventure, RPG, tous les genres sont représentés. Votre
          jeu ne se trouve pas dans la liste ? Enregistrez-vous et ajouter le
          facilement à notre base de données.
        </div>
      </div>
      <WrapperImage ref={refWrapperImage} className={`wrapper-image`}>
        <Image
          priority
          alt="Illustration jeux video"
          src={banner}
          layout="fill"
          objectFit="cover"
        />
      </WrapperImage>
    </Wrapper>
  );
};

export default Banner;
