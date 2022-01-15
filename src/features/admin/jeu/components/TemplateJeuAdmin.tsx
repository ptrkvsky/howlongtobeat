import Editor from '@/components/Editor';
import { DetailTitle } from '@/styles/components/titles';
import { Game } from '@prisma/client';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import 'suneditor/dist/css/suneditor.min.css'; // Import Sun Editor's CSS File
import FormJeu from './FormJeu/FormJeu';

const SunEditor = dynamic(() => import(`suneditor-react`), {
  ssr: false,
});

interface Props {
  game: Game;
}

const TemplateJeuAdmin = ({ game }: Props) => {
  return (
    <>
      <DetailTitle>Edition : {game.name}</DetailTitle>
      <FormJeu game={game} />
    </>
  );
};

export default TemplateJeuAdmin;
