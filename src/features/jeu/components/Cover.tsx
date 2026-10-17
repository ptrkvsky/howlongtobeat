import { SanityGameSummary } from '@/types/sanity/SanityGame';
import Image from 'next/image';

interface Props {
  game: SanityGameSummary;
  priority?: boolean;
}

const Cover = ({ game, priority = false }: Props) => {
  return (
    <div style={{ position: `relative`, width: 352, height: 469 }}>
      <Image
        priority={priority}
        alt={game.name}
        src={`https:${game.cover}`}
        width={352}
        height={469}
        sizes="352px"
        style={{ width: `100%`, height: `auto` }}
      />
    </div>
  );
};

export default Cover;
