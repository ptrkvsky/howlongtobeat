import Editor from '@/components/Editor';
import Form from '@/components/Form/Form';
import { Game } from '@prisma/client';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import 'suneditor/dist/css/suneditor.min.css'; // Import Sun Editor's CSS File

const SunEditor = dynamic(() => import(`suneditor-react`), {
  ssr: false,
});

interface Props {
  game: Game;
}

type FormValues = {
  description: string;
};

const TemplateJeuAdmin = ({ game }: Props) => {
  const description = `<p>Default value</p>`;

  const onSubmit = (data: FormValues) => console.log(data);

  return (
    <Form<FormValues> onSubmit={onSubmit}>
      {({ register, formState, control }) => (
        <>
          <Editor
            name="description"
            defaultValue={game.description}
            control={control}
          />
          <button type="submit">envoyer</button>
        </>
      )}
    </Form>
  );
};

export default TemplateJeuAdmin;
