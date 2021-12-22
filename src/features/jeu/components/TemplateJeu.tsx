import styled from '@emotion/styled';
import { Game } from '@prisma/client';

import { TitleMain, Description } from '../styles';
import Banner from './Banner';
import Cover from './Cover';
import Time from './Time';

const Content = styled(`div`)`
  position: relative;
  z-index: 20;
  padding-top: ${({ theme }) => theme.spacing[16]};
  display: grid;
  grid-template-columns: 352px auto;
  grid-gap: ${({ theme }) => theme.spacing[8]};
`;

interface Props {
  game: Game;
}

const TemplateJeu = ({ game }: Props) => {
  return (
    <div>
      {game.cover && <Banner game={game} />}

      <Content className="container">
        {game.cover && <Cover game={game} />}
        <div>
          <TitleMain>
            Combien de temps faut-il pour terminer <br />
            <span className="name">{game.name}</span> ?
          </TitleMain>
          <Description>{game.description}</Description>
          <Time game={game} />
        </div>
      </Content>
    </div>
  );
};

export default TemplateJeu;
