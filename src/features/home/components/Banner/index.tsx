import Image from 'next/image';
import Link from 'next/link';
import banner from '@/assets/bg.jpg';
import styles from './banner.module.css';

interface Props {
  countGames: number;
}

const Banner = ({ countGames }: Props) => {
  return (
    <div className={styles.wrapper}>
      <div className="container">
        <h1 className={styles.title}>
          Quelle est la durée de vie de mes{` `}
          <span className={styles.highlight}>jeux favoris</span> ?
        </h1>
        <div className={styles.description}>
          Vous souhaitez savoir le temps nécessaire pour arriver au boutde votre
          dernier jeu ? Game-over recense aujourd’hui plus de{` `}
          <Link href="/plan-du-site" className={styles.highlight}>
            {` `}
            {countGames} jeux
          </Link>
          .<br /> Action, aventure, RPG, tous les genres sont représentés. Votre
          jeu ne se trouve pas dans la liste ? Enregistrez-vous et ajouter le
          facilement à notre base de données.
        </div>
      </div>
      <div className={styles.wrapperImage}>
        <Image
          priority
          alt="Illustration jeux video"
          src={banner}
          fill
          sizes="100vw"
          placeholder="blur"
          style={{ objectFit: `cover` }}
        />
      </div>
    </div>
  );
};

export default Banner;
