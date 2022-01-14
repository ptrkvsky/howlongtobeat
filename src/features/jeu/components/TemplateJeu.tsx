import Layout from '@/components/layouts/front/LayoutFront';
import { breakpoints } from '@/styles/foundations';
import styled from '@emotion/styled';
import { Game } from '@prisma/client';
import { TitleMain, Description } from '../styles';
import Banner from './Banner';
import CircularBar from './CircularBar';
import Cover from './Cover';
import RelatedGames from './RelatedGames';
import Time from './Time';

const Content = styled(`div`)`
  position: relative;
  z-index: 20;
  padding-top: ${({ theme }) => theme.spacing[16]};
  display: grid;
  grid-template-columns: 352px auto;
  grid-gap: ${({ theme }) => theme.spacing[8]};

  ${breakpoints.tabletLandscape} {
    grid-template-columns: auto;

    .cover {
      display: flex;
      justify-content: center;
    }
  }
`;

interface Props {
  game: Game;
  relatedGames: Game[];
}

const TemplateJeu = ({ game, relatedGames }: Props) => {
  return (
    <Layout>
      {game.cover && <Banner game={game} />}

      <Content className="container">
        <div className="cover">{game.cover && <Cover game={game} />}</div>
        {game.rating && <CircularBar percentage={game.rating} />}
        <div>
          <TitleMain>
            Combien de temps faut-il pour terminer <br />
            <span className="name">{game.name}</span> ?
          </TitleMain>
          <Description>{game.description.replace(`..,`, `.`)}</Description>
          <Time game={game} />
        </div>
      </Content>
      <div className="container">
        <RelatedGames relatedGames={relatedGames} />
      </div>
    </Layout>
  );
};

export default TemplateJeu;
